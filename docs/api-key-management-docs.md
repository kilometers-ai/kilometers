# Kilometers API Key Management System

## Overview

The Kilometers API uses a two-tier authentication system:
1. **Master API Key** - For admin operations (created by Terraform)
2. **Customer API Keys** - For individual users/customers (managed via API)

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   CLI Client    │────▶│   API Gateway   │────▶│   Database      │
│  (Customer Key) │     │ (Key Validation)│     │  (Usage Stats)  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Implementation Guide

### 1. Database Schema

Create a new migration:
```bash
dotnet ef migrations add AddApiKeyManagement
```

Migration code:
```csharp
public partial class AddApiKeyManagement : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "ApiKeys",
            columns: table => new
            {
                Id = table.Column<Guid>(nullable: false),
                KeyHash = table.Column<string>(maxLength: 256, nullable: false),
                KeyPrefix = table.Column<string>(maxLength: 10, nullable: false),
                CustomerId = table.Column<string>(maxLength: 128, nullable: false),
                CustomerEmail = table.Column<string>(maxLength: 256, nullable: false),
                CustomerName = table.Column<string>(maxLength: 256, nullable: true),
                Description = table.Column<string>(maxLength: 500, nullable: true),
                CreatedAt = table.Column<DateTime>(nullable: false),
                LastUsedAt = table.Column<DateTime>(nullable: true),
                ExpiresAt = table.Column<DateTime>(nullable: true),
                RevokedAt = table.Column<DateTime>(nullable: true),
                RevokedReason = table.Column<string>(maxLength: 500, nullable: true),
                RequestCount = table.Column<long>(nullable: false, defaultValue: 0),
                MonthlyRequestCount = table.Column<long>(nullable: false, defaultValue: 0),
                LastResetDate = table.Column<DateTime>(nullable: false),
                RateLimitPerHour = table.Column<int>(nullable: false, defaultValue: 1000),
                Scopes = table.Column<string>(nullable: true) // JSON array
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_ApiKeys", x => x.Id);
            });

        migrationBuilder.CreateIndex(
            name: "IX_ApiKeys_KeyHash",
            table: "ApiKeys",
            column: "KeyHash",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_ApiKeys_CustomerId",
            table: "ApiKeys",
            column: "CustomerId");

        migrationBuilder.CreateIndex(
            name: "IX_ApiKeys_KeyPrefix",
            table: "ApiKeys",
            column: "KeyPrefix");

        // Usage tracking table
        migrationBuilder.CreateTable(
            name: "ApiKeyUsageLog",
            columns: table => new
            {
                Id = table.Column<long>(nullable: false)
                    .Annotation("SqlServer:Identity", "1, 1"),
                ApiKeyId = table.Column<Guid>(nullable: false),
                Endpoint = table.Column<string>(maxLength: 256, nullable: false),
                Method = table.Column<string>(maxLength: 10, nullable: false),
                StatusCode = table.Column<int>(nullable: false),
                ResponseTime = table.Column<int>(nullable: false), // milliseconds
                RequestSize = table.Column<long>(nullable: false),
                ResponseSize = table.Column<long>(nullable: false),
                UserAgent = table.Column<string>(maxLength: 500, nullable: true),
                IpAddress = table.Column<string>(maxLength: 45, nullable: true),
                Timestamp = table.Column<DateTime>(nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_ApiKeyUsageLog", x => x.Id);
                table.ForeignKey(
                    name: "FK_ApiKeyUsageLog_ApiKeys_ApiKeyId",
                    column: x => x.ApiKeyId,
                    principalTable: "ApiKeys",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "IX_ApiKeyUsageLog_ApiKeyId_Timestamp",
            table: "ApiKeyUsageLog",
            columns: new[] { "ApiKeyId", "Timestamp" });
    }
}
```

### 2. Domain Models

