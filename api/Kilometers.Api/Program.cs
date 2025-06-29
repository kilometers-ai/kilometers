using Microsoft.EntityFrameworkCore;
using Azure.Identity;
using Azure.Extensions.AspNetCore.Configuration.Secrets;
using Kilometers.Api.Domain.Services;
using Kilometers.Api.Infrastructure.EventStore;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.Extensions.Options;
using System.Text.Encodings.Web;
using Kilometers.Api.Auth;
using Kilometers.Api.Services;
using Kilometers.Api.Models;
using Kilometers.Api.Domain.Events;









var builder = WebApplication.CreateBuilder(args);

// Add Azure Key Vault configuration in production.
if (builder.Environment.IsProduction())
{
    var keyVaultUri = builder.Configuration["KeyVault:VaultUri"];
    if (!string.IsNullOrEmpty(keyVaultUri))
    {
        builder.Configuration.AddAzureKeyVault(
            new Uri(keyVaultUri),
            new DefaultAzureCredential(),
            new AzureKeyVaultConfigurationOptions
            {
                Manager = new KeyVaultSecretManager()
            });
    }
}

// Add services to the container
builder.Services.AddControllers();

// 🔧 Configure JSON serialization to handle camelCase from CLI
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    options.SerializerOptions.PropertyNameCaseInsensitive = true;
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 🔐 ADD API KEY AUTHENTICATION
builder.Services.AddAuthentication(ApiKeyAuthenticationSchemeOptions.DefaultScheme)
    .AddScheme<ApiKeyAuthenticationSchemeOptions, ApiKeyAuthenticationHandler>(
        ApiKeyAuthenticationSchemeOptions.DefaultScheme,
        options => { });

builder.Services.AddAuthorization();
builder.Services.AddScoped<ICustomerService, CustomerService>();

// Add Application Insights telemetry
if (builder.Environment.IsProduction())
{
    builder.Services.AddApplicationInsightsTelemetry();
}

// Database configuration
var connectionString = builder.Configuration.GetConnectionString("Default");

if (builder.Environment.IsDevelopment() || string.IsNullOrEmpty(connectionString))
{
    // Use in-memory store for development
    builder.Services.AddSingleton<IEventStore, InMemoryEventStore>();
}
else
{
    // Use PostgreSQL for production
    builder.Services.AddDbContext<KilometersDbContext>(options =>
        options.UseNpgsql(connectionString, npgsqlOptions =>
        {
            npgsqlOptions.EnableRetryOnFailure(
                maxRetryCount: 3,
                maxRetryDelay: TimeSpan.FromSeconds(30),
                errorCodesToAdd: null);
        }));

    builder.Services.AddScoped<IEventStore, PostgresEventStore>();
}

// CORS configuration
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        }
        else
        {
            // More restrictive CORS in production - explicit domains required
            policy.WithOrigins(
                      "https://app.kilometers.ai",        // Production dashboard
                      "https://app.dev.kilometers.ai",    // Development dashboard  
                      "https://kilometers.ai",            // Marketing site
                      "https://www.kilometers.ai"         // Marketing site www
                  )
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials();
        }
    });
});

// Health checks
var healthChecks = builder.Services.AddHealthChecks()
    .AddCheck("api", () => HealthCheckResult.Healthy("API is running"));

// Only add PostgreSQL health check in production when using PostgreSQL
if (!builder.Environment.IsDevelopment() && !string.IsNullOrEmpty(connectionString))
{
    healthChecks.AddNpgSql(connectionString);
}

// Add HTTP request/response logging for development
if (builder.Environment.IsDevelopment())
{
    builder.Services.AddHttpLogging(logging =>
    {
        logging.LoggingFields = Microsoft.AspNetCore.HttpLogging.HttpLoggingFields.All;
        logging.RequestHeaders.Add("Origin");
        logging.RequestHeaders.Add("Referer");
        logging.RequestHeaders.Add("User-Agent");
        logging.ResponseHeaders.Add("Access-Control-Allow-Origin");
        logging.MediaTypeOptions.AddText("application/json");
        logging.RequestBodyLogLimit = 4096;
        logging.ResponseBodyLogLimit = 4096;
    });
}

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseHttpLogging(); // Enable HTTP logging in development
}

app.UseHttpsRedirection();
app.UseCors();

// 🔐 USE AUTHENTICATION MIDDLEWARE
app.UseAuthentication();
app.UseAuthorization();

