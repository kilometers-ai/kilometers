// Kilometers.ai API - CI/CD Pipeline Test
using Microsoft.EntityFrameworkCore;
using Azure.Identity;
using Azure.Extensions.AspNetCore.Configuration.Secrets;
using Kilometers.Api.Domain.Events;
using Kilometers.Api.Domain.Services;
using Kilometers.Api.Infrastructure.EventStore;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Diagnostics.HealthChecks;
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
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

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
            // More restrictive CORS in production
            policy.WithOrigins("https://*.kilometers.ai") // Update with your domain
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

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors();

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
app.MapGet("/", () => new
{
    service = "Kilometers.Api",
    version = "1.0.0",
    environment = app.Environment.EnvironmentName,
    timestamp = DateTime.UtcNow
});

// app.MapGet("/health", (IEventStore eventStore) => new
// {
//     status = "healthy",
//     timestamp = DateTime.UtcNow,
//     environment = app.Environment.EnvironmentName
// });

app.MapPost("/api/events", async (MpcEventDto eventDto, IEventStore eventStore, ILogger<Program> logger) =>
{
    try
    {
        // Convert base64 payload to bytes
        byte[] payloadBytes;
        try
        {
            payloadBytes = Convert.FromBase64String(eventDto.Payload);
        }
        catch (FormatException)
        {
            logger.LogWarning("Invalid base64 payload for event {EventId}, treating as UTF8 text", eventDto.Id);
            payloadBytes = System.Text.Encoding.UTF8.GetBytes(eventDto.Payload);
        }

        var mpcEvent = new MpcEvent
        {
            Id = eventDto.Id,
            Timestamp = eventDto.Timestamp,
            CustomerId = eventDto.CustomerId ?? "default",
            Direction = eventDto.Direction,
            Method = eventDto.Method,
            Payload = payloadBytes,
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

        logger.LogInformation("Event {EventId} processed successfully for customer {CustomerId}", eventDto.Id, mpcEvent.CustomerId);
        return Results.Ok(new { success = true, eventId = eventDto.Id });
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Failed to process event {EventId}: {ErrorMessage}", eventDto.Id, ex.Message);
        return Results.BadRequest(new { success = false, error = ex.Message });
    }
});

app.MapPost("/api/events/batch", async (EventBatchDto batch, IEventStore eventStore, ILogger<Program> logger) =>
{
    try
    {
        var events = batch.Events.Select(dto =>
        {
            // Convert base64 payload to bytes with fallback
            byte[] payloadBytes;
            try
            {
                payloadBytes = Convert.FromBase64String(dto.Payload);
            }
            catch (FormatException)
            {
                logger.LogWarning("Invalid base64 payload for event {EventId}, treating as UTF8 text", dto.Id);
                payloadBytes = System.Text.Encoding.UTF8.GetBytes(dto.Payload);
            }

            return new MpcEvent
            {
                Id = dto.Id,
                Timestamp = dto.Timestamp,
                CustomerId = dto.CustomerId ?? "default",
                Direction = dto.Direction,
                Method = dto.Method,
                Payload = payloadBytes,
                Size = dto.Size,
                Metadata = new EventMetadata
                {
                    ProcessedAt = DateTime.UtcNow,
                    Source = "CLI",
                    Version = "1.0.0",
                    RiskScore = CalculateRiskScore(dto),
                    CostEstimate = CalculateCostEstimate(dto)
                }
            };
        }).ToList();

        await eventStore.AppendBatchAsync(events);

        logger.LogInformation("Batch of {Count} events processed successfully", events.Count);
        return Results.Ok(new { success = true, eventsProcessed = events.Count });
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Failed to process event batch: {ErrorMessage}", ex.Message);
        return Results.BadRequest(new { success = false, error = ex.Message });
    }
});

app.MapGet("/api/activity", async (IEventStore eventStore, string? customerId = "default", int limit = 10) =>
{
    try
    {
        var events = await eventStore.GetRecentAsync(customerId ?? "default", limit);

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
        return Results.BadRequest(new { error = ex.Message });
    }
});

app.MapGet("/api/stats", async (IEventStore eventStore, string? customerId = "default") =>
{
    try
    {
        var stats = await eventStore.GetStatsAsync(customerId ?? "default");
        return Results.Ok(stats);
    }
    catch (Exception ex)
    {
        return Results.BadRequest(new { error = ex.Message });
    }
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

// DTOs - Note: These duplicate the ones in Domain/Events but are needed for the API endpoints
// TODO: Refactor to use the domain DTOs directly
public record MpcEventDto(
    string Id,
    DateTime Timestamp,
    string? CustomerId,
    string Direction,
    string? Method,
    string Payload,
    int Size);

public record EventBatchDto(List<MpcEventDto> Events);

public record EventMetadata
{
    public DateTime ProcessedAt { get; set; }
    public string Source { get; set; } = string.Empty;
    public string Version { get; set; } = string.Empty;
    public int? RiskScore { get; set; }
    public decimal? CostEstimate { get; set; }
}

public record MpcEvent
{
    public string Id { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public string CustomerId { get; set; } = string.Empty;
    public string Direction { get; set; } = string.Empty;
    public string? Method { get; set; }
    public byte[] Payload { get; set; } = Array.Empty<byte>();
    public int Size { get; set; }
    public EventMetadata Metadata { get; set; } = new();
}

// ActivityStats is now defined in Domain.Services.IEventStore
