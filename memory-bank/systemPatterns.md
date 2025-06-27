# System Patterns: Kilometers.ai

## Overall Architecture

### Multi-App System Design
```
┌─────────────────┐                      ┌─────────────────┐
│  Marketing Site │    GitHub OAuth      │   Main App      │
│ (Next.js/Azure) │◄────initiate─────────│ (React/Azure)   │
│ kilometers.ai   │                      │app.kilometers.ai│
└─────────────────┘                      └─────────┬───────┘
                                                   │
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│   AI Client     │    │  km CLI      │    │  MCP Server     │
│ (Cursor/Claude) │◄──►│   Wrapper    │◄──►│ (GitHub/Slack)  │
└─────────────────┘    └──────┬───────┘    └─────────────────┘
                              │
                              ▼ HTTPS
                    ┌─────────────────┐
                    │  Azure API      │
                    │  (.NET 9)       │
                    └─────────┬───────┘
                              │
                              ▼
                    ┌─────────────────┐    ┌─────────────────┐
                    │   PostgreSQL    │    │  React Dashboard│
                    │  Event Store    │    │   (Static SPA)  │
                    └─────────────────┘    └─────────────────┘
```

### Core Architecture Principles

#### 1. Transparent Proxy Pattern
The CLI acts as a transparent proxy, intercepting and forwarding MCP communication without modification.

```go
// CLI Pattern: Transparent Monitoring
func main() {
    // Start wrapped MCP server
    cmd := exec.Command(os.Args[1], os.Args[2:]...)
    
    // Create monitored pipes
    stdinPipe, _ := cmd.StdinPipe()
    stdoutPipe, _ := cmd.StdoutPipe()
    
    // Monitor bidirectional communication
    go monitorInput(os.Stdin, stdinPipe)   // AI → MCP
    go monitorOutput(stdoutPipe, os.Stdout) // MCP → AI
    
    cmd.Wait()
}
```

#### 2. Event Sourcing Pattern
All interactions are captured as immutable events, enabling replay and analysis.

```csharp
// Event Sourcing: Immutable Events
public record MpcEvent
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public DateTime Timestamp { get; init; } = DateTime.UtcNow;
    public string Direction { get; init; } // "request" | "response"
    public JsonDocument Payload { get; init; }
    public string CustomerId { get; init; }
    public EventMetadata Metadata { get; init; }
}
```

## Marketing Site Architecture Patterns

### 3. Split OAuth Authentication Pattern
The marketing site initiates OAuth but the main application handles completion and token management.

```typescript
// Marketing Site: OAuth Initiation
export function middleware(request: NextRequest) {
  const useExternalApp = process.env.NEXT_PUBLIC_USE_EXTERNAL_APP === "true"
  const externalAppUrl = process.env.NEXT_PUBLIC_EXTERNAL_APP_URL
  
  // Routes that should redirect to external app when feature flag is enabled
  const appRoutes = ["/dashboard", "/onboarding", "/billing"]
  
  if (useExternalApp && appRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )) {
    const redirectUrl = new URL(
      request.nextUrl.pathname + request.nextUrl.search, 
      externalAppUrl
    )
    return NextResponse.redirect(redirectUrl)
  }
}
```

### 4. Feature Flag-Driven Architecture Pattern
Environment variables control behavior across development and production environments.

```typescript
// Feature Flag System
const getFeatureFlags = (): FeatureFlags => {
  if (typeof window === "undefined") {
    // Server-side: use environment variables
    return {
      USE_EXTERNAL_APP: process.env.NEXT_PUBLIC_USE_EXTERNAL_APP === "true",
      EXTERNAL_APP_URL: process.env.NEXT_PUBLIC_EXTERNAL_APP_URL || "https://app.kilometers.ai",
      ENABLE_GITHUB_OAUTH: process.env.NEXT_PUBLIC_ENABLE_GITHUB_OAUTH === "true",
      ENABLE_REAL_CONNECTION_CHECK: process.env.NEXT_PUBLIC_ENABLE_REAL_CONNECTION_CHECK === "true",
      // ... 10 more feature flags
    }
  }
  return defaultFlags
}
```

### 5. Client-Side Suspense Pattern
Components using client-side hooks are wrapped in Suspense for proper SSR/hydration.

