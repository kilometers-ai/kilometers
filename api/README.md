# Kilometers API

The Kilometers API is a .NET 9 minimal API backend that ingests, processes, and analyzes MCP (Model Context Protocol) events from the Kilometers CLI wrapper.

## 🚀 Quick Start

```bash
# Clone and run locally
git clone https://github.com/kilometers-ai/kilometers
cd kilometers/api/Kilometers.Api
dotnet run

# API available at: https://localhost:5194
```

## 🏗️ Architecture

The API uses **Hexagonal Architecture** (ports and adapters) with clear separation of concerns:

```
📦 api/Kilometers.Api/
├── 📁 Domain/               # Core business logic
│   ├── Events/             # Event entities and DTOs
│   └── Services/           # Domain service interfaces
├── 📁 Infrastructure/      # External concerns
│   ├── Data/              # Database context and migrations
│   └── EventStore/        # Storage implementations
└── 📄 Program.cs          # API endpoints and DI setup
```

### Key Design Principles
- **Clean Architecture**: Domain-driven design with dependency inversion
- **Event Sourcing**: Immutable event storage for complete audit trail
- **CQRS**: Separate read/write models for optimal performance
- **Async Throughout**: Full async/await pattern for scalability

## 🛠️ Development Setup

### Prerequisites
- **.NET 9 SDK** - [Download here](https://dotnet.microsoft.com/download/dotnet/9.0)
- **PostgreSQL** (for production) or use in-memory storage (development)
- **Azure CLI** (for production deployment)

### Local Development
```bash
# Install dependencies
dotnet restore

# Run in development mode (uses in-memory storage)
dotnet run --launch-profile https

# Run with PostgreSQL
# Set connection string in appsettings.Development.json
dotnet run --environment Development
```

### Environment Configuration
Create `appsettings.Development.json`:
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "ConnectionStrings": {
    "Default": "Host=localhost;Database=kilometers_dev;Username=postgres;Password=your_password"
  }
}
```

### Database Setup (Optional for Development)
```bash
# Install PostgreSQL locally
brew install postgresql          # macOS
sudo apt install postgresql      # Ubuntu
choco install postgresql         # Windows

# Create development database
createdb kilometers_dev

# Run migrations
dotnet ef database update
```

## 📡 API Endpoints

### Health Check
```http
GET /health
```
**Response**: Basic health status
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:45Z",
  "environment": "Development"
}
```

### Service Information
```http
GET /
```
**Response**: API service metadata
```json
{
  "service": "Kilometers.Api",
  "version": "1.0.0",
  "environment": "Development",
  "timestamp": "2024-01-15T10:30:45Z"
}
```

### Event Ingestion

#### Single Event
```http
POST /api/events
Content-Type: application/json
Authorization: Bearer <api-key>
```

**Request Body**:
```json
{
  "id": "evt_1234567890abcdef",
  "timestamp": "2024-01-15T10:30:45Z",
  "customerId": "user_123",
  "direction": "request",
  "method": "tools/call",
  "payload": "eyJ0b29sIjogImdpdGh1Yi1zZWFyY2giLCAiYXJncyI6IHt9fQ==",
  "size": 156
}
```

**Response**:
```json
{
  "success": true,
  "eventId": "evt_1234567890abcdef"
}
```

#### Batch Events
```http
POST /api/events/batch
Content-Type: application/json
Authorization: Bearer <api-key>
```

**Request Body**:
```json
{
  "events": [
    {
      "id": "evt_1234567890abcdef",
      "timestamp": "2024-01-15T10:30:45Z",
      "customerId": "user_123",
      "direction": "request",
      "method": "tools/call",
      "payload": "eyJ0b29sIjogImdpdGh1Yi1zZWFyY2giLCAiYXJncyI6IHt9fQ==",
      "size": 156
    }
  ],
  "cliVersion": "1.0.0",
  "batchTimestamp": "2024-01-15T10:30:45Z"
}
```

### Analytics (Coming Soon)

#### Activity Feed
```http
GET /api/activity?limit=100
Authorization: Bearer <api-key>
```

#### Statistics
```http
GET /api/stats
Authorization: Bearer <api-key>
```

## 🗄️ Data Models