```csharp
// Domain/Models/ApiKey.cs
public class ApiKey
{
    public Guid Id { get; set; }
    public string KeyHash { get; set; }
    public string KeyPrefix { get; set; } // First 7 chars for identification
    public string CustomerId { get; set; }
    public string CustomerEmail { get; set; }
    public string CustomerName { get; set; }
    public string Description { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastUsedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public DateTime? RevokedAt { get; set; }
    public string RevokedReason { get; set; }
    public long RequestCount { get; set; }
    public long MonthlyRequestCount { get; set; }
    public DateTime LastResetDate { get; set; }
    public int RateLimitPerHour { get; set; }
    public List<string> Scopes { get; set; }
    
    public bool IsValid => RevokedAt == null && 
                          (ExpiresAt == null || ExpiresAt > DateTime.UtcNow);
}

// Domain/Models/ApiKeyUsageLog.cs
public class ApiKeyUsageLog
{
    public long Id { get; set; }
    public Guid ApiKeyId { get; set; }
    public string Endpoint { get; set; }
    public string Method { get; set; }
    public int StatusCode { get; set; }
    public int ResponseTime { get; set; }
    public long RequestSize { get; set; }
    public long ResponseSize { get; set; }
    public string UserAgent { get; set; }
    public string IpAddress { get; set; }
    public DateTime Timestamp { get; set; }
    
    public virtual ApiKey ApiKey { get; set; }
}
```

### 3. API Key Service

```csharp
// Services/ApiKeyService.cs
public interface IApiKeyService
{
    Task<(string key, ApiKey model)> GenerateKeyAsync(CreateApiKeyRequest request);
    Task<ApiKey> ValidateKeyAsync(string key);
    Task<bool> RevokeKeyAsync(Guid keyId, string reason);
    Task<ApiKeyUsageStats> GetUsageStatsAsync(string customerId, DateTime? from, DateTime? to);
    Task LogUsageAsync(Guid apiKeyId, HttpContext context, int responseTime);
}

public class ApiKeyService : IApiKeyService
{
    private readonly KilometersDbContext _db;
    private readonly ILogger<ApiKeyService> _logger;
    private const string KEY_PREFIX = "km_";
    
    public async Task<(string key, ApiKey model)> GenerateKeyAsync(CreateApiKeyRequest request)
    {
        // Generate secure random key
        var keyBytes = new byte[32];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(keyBytes);
        }
        
        var key = KEY_PREFIX + Convert.ToBase64String(keyBytes)
            .Replace("+", "-")
            .Replace("/", "_")
            .TrimEnd('=');
        
        var apiKey = new ApiKey
        {
            Id = Guid.NewGuid(),
            KeyHash = HashKey(key),
            KeyPrefix = key.Substring(0, 10),
            CustomerId = request.CustomerId,
            CustomerEmail = request.CustomerEmail,
            CustomerName = request.CustomerName,
            Description = request.Description,
            CreatedAt = DateTime.UtcNow,
            LastResetDate = DateTime.UtcNow,
            RateLimitPerHour = request.RateLimitPerHour ?? 1000,
            ExpiresAt = request.ExpiresInDays.HasValue 
                ? DateTime.UtcNow.AddDays(request.ExpiresInDays.Value) 
                : null,
            Scopes = request.Scopes ?? new List<string> { "read", "write" }
        };
        
        _db.ApiKeys.Add(apiKey);
        await _db.SaveChangesAsync();
        
        _logger.LogInformation("Generated API key {KeyPrefix} for customer {CustomerId}", 
            apiKey.KeyPrefix, apiKey.CustomerId);
        
        return (key, apiKey);
    }
    
    public async Task<ApiKey> ValidateKeyAsync(string key)
    {
        if (string.IsNullOrEmpty(key) || !key.StartsWith(KEY_PREFIX))
            return null;
        
        var keyHash = HashKey(key);
        var apiKey = await _db.ApiKeys
            .FirstOrDefaultAsync(k => k.KeyHash == keyHash);
        
        if (apiKey == null || !apiKey.IsValid)
            return null;
        
        // Check rate limit
        var hourAgo = DateTime.UtcNow.AddHours(-1);
        var recentRequests = await _db.ApiKeyUsageLog
            .CountAsync(u => u.ApiKeyId == apiKey.Id && u.Timestamp > hourAgo);
        
        if (recentRequests >= apiKey.RateLimitPerHour)
        {
            _logger.LogWarning("Rate limit exceeded for key {KeyPrefix}", apiKey.KeyPrefix);
            return null;
        }
        
        return apiKey;
    }
    
    private string HashKey(string key)
    {
        using (var sha256 = SHA256.Create())
        {
            var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(key));
            return Convert.ToBase64String(bytes);
        }
    }
}
```

### 4. Authentication Middleware