```typescript
// Suspense Wrapper Pattern
import { Suspense } from 'react'

function OnboardingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OnboardingClient />
    </Suspense>
  )
}

function OnboardingClient() {
  const searchParams = useSearchParams() // Client-side hook
  // Component logic using searchParams
}

## API Architecture Patterns

### Hexagonal Architecture Implementation

```csharp
// Domain Layer (Core Business Logic)
namespace Kilometers.Domain
{
    public interface IEventStore
    {
        Task AppendAsync(MpcEvent evt);
        Task<List<MpcEvent>> GetRecentAsync(string customerId, int limit);
    }
    
    public interface IRiskAnalyzer
    {
        RiskLevel Analyze(MpcEvent evt);
    }
}

// Infrastructure Layer (External Concerns)
namespace Kilometers.Infrastructure
{
    public class PostgresEventStore : IEventStore
    {
        // PostgreSQL implementation
    }
    
    public class RiskAnalyzer : IRiskAnalyzer
    {
        // Risk analysis implementation
    }
}

// Application Layer (API Endpoints)
namespace Kilometers.Api
{
    // Minimal API endpoints connecting domain to infrastructure
    app.MapPost("/api/events", async (EventDto dto, IEventStore store) =>
    {
        var evt = Event.FromDto(dto);
        await store.AppendAsync(evt);
        return Results.Accepted();
    });
}
```

### Dependency Injection Pattern

```csharp
// DI Container Setup
var builder = WebApplication.CreateBuilder(args);

// Register domain services
builder.Services.AddSingleton<IEventStore, PostgresEventStore>();
builder.Services.AddSingleton<IRiskAnalyzer, RiskAnalyzer>();
builder.Services.AddSingleton<ICostCalculator, CostCalculator>();

// Register background services
builder.Services.AddHostedService<EventProcessorService>();

var app = builder.Build();
```

## Data Architecture Patterns

### Event Store Schema Design

```sql
-- Primary event table (append-only)
CREATE TABLE events (
    id UUID PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL,
    customer_id UUID NOT NULL,
    direction TEXT NOT NULL, -- 'request' | 'response'
    mcp_method TEXT,
    payload JSONB NOT NULL,
    metadata JSONB,
    
    -- Optimized indexes
    INDEX idx_customer_time (customer_id, timestamp DESC),
    INDEX idx_method_risk (customer_id, mcp_method) WHERE risk_level > 7
);

-- Materialized views for analytics
CREATE MATERIALIZED VIEW hourly_stats AS
SELECT 
    customer_id,
    date_trunc('hour', timestamp) as hour,
    mcp_method,
    count(*) as request_count,
    avg(duration_ms) as avg_duration,
    sum(cost_estimate) as total_cost
FROM events 
WHERE direction = 'response'
GROUP BY customer_id, hour, mcp_method;
```

### CQRS Pattern for Read/Write Separation

```csharp
// Command Side: Fast event ingestion
public class EventIngestionService
{
    public async Task<Result> IngestEventAsync(EventDto dto)
    {
        var evt = MpcEvent.FromDto(dto);
        await _eventStore.AppendAsync(evt);
        
        // Fire-and-forget background processing
        _backgroundQueue.Enqueue(evt);
        
        return Result.Success();
    }
}

// Query Side: Optimized read models
public class DashboardQueryService  
{
    public async Task<ActivitySummary> GetActivitySummaryAsync(string customerId)
    {
        // Read from optimized views/aggregates
        return await _readModel.GetSummaryAsync(customerId);
    }
}
```

## CLI Architecture Patterns

### Process Wrapper Pattern

```go
// Transparent process wrapping
type ProcessWrapper struct {
    cmd    *exec.Cmd
    stdin  io.WriteCloser
    stdout io.ReadCloser
    
    events chan MpcEvent
}

func (w *ProcessWrapper) Start() error {
    // Start wrapped process
    if err := w.cmd.Start(); err != nil {
        return err
    }
    
    // Start monitoring goroutines
    go w.monitorStdin()
    go w.monitorStdout()
    go w.processEvents()
    
    return nil
}
```

### Event Buffering Pattern

```go
// Buffer events for batch transmission
type EventBuffer struct {
    events []MpcEvent
    mutex  sync.Mutex
    ticker *time.Ticker
}