### Core Event
```csharp
public record MpcEvent
{
    public string Id { get; set; }              // Unique event ID
    public DateTime Timestamp { get; set; }     // When event occurred
    public string CustomerId { get; set; }      // Customer/user ID
    public string Direction { get; set; }       // "request" | "response"
    public string? Method { get; set; }         // MCP method (tools/call, etc.)
    public byte[] Payload { get; set; }         // Raw MCP JSON data
    public int Size { get; set; }               // Payload size in bytes
    public EventMetadata Metadata { get; set; } // Processed metadata
}
```

### Event Metadata
```csharp
public record EventMetadata
{
    public DateTime ProcessedAt { get; set; }   // When API processed event
    public string Source { get; set; }          // "CLI"
    public string Version { get; set; }         // CLI version
    public int? RiskScore { get; set; }         // 1-10 risk assessment
    public decimal? CostEstimate { get; set; }  // Estimated cost in USD
}
```

### Event DTO (API Input)
```csharp
public record MpcEventDto(
    string Id,
    DateTime Timestamp,
    string? CustomerId,
    string Direction,
    string? Method,
    string Payload,    // Base64 encoded
    int Size
);
```

## 🔧 Configuration

### Environment Variables
```bash
# Development
export ASPNETCORE_ENVIRONMENT=Development
export ConnectionStrings__Default="Host=localhost;Database=kilometers;Username=postgres;Password=password"

# Production
export ASPNETCORE_ENVIRONMENT=Production
export ConnectionStrings__Default="Host=prod-server;Database=kilometers;Username=dbuser;Password=secretpassword"
export APPLICATIONINSIGHTS_CONNECTION_STRING="InstrumentationKey=your-key"
```

### Configuration Sources (Priority Order)
1. **Environment Variables** (highest priority)
2. **Azure Key Vault** (production only)
3. **appsettings.{Environment}.json**
4. **appsettings.json** (lowest priority)

### Storage Options
- **Development**: In-memory storage (default, no setup required)
- **Production**: PostgreSQL with Azure managed identity
- **Testing**: In-memory storage for unit tests

## 🚀 Deployment

### Local Development
```bash
# Run with hot reload
dotnet watch run

# Run in production mode locally
dotnet run --environment Production
```

### Azure App Service
```bash
# Build for deployment
dotnet publish --configuration Release --output ./publish

# Deploy to Azure (via Azure CLI)
az webapp deployment source config-zip \
  --resource-group rg-kilometers-prod \
  --name app-kilometers-api \
  --src publish.zip
```

### Docker (Alternative)
```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY publish/ .
EXPOSE 8080
ENTRYPOINT ["dotnet", "Kilometers.Api.dll"]
```

### Database Migrations
```bash
# Create new migration
dotnet ef migrations add MigrationName

# Apply migrations (automatic in production)
dotnet ef database update

# View migration SQL
dotnet ef migrations script
```

## 🧪 Testing

### Unit Tests
```bash
# Run all tests
dotnet test

# Run with coverage
dotnet test --collect:"XPlat Code Coverage"

# Run specific test class
dotnet test --filter "TestClassName"
```

### Integration Tests
```bash
# Test with in-memory database
dotnet test --environment Testing

# Test API endpoints
curl -X POST https://localhost:5194/api/events \
  -H "Content-Type: application/json" \
  -d '{"id":"test","timestamp":"2024-01-15T10:30:45Z","direction":"request","payload":"dGVzdA==","size":4}'
```

### Load Testing
```bash
# Using Apache Bench
ab -n 1000 -c 10 -H "Content-Type: application/json" \
   -p event.json https://localhost:5194/api/events

# Using wrk
wrk -t4 -c100 -d30s --script=load-test.lua https://localhost:5194/api/events
```

## 🔒 Security

### Authentication
- **Bearer Token**: API keys passed in Authorization header
- **Azure Managed Identity**: For Azure service-to-service communication
- **Development**: No authentication required (localhost only)

### Data Protection
- **TLS 1.3**: All communication encrypted in transit
- **Azure Key Vault**: Secrets management in production
- **Input Validation**: All inputs validated and sanitized
- **SQL Injection**: Protected via Entity Framework parameterized queries

### Rate Limiting (Planned)
```csharp
// Future implementation
services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("api", options =>
    {
        options.PermitLimit = 100;
        options.Window = TimeSpan.FromMinutes(1);
    });
});
```