```csharp
// Middleware/ApiKeyAuthenticationMiddleware.cs
public class ApiKeyAuthenticationMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<ApiKeyAuthenticationMiddleware> _logger;
    
    public async Task InvokeAsync(HttpContext context)
    {
        // Skip auth for health checks and public endpoints
        if (context.Request.Path.StartsWithSegments("/health") ||
            context.Request.Path.StartsWithSegments("/swagger"))
        {
            await _next(context);
            return;
        }
        
        var stopwatch = Stopwatch.StartNew();
        
        using (var scope = _serviceProvider.CreateScope())
        {
            var apiKeyService = scope.ServiceProvider.GetRequiredService<IApiKeyService>();
            
            // Check for API key in header
            if (!context.Request.Headers.TryGetValue("X-API-Key", out var apiKeyHeader))
            {
                context.Response.StatusCode = 401;
                await context.Response.WriteAsync("API key required");
                return;
            }
            
            var apiKey = await apiKeyService.ValidateKeyAsync(apiKeyHeader);
            if (apiKey == null)
            {
                context.Response.StatusCode = 403;
                await context.Response.WriteAsync("Invalid or expired API key");
                return;
            }
            
            // Add to context for later use
            context.Items["ApiKey"] = apiKey;
            context.Items["CustomerId"] = apiKey.CustomerId;
            
            // Call next middleware
            await _next(context);
            
            // Log usage
            stopwatch.Stop();
            await apiKeyService.LogUsageAsync(apiKey.Id, context, 
                (int)stopwatch.ElapsedMilliseconds);
        }
    }
}

// Extension method for registration
public static class ApiKeyAuthenticationExtensions
{
    public static IApplicationBuilder UseApiKeyAuthentication(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<ApiKeyAuthenticationMiddleware>();
    }
}
```

### 5. API Key Management Controller

```csharp
// Controllers/ApiKeyManagementController.cs
[ApiController]
[Route("api/keys")]
public class ApiKeyManagementController : ControllerBase
{
    private readonly IApiKeyService _apiKeyService;
    private readonly IConfiguration _configuration;
    
    // Admin endpoints (require master key)
    [HttpPost("generate")]
    public async Task<IActionResult> GenerateKey(
        [FromBody] CreateApiKeyRequest request,
        [FromHeader(Name = "X-Master-Key")] string masterKey)
    {
        // Validate master key
        var configuredMasterKey = _configuration["MasterApiKey"];
        if (masterKey != configuredMasterKey)
            return Unauthorized("Invalid master key");
        
        var (key, model) = await _apiKeyService.GenerateKeyAsync(request);
        
        return Ok(new ApiKeyResponse
        {
            ApiKey = key, // Only returned once!
            KeyId = model.Id,
            KeyPrefix = model.KeyPrefix,
            CustomerId = model.CustomerId,
            ExpiresAt = model.ExpiresAt,
            RateLimitPerHour = model.RateLimitPerHour,
            Scopes = model.Scopes
        });
    }
    
    // Customer endpoints (use their API key)
    [HttpGet("usage")]
    public async Task<IActionResult> GetMyUsage([FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        var apiKey = HttpContext.Items["ApiKey"] as ApiKey;
        var stats = await _apiKeyService.GetUsageStatsAsync(
            apiKey.CustomerId, 
            from ?? DateTime.UtcNow.AddDays(-30), 
            to ?? DateTime.UtcNow);
        
        return Ok(stats);
    }
    
    [HttpPost("rotate")]
    public async Task<IActionResult> RotateMyKey()
    {
        var apiKey = HttpContext.Items["ApiKey"] as ApiKey;
        
        // Revoke old key
        await _apiKeyService.RevokeKeyAsync(apiKey.Id, "Rotated by user");
        
        // Generate new key
        var (newKey, model) = await _apiKeyService.GenerateKeyAsync(new CreateApiKeyRequest
        {
            CustomerId = apiKey.CustomerId,
            CustomerEmail = apiKey.CustomerEmail,
            CustomerName = apiKey.CustomerName,
            Description = $"Rotated from {apiKey.KeyPrefix}",
            RateLimitPerHour = apiKey.RateLimitPerHour,
            Scopes = apiKey.Scopes
        });
        
        return Ok(new { ApiKey = newKey, Message = "Key rotated successfully" });
    }
}
```