// Health check endpoints
app.MapHealthChecks("/health");

// Ensure database is created and migrated in production
if (!app.Environment.IsDevelopment())
{
    using (var scope = app.Services.CreateScope())
    {
        var context = scope.ServiceProvider.GetService<KilometersDbContext>();
        if (context != null)
        {
            try
            {
                context.Database.Migrate();
                app.Logger.LogInformation("Database migration completed successfully");
            }
            catch (Exception ex)
            {
                app.Logger.LogError(ex, "Failed to migrate database");
                throw;
            }
        }
    }
}

// API endpoints
app.MapGet("/", (ILogger<Program> logger) =>
{
    logger.LogInformation("Service info endpoint called");
    return new
    {
        service = "Kilometers.Api",
        version = "1.0.0",
        environment = app.Environment.EnvironmentName,
        timestamp = DateTime.UtcNow
    };
});

// 🔐 PROTECTED: Single Event Endpoint - Customer from Bearer token
app.MapPost("/api/events", [Authorize] async (
    MpcEventDto eventDto,
    IEventStore eventStore,
    ILogger<Program> logger,
    ClaimsPrincipal user) =>
{
    var customerApiKeyHash = user.GetApiKeyHash();
    var customerPrefix = user.GetApiKeyPrefix();

    logger.LogInformation("Received single event {EventId} from customer {CustomerPrefix} - {Direction} {Method}",
        eventDto.Id, customerPrefix, eventDto.Direction, eventDto.Method ?? "unknown");

    try
    {
        var mpcEvent = new MpcEvent
        {
            Id = eventDto.Id,
            Timestamp = eventDto.Timestamp,
            CustomerApiKeyHash = customerApiKeyHash!, // From authenticated user
            Direction = eventDto.Direction,
            Method = eventDto.Method,
            Payload = eventDto.Payload, // Already byte[] in domain DTO
            Size = eventDto.Size,
            Metadata = new EventMetadata
            {
                ProcessedAt = DateTime.UtcNow,
                Source = "CLI",
                Version = "1.0.0",
                RiskScore = CalculateRiskScore(eventDto),
                CostEstimate = CalculateCostEstimate(eventDto)
            }
        };

        await eventStore.AppendAsync(mpcEvent);

        logger.LogInformation("Event {EventId} processed successfully for customer {CustomerPrefix}",
            eventDto.Id, customerPrefix);
        return Results.Ok(new { success = true, eventId = eventDto.Id });
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Failed to process event {EventId}: {ErrorMessage}", eventDto.Id, ex.Message);
        return Results.BadRequest(new { success = false, error = ex.Message });
    }
});

// 🔐 PROTECTED: Batch Events Endpoint - Customer from Bearer token
app.MapPost("/api/events/batch", [Authorize] async (
    MpcEventBatchDto batch,
    IEventStore eventStore,
    ILogger<Program> logger,
    ClaimsPrincipal user) =>
{
    var customerApiKeyHash = user.GetApiKeyHash();
    var customerPrefix = user.GetApiKeyPrefix();

    logger.LogInformation("Received event batch with {Count} events from customer {CustomerPrefix}, CLI version {CliVersion}",
        batch.Events.Count, customerPrefix, batch.CliVersion ?? "unknown");

    try
    {
        // DEBUG: Log exact hash being used for storage
        logger.LogInformation("🔍 STORAGE DEBUG: customerApiKeyHash='{Hash}', customerPrefix='{Prefix}'",
            customerApiKeyHash, customerPrefix);

        var events = batch.Events.Select(dto =>
        {
            return new MpcEvent
            {
                Id = dto.Id,
                Timestamp = dto.Timestamp,
                CustomerApiKeyHash = customerApiKeyHash!, // From authenticated user
                Direction = dto.Direction,
                Method = dto.Method,
                Payload = dto.Payload, // Already byte[] in domain DTO
                Size = dto.Size,
                Metadata = new EventMetadata
                {
                    ProcessedAt = DateTime.UtcNow,
                    Source = "CLI",
                    Version = batch.CliVersion,
                    RiskScore = CalculateRiskScore(dto),
                    CostEstimate = CalculateCostEstimate(dto)
                }
            };
        }).ToList();

        await eventStore.AppendBatchAsync(events);

        logger.LogInformation("Batch of {Count} events processed successfully for customer {CustomerPrefix}",
            events.Count, customerPrefix);
        return Results.Ok(new { success = true, eventsProcessed = events.Count });
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Failed to process event batch: {ErrorMessage}", ex.Message);
        return Results.BadRequest(new { success = false, error = ex.Message });
    }
});

