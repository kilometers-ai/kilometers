# Kilometers.ai - Functional Specification & Implementation Guide

## Executive Summary
Kilometers monitors AI agent activity by wrapping MCP (Model Context Protocol) servers. 30-second setup, immediate value.

---

## System Architecture

```
[AI Client] → [km CLI] → [MCP Server]
                 ↓
            [Azure API]
                 ↓
         [Event Processor]
                 ↓
         [PostgreSQL] → [Dashboard]
```

---

## Phase 1: CLI Wrapper (Day 1-2)

### Technology Choice: Go
```go
// km/main.go - The entire wrapper in ~100 lines
package main

import (
    "bufio"
    "bytes"
    "encoding/json"
    "io"
    "net/http"
    "os"
    "os/exec"
    "time"
)

func main() {
    // Start the wrapped MCP server
    cmd := exec.Command(os.Args[1], os.Args[2:]...)
    
    // Pipe stdio through our monitors
    stdinPipe, _ := cmd.StdinPipe()
    stdoutPipe, _ := cmd.StdoutPipe()
    
    // Start wrapped process
    cmd.Start()
    
    // Monitor stdin (AI → MCP)
    go monitorInput(os.Stdin, stdinPipe)
    
    // Monitor stdout (MCP → AI)
    go monitorOutput(stdoutPipe, os.Stdout)
    
    cmd.Wait()
}
```

### Distribution
```bash
# Build for all platforms
GOOS=windows go build -o km.exe
GOOS=darwin go build -o km-mac
GOOS=linux go build -o km-linux

# One-line installer
curl -sSL https://get.kilometers.ai | sh
```

---

## Phase 2: Azure Backend (Day 2-3)

### Infrastructure (Terraform)

```hcl
# terraform/main.tf
terraform {
  required_providers {
    azurerm = { version = "~> 3.0" }
  }
}

# Resource Group
resource "azurerm_resource_group" "kilometers" {
  name     = "rg-kilometers-prod"
  location = "East US"
}

# PostgreSQL Flexible Server
resource "azurerm_postgresql_flexible_server" "main" {
  name                = "psql-kilometers-prod"
  resource_group_name = azurerm_resource_group.kilometers.name
  location           = azurerm_resource_group.kilometers.location
  sku_name           = "B_Standard_B1ms" # Start small
  storage_mb         = 32768
  version            = "15"
}

# App Service Plan (Linux)
resource "azurerm_service_plan" "main" {
  name                = "asp-kilometers-prod"
  resource_group_name = azurerm_resource_group.kilometers.name
  location           = azurerm_resource_group.kilometers.location
  os_type            = "Linux"
  sku_name           = "B1" # Scale later
}

# API Web App
resource "azurerm_linux_web_app" "api" {
  name                = "app-kilometers-api"
  service_plan_id     = azurerm_service_plan.main.id
  
  site_config {
    application_stack {
      dotnet_version = "9.0"
    }
  }
  
  app_settings = {
    "ConnectionStrings__Default" = azurerm_postgresql_flexible_server.main.connection_string
  }
}

# Storage for event buffering
resource "azurerm_storage_account" "events" {
  name                     = "stkilometersevents"
  resource_group_name      = azurerm_resource_group.kilometers.name
  location                = azurerm_resource_group.kilometers.location
  account_tier            = "Standard"
  account_replication_type = "LRS"
}
```

### API Design (.NET 9 Minimal APIs)

```csharp
// Program.cs - Hexagonal Architecture Setup
var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddSingleton<IEventStore, PostgresEventStore>();
builder.Services.AddSingleton<IEventProcessor, EventProcessor>();
builder.Services.AddHostedService<EventProcessorService>();

var app = builder.Build();

// Ingestion endpoint (from CLI)
app.MapPost("/api/events", async (EventDto dto, IEventStore store) =>
{
    var evt = Event.FromDto(dto);
    await store.AppendAsync(evt);
    return Results.Accepted();
})
.RequireAuthorization();

// Dashboard API
app.MapGet("/api/activity", async (IEventStore store, 
    [FromQuery] int limit = 100) =>
{
    var events = await store.GetRecentAsync(limit);
    return Results.Ok(events);
});

app.MapGet("/api/stats", async (IEventStore store) =>
{
    var stats = await store.GetStatsAsync();
    return Results.Ok(stats);
});

app.Run();
```

### Domain Model (DDD)

```csharp
// Domain/Events/MpcEvent.cs
public record MpcEvent
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public DateTime Timestamp { get; init; } = DateTime.UtcNow;
    public string CustomerId { get; init; }
    public string UserId { get; init; }
    public string AiTool { get; init; } // cursor, claude
    public string MpcServer { get; init; } // github, slack
    public string Method { get; init; } // tools/call
    public JsonDocument Params { get; init; }
    public int ResponseSizeBytes { get; init; }
    public int DurationMs { get; init; }
    public decimal? CostEstimate { get; init; }
    public RiskLevel Risk { get; init; }
    
    public static MpcEvent FromCliData(string jsonData)
    {
        // Parse and validate
        // Calculate risk score
        // Estimate cost
    }
}

// Domain/Services/RiskAnalyzer.cs
public interface IRiskAnalyzer
{
    RiskLevel Analyze(MpcEvent evt);
}

public class RiskAnalyzer : IRiskAnalyzer
{
    public RiskLevel Analyze(MpcEvent evt)
    {
        // Check for:
        // - SELECT * queries
        // - Password/secret searches
        // - Unusual access patterns
        // - Rate anomalies
    }
}
```