### 6. Integration with Program.cs

```csharp
// In Program.cs
var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddScoped<IApiKeyService, ApiKeyService>();

var app = builder.Build();

// Add middleware BEFORE other auth
app.UseApiKeyAuthentication();

// Rest of pipeline...
app.UseAuthorization();
app.MapControllers();
```

## Usage Examples

### Customer Integration

```bash
# Set API key in environment
export KILOMETERS_API_KEY="km_AbCdEfGhIjKlMnOpQrStUvWxYz..."

# Use in CLI
km node mcp-server.js  # CLI automatically uses KILOMETERS_API_KEY

# Direct API call
curl -H "X-API-Key: $KILOMETERS_API_KEY" https://api.kilometers.ai/events
```

### Admin Operations

```bash
# Generate key for customer
curl -X POST https://api.kilometers.ai/api/keys/generate \
  -H "X-Master-Key: your-master-key" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "cust_123",
    "customerEmail": "user@example.com",
    "customerName": "John Doe",
    "description": "Production API key",
    "rateLimitPerHour": 5000,
    "expiresInDays": 365
  }'

# Response
{
  "apiKey": "km_AbCdEfGhIjKlMnOpQrStUvWxYz...",
  "keyId": "550e8400-e29b-41d4-a716-446655440000",
  "keyPrefix": "km_AbCdEfG",
  "customerId": "cust_123",
  "expiresAt": "2025-06-26T00:00:00Z",
  "rateLimitPerHour": 5000,
  "scopes": ["read", "write"]
}
```

### Customer Self-Service

```bash
# Check usage
curl -H "X-API-Key: $KILOMETERS_API_KEY" \
  https://api.kilometers.ai/api/keys/usage?from=2024-06-01

# Rotate key
curl -X POST -H "X-API-Key: $KILOMETERS_API_KEY" \
  https://api.kilometers.ai/api/keys/rotate
```

## Security Best Practices

1. **Never log full API keys** - Only log key prefix
2. **Hash keys before storage** - Use SHA256 minimum
3. **Implement rate limiting** - Per key and global
4. **Add expiration dates** - Force rotation
5. **Log all usage** - For audit and billing
6. **Use secure random** - For key generation
7. **Implement scopes** - Limit key permissions

## Dashboard Integration

```typescript
// React component for key management
const ApiKeyDashboard = () => {
  const [keys, setKeys] = useState([]);
  const [showNewKey, setShowNewKey] = useState(null);
  
  const generateKey = async () => {
    const response = await fetch('/api/keys/generate', {
      method: 'POST',
      headers: { 
        'X-Master-Key': masterKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        customerId: currentUser.id,
        customerEmail: currentUser.email,
        description: 'Generated from dashboard'
      })
    });
    
    const data = await response.json();
    setShowNewKey(data.apiKey);
    loadKeys(); // Refresh list
  };
  
  return (
    <div>
      <h2>API Keys</h2>
      <button onClick={generateKey}>Generate New Key</button>
      
      {showNewKey && (
        <Alert>
          <h3>New API Key Generated</h3>
          <p>Save this key - it won't be shown again!</p>
          <code>{showNewKey}</code>
          <CopyButton text={showNewKey} />
        </Alert>
      )}
      
      <table>
        <thead>
          <tr>
            <th>Key Prefix</th>
            <th>Description</th>
            <th>Created</th>
            <th>Last Used</th>
            <th>Requests</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {keys.map(key => (
            <tr key={key.id}>
              <td><code>{key.keyPrefix}...</code></td>
              <td>{key.description}</td>
              <td>{formatDate(key.createdAt)}</td>
              <td>{formatDate(key.lastUsedAt)}</td>
              <td>{key.requestCount.toLocaleString()}</td>
              <td>
                <button onClick={() => revokeKey(key.id)}>Revoke</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

## Monitoring & Alerts

Set up Application Insights alerts for:
- Excessive API key generation
- High failure rates per key
- Approaching rate limits
- Expired keys still being used
- Suspicious usage patterns

## Migration Path

1. **Phase 1**: Deploy single master key (current state)
2. **Phase 2**: Add database tables and service
3. **Phase 3**: Implement middleware
4. **Phase 4**: Add management endpoints
5. **Phase 5**: Customer dashboard
6. **Phase 6**: Deprecate master key for customer use