## 📊 Monitoring

### Application Insights Integration
```csharp
// Automatic telemetry collection
builder.Services.AddApplicationInsightsTelemetry();

// Custom metrics
services.Configure<TelemetryConfiguration>(config =>
{
    config.InstrumentationKey = "your-key";
});
```

### Health Checks
```csharp
// Comprehensive health monitoring
builder.Services.AddHealthChecks()
    .AddNpgSql(connectionString)           // Database connectivity
    .AddCheck("api", () => HealthCheckResult.Healthy("API is running"));
```

### Logging
```csharp
// Structured logging with Serilog
Log.Information("Event {EventId} processed for customer {CustomerId}", 
    eventId, customerId);
```

## 🚨 Troubleshooting

### Common Issues

#### API Won't Start
```bash
# Check .NET version
dotnet --version

# Check port availability
netstat -an | grep 5194

# Check for binding issues
dotnet run --urls "http://localhost:5194"
```

#### Database Connection Failed
```bash
# Test PostgreSQL connection
psql -h hostname -U username -d database_name

# Check connection string format
echo $ConnectionStrings__Default

# Verify database exists
dotnet ef database update --verbose
```

#### High Memory Usage
```bash
# Monitor memory usage
dotnet-monitor collect --urls https://localhost:5194

# Check for memory leaks
dotnet-dump collect -p $(pgrep -f "Kilometers.Api")
```

#### Performance Issues
```bash
# Enable detailed timing
export ASPNETCORE_DETAILEDERRORS=true

# Profile API calls
dotnet trace collect --providers Microsoft-AspNetCore-Server-Kestrel

# Monitor database queries
export Logging__LogLevel__Microsoft.EntityFrameworkCore.Database.Command=Information
```

### Debug Configuration
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Debug",
      "Microsoft.AspNetCore": "Information",
      "Microsoft.EntityFrameworkCore.Database.Command": "Information"
    }
  },
  "DetailedErrors": true
}
```

### Health Check URLs
```bash
# Basic health
curl https://localhost:5194/health

# Detailed health (if configured)
curl https://localhost:5194/health/detailed
```

## 🔄 Event Processing Pipeline

### Event Flow
```
CLI Event → API Endpoint → Validation → Event Store → Background Processing → Analytics
```

### Background Services
```csharp
// Event processing service
public class EventProcessorService : BackgroundService
{
    // Risk analysis
    // Cost calculation  
    // Aggregation for analytics
}
```

### Storage Strategy
- **Write Path**: Direct to PostgreSQL event table
- **Read Path**: Materialized views for analytics
- **Partitioning**: By customer ID for scale
- **Retention**: Configurable data retention policies

## 📈 Performance

### Benchmarks
- **Throughput**: 1000+ events/second on single instance
- **Latency**: <100ms P99 for event ingestion
- **Memory**: <500MB working set under load
- **CPU**: <50% utilization at peak load

### Optimization Tips
```csharp
// Batch processing for higher throughput
app.MapPost("/api/events/batch", async (EventBatchDto batch) => {
    // Process multiple events efficiently
});

// Connection pooling
builder.Services.AddDbContextPool<KilometersDbContext>(options =>
    options.UseNpgsql(connectionString));
```

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-endpoint`
3. Write tests for new functionality
4. Implement changes
5. Run test suite: `dotnet test`
6. Submit pull request

### Code Standards
- **C# Conventions**: Follow Microsoft C# coding conventions
- **Async/Await**: Use async patterns throughout
- **Dependency Injection**: Use built-in DI container
- **Error Handling**: Consistent error responses and logging

### Database Changes
```bash
# Add new migration
dotnet ef migrations add NewFeature

# Review generated SQL
dotnet ef migrations script

# Test migration
dotnet ef database update --connection "test_connection_string"
```

## 📄 License

MIT License - see [LICENSE](../LICENSE) for details.

## 🆘 Support

- **Documentation**: [https://docs.kilometers.ai](https://docs.kilometers.ai)
- **API Issues**: [GitHub Issues](https://github.com/kilometers-ai/kilometers/issues)
- **Email**: api-support@kilometers.ai

---

**Kilometers API** - Scalable event ingestion and analytics for AI monitoring. 