### Database Schema

```sql
-- PostgreSQL schema
CREATE TABLE events (
    id UUID PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL,
    customer_id UUID NOT NULL,
    user_id TEXT,
    ai_tool TEXT,
    mcp_server TEXT,
    method TEXT,
    params JSONB,
    response_size_bytes INT,
    duration_ms INT,
    cost_estimate DECIMAL(10,4),
    risk_level INT,
    
    -- Indexes for common queries
    INDEX idx_customer_timestamp (customer_id, timestamp DESC),
    INDEX idx_risk_high (customer_id, risk_level) WHERE risk_level > 7
);

-- Aggregated stats (updated async)
CREATE TABLE hourly_stats (
    customer_id UUID,
    hour TIMESTAMPTZ,
    mcp_server TEXT,
    request_count INT,
    total_cost DECIMAL(10,4),
    p95_duration_ms INT,
    PRIMARY KEY (customer_id, hour, mcp_server)
);
```

---

## Phase 3: Dashboard (Day 3-4)

### Simple React SPA
```jsx
// Dashboard.jsx
function Dashboard() {
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({});
  
  // Poll for updates
  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch('/api/activity');
      setEvents(await res.json());
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">
        Your AI's Journey Today
      </h1>
      
      <div className="grid grid-cols-3 gap-4 my-4">
        <StatCard 
          title="Total Distance" 
          value={`${stats.totalKm} km`} 
        />
        <StatCard 
          title="Destinations" 
          value={stats.uniqueServers} 
        />
        <StatCard 
          title="Cost" 
          value={`$${stats.totalCost}`} 
        />
      </div>
      
      <ActivityFeed events={events} />
    </div>
  );
}
```

---

## Phase 4: GitHub Actions CI/CD

```yaml
# .github/workflows/deploy.yml
name: Deploy Kilometers

on:
  push:
    branches: [main]

jobs:
  build-cli:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        os: [windows, darwin, linux]
        arch: [amd64, arm64]
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Go
        uses: actions/setup-go@v4
        with:
          go-version: '1.21'
      
      - name: Build CLI
        env:
          GOOS: ${{ matrix.os }}
          GOARCH: ${{ matrix.arch }}
        run: |
          go build -o km-${{ matrix.os }}-${{ matrix.arch }} ./cli
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: km-${{ matrix.os }}-${{ matrix.arch }}
          path: km-*

  deploy-api:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup .NET
        uses: actions/setup-dotnet@v3
        with:
          dotnet-version: '9.0'
      
      - name: Build API
        run: |
          cd api
          dotnet publish -c Release -o ./publish
      
      - name: Deploy to Azure
        uses: azure/webapps-deploy@v2
        with:
          app-name: app-kilometers-api
          package: ./api/publish
```

---

## Phase 5: Launch Sequence

### Day 1: CLI Works
- [ ] Basic wrapper logs to console
- [ ] Test with 3 different MCP servers
- [ ] Package for Mac/Linux/Windows

### Day 2: Cloud Connected
- [ ] Deploy Azure infrastructure
- [ ] CLI sends events to API
- [ ] Basic data visible in DB

### Day 3: Dashboard Live
- [ ] Activity feed working
- [ ] Stats calculating
- [ ] Deploy to kilometers.ai

### Day 4: First Customers
- [ ] Stripe integration ($49/mo)
- [ ] Onboarding flow
- [ ] 3 paying customers

### Day 5-7: Scale
- [ ] Product Hunt launch
- [ ] Handle spike traffic
- [ ] Iterate based on feedback

---

## Monitoring & Alerts

### Alert Rules (MVP)
```csharp
public class AlertRules
{
    public static readonly AlertRule[] Default = new[]
    {
        new("High Risk Activity", e => e.Risk > RiskLevel.High),
        new("Cost Spike", e => e.CostEstimate > 10.00m),
        new("Unusual Pattern", e => IsUnusualPattern(e)),
        new("Rate Limit Warning", e => e.Method == "error" && 
            e.Params.RootElement.GetProperty("code").GetInt32() == 429)
    };
}
```

---

## Security Considerations

1. **API Keys**: Rotate daily, scope by customer
2. **Data Retention**: 7 days free, 90 days paid
3. **PII Handling**: Redact sensitive params
4. **Encryption**: TLS everywhere, encrypted at rest

---

## Scaling Strategy

**Week 1**: Single Azure App Service handles everything
**Month 1**: Add Redis cache, CDN for dashboard
**Month 3**: Separate ingestion from query workloads
**Month 6**: Multi-region deployment

---

## Success Metrics

- **Day 1**: CLI works for you
- **Day 3**: 10 people using it
- **Day 7**: 3 paying customers ($147 MRR)
- **Day 30**: 100 customers ($4,900 MRR)
- **Day 90**: 500 customers ($24,500 MRR)

---

## The Bottom Line

You have ALL the pieces:
- Domain (kilometers.ai) ✓
- MCP knowledge ✓
- Azure infrastructure ✓
- Technical skills ✓
- Perfect timing ✓

**Stop planning. Start shipping.**

By Sunday night, you'll either have paying customers or you'll have learned something valuable. Either way, you win.

The only way to lose is not to ship.