func (b *EventBuffer) Add(event MpcEvent) {
    b.mutex.Lock()
    defer b.mutex.Unlock()
    
    b.events = append(b.events, event)
    
    // Flush if buffer is full
    if len(b.events) >= batchSize {
        go b.flush()
    }
}
```

## Security Patterns

### API Authentication Pattern

```csharp
// JWT-based authentication with key rotation
public class ApiKeyMiddleware
{
    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        var apiKey = context.Request.Headers["X-API-Key"].FirstOrDefault();
        
        if (!await _keyValidator.ValidateAsync(apiKey))
        {
            context.Response.StatusCode = 401;
            return;
        }
        
        // Set customer context
        context.Items["CustomerId"] = await _keyValidator.GetCustomerIdAsync(apiKey);
        
        await next(context);
    }
}
```

### Data Sanitization Pattern

```csharp
// Automatic PII detection and redaction
public class DataSanitizer
{
    private static readonly Regex[] PiiPatterns = {
        new Regex(@"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b"), // Email
        new Regex(@"\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b"),          // Credit card
        new Regex(@"\b(?:password|token|secret|key)\s*[:=]\s*\S+", RegexOptions.IgnoreCase)
    };
    
    public JsonDocument Sanitize(JsonDocument input)
    {
        // Recursively scan and redact sensitive data
        return SanitizeJsonElement(input.RootElement);
    }
}
```

## Performance Patterns

### Async Processing Pattern

```csharp
// Background event processing
public class EventProcessorService : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await foreach (var events in _eventQueue.ReadAllAsync(stoppingToken))
        {
            // Process events in parallel batches
            var tasks = events.Chunk(batchSize)
                             .Select(batch => ProcessBatchAsync(batch))
                             .ToArray();
            
            await Task.WhenAll(tasks);
        }
    }
}
```

### Connection Pooling Pattern

```csharp
// Optimized database connections
services.AddDbContext<KilometersDbContext>(options =>
{
    options.UseNpgsql(connectionString, npgsqlOptions =>
    {
        npgsqlOptions.CommandTimeout(30);
        npgsqlOptions.EnableRetryOnFailure(3);
    });
}, ServiceLifetime.Singleton); // Singleton for connection pooling
```

## Deployment Patterns

### Blue-Green Deployment Pattern

```yaml
# Azure App Service slot-based deployment
- name: Deploy to Staging Slot
  uses: azure/webapps-deploy@v2
  with:
    app-name: app-kilometers-api
    slot-name: staging
    package: ./publish

- name: Smoke Test Staging
  run: |
    curl -f https://app-kilometers-api-staging.azurewebsites.net/health

- name: Swap to Production
  run: |
    az webapp deployment slot swap \
      --resource-group rg-kilometers \
      --name app-kilometers-api \
      --slot staging \
      --target-slot production
```

### Infrastructure as Code Pattern

```hcl
# Terraform module pattern for reusable infrastructure
module "kilometers_environment" {
  source = "./modules/environment"
  
  environment_name = var.environment_name
  location        = var.location
  
  # Environment-specific configurations
  app_service_sku = var.environment_name == "prod" ? "P1v3" : "B1"
  database_sku    = var.environment_name == "prod" ? "GP_Standard_D2s_v3" : "B_Standard_B1ms"
}
```

## Component Interaction Patterns

### Request Flow Pattern

```
1. AI Client sends MCP request
   ↓
2. CLI intercepts and logs request
   ↓ 
3. CLI forwards to original MCP server
   ↓
4. MCP server processes and responds
   ↓
5. CLI intercepts and logs response
   ↓
6. CLI forwards response to AI client
   ↓
7. CLI batches events and sends to API
   ↓
8. API processes events asynchronously
   ↓
9. Dashboard queries processed data
```

### Error Handling Pattern

```csharp
// Resilient error handling with circuit breaker
public class ResilientApiClient
{
    private readonly CircuitBreaker _circuitBreaker;
    
    public async Task<Result> SendEventsAsync(IEnumerable<MpcEvent> events)
    {
        return await _circuitBreaker.ExecuteAsync(async () =>
        {
            try 
            {
                await _httpClient.PostAsJsonAsync("/api/events", events);
                return Result.Success();
            }
            catch (HttpRequestException ex)
            {
                // Log and return failure - circuit breaker handles retries
                return Result.Failure(ex.Message);
            }
        });
    }
}
``` 