// 🔐 PROTECTED: Activity Endpoint - Customer from Bearer token (NO customerId parameter)
app.MapGet("/api/activity", [Authorize] async (
    IEventStore eventStore,
    ILogger<Program> logger,
    ClaimsPrincipal user,
    int limit = 10) =>
{
    var customerApiKeyHash = user.GetApiKeyHash();
    var customerPrefix = user.GetApiKeyPrefix();

    logger.LogInformation("Activity endpoint called for customer {CustomerPrefix}, limit: {Limit}",
        customerPrefix, limit);

    // DEBUG: Log exact hash being used for retrieval
    logger.LogInformation("🔍 RETRIEVAL DEBUG: customerApiKeyHash='{Hash}', customerPrefix='{Prefix}'",
        customerApiKeyHash, customerPrefix);

    try
    {
        var events = await eventStore.GetRecentAsync(customerApiKeyHash!, limit);
        logger.LogInformation("Retrieved {Count} events for customer {CustomerPrefix}",
            events.Count, customerPrefix);

        var activity = events.Select(e => new
        {
            e.Id,
            e.Timestamp,
            e.Direction,
            e.Method,
            PayloadPreview = GetPayloadPreview(e.Payload),
            e.Size,
            ProcessedAt = e.Metadata.ProcessedAt,
            Source = e.Metadata.Source,
            RiskScore = e.Metadata.RiskScore,
            CostEstimate = e.Metadata.CostEstimate
        }).ToList();

        return Results.Ok(activity);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Failed to retrieve activity for customer {CustomerPrefix}: {ErrorMessage}",
            customerPrefix, ex.Message);
        return Results.BadRequest(new { error = ex.Message });
    }
});

// 🔐 PROTECTED: Stats Endpoint - Customer from Bearer token (NO customerId parameter)
app.MapGet("/api/stats", [Authorize] async (
    IEventStore eventStore,
    ILogger<Program> logger,
    ClaimsPrincipal user) =>
{
    var customerApiKeyHash = user.GetApiKeyHash();
    var customerPrefix = user.GetApiKeyPrefix();

    logger.LogInformation("Stats endpoint called for customer {CustomerPrefix}", customerPrefix);

    try
    {
        var stats = await eventStore.GetStatsAsync(customerApiKeyHash!);
        logger.LogInformation("Retrieved stats for customer {CustomerPrefix}: {TotalEvents} events, ${TotalCost} cost",
            customerPrefix, stats.TotalEvents, stats.TotalCost);
        return Results.Ok(stats);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Failed to retrieve stats for customer {CustomerPrefix}: {ErrorMessage}",
            customerPrefix, ex.Message);
        return Results.BadRequest(new { error = ex.Message });
    }
});

// 🔐 PROTECTED: Customer Info Endpoint (NEW)
app.MapGet("/api/customer", [Authorize] async (ClaimsPrincipal user) =>
{
    return Results.Ok(new
    {
        apiKeyPrefix = user.GetApiKeyPrefix(),
        email = user.GetCustomerEmail(),
        organization = user.GetCustomerOrganization(),
        authenticatedAt = DateTime.UtcNow
    });
});

app.Run();

// Helper methods
static int? CalculateRiskScore(MpcEventDto eventDto)
{
    // Simple risk scoring based on method and payload size
    int risk = 0;

    if (eventDto.Method?.Contains("file") == true) risk += 20;
    if (eventDto.Method?.Contains("execute") == true) risk += 30;
    if (eventDto.Method?.Contains("shell") == true) risk += 40;
    if (eventDto.Size > 10000) risk += 10;

    return Math.Min(risk, 100);
}

static decimal? CalculateCostEstimate(MpcEventDto eventDto)
{
    // Simple cost calculation: $0.001 per KB
    return (decimal)eventDto.Size / 1024 * 0.001m;
}

static string GetPayloadPreview(byte[] payload)
{
    try
    {
        var text = System.Text.Encoding.UTF8.GetString(payload);
        return text.Length > 100 ? text[..100] + "..." : text;
    }
    catch
    {
        return $"[Binary data: {payload.Length} bytes]";
    }
}


