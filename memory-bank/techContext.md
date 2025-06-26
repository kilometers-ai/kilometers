# Technical Context: Kilometers.ai

## Technology Stack

### CLI Component (Go)
- **Language**: Go 1.24.4
- **Rationale**: Cross-platform binary distribution, excellent for CLI tools
- **Key Libraries**: 
  - Standard library for process management
  - JSON handling for MCP protocol parsing
  - HTTP client for API communication
- **Build Targets**: Windows, macOS (Intel/ARM), Linux (x64/ARM)

### API Backend (.NET 9)
- **Framework**: .NET 9 with Minimal APIs
- **Architecture**: Hexagonal/Clean Architecture
- **Key Features**:
  - Minimal API endpoints for high performance
  - Built-in dependency injection
  - Native JSON handling
  - Async/await throughout

### Database (PostgreSQL)
- **Platform**: Azure PostgreSQL Flexible Server
- **Version**: PostgreSQL 15
- **Key Features**:
  - JSONB for flexible event storage
  - Advanced indexing for time-series queries
  - Built-in JSON path operations
- **Schema Strategy**: Event sourcing with aggregated views

### Infrastructure (Azure + Terraform)
- **Platform**: Microsoft Azure
- **IaC Tool**: Terraform
- **Key Services**:
  - App Service (Linux) for API hosting
  - PostgreSQL Flexible Server for data
  - Storage Account for file/blob storage
  - Application Insights for monitoring

### Frontend (Planned - React)
- **Framework**: React with modern hooks
- **Styling**: Tailwind CSS
- **State Management**: React Query for server state
- **Deployment**: Static hosting via Azure Storage + CDN

## Development Environment

### Prerequisites
- Go 1.24.4+ for CLI development
- .NET 9 SDK for API development
- Terraform for infrastructure
- Azure CLI for deployment
- PostgreSQL client for database work

### Local Setup
```bash
# CLI development
cd cli/
go mod tidy
go run . --help

# API development  
cd api/Kilometers.Api/
dotnet run
# API available at https://localhost:5001

# Infrastructure
cd terraform/
terraform init
terraform plan
```

### Project Structure
```
kilometers/
├── cli/                    # Go CLI wrapper
│   ├── go.mod
│   └── main.go            # (to be created)
├── api/                   # .NET API backend
│   └── Kilometers.Api/
│       ├── Program.cs     # Minimal API setup
│       └── *.csproj       # Project file
├── terraform/             # Infrastructure as Code
│   └── main.tf           # (to be populated)
├── docs/                  # Documentation
│   └── kilometers-functional-spec.md
└── memory-bank/           # Project memory system
```

## Technical Constraints

### Performance Requirements
- **CLI Overhead**: <5ms latency added to MCP calls
- **API Response**: <100ms for event ingestion
- **Dashboard Load**: <2s initial page load
- **Throughput**: Handle 1000+ events/second per customer

### Compatibility Requirements
- **MCP Protocol**: Support MCP 1.0+ specification
- **Operating Systems**: Windows 10+, macOS 11+, Linux (major distros)
- **AI Tools**: Cursor, Claude Desktop, custom MCP implementations
- **Browsers**: Chrome 100+, Firefox 100+, Safari 15+, Edge 100+

### Security Requirements
- **Data Encryption**: TLS 1.3 for all communication
- **API Authentication**: JWT tokens with rotation
- **Data Retention**: Configurable (7-90 days)
- **PII Handling**: Automatic detection and redaction
- **Audit Logging**: All administrative actions logged

### Scalability Constraints
- **Initial Scale**: Single Azure region, single app service
- **Growth Path**: Auto-scaling app services, read replicas
- **Data Partitioning**: By customer ID for horizontal scaling
- **CDN Strategy**: Static assets via Azure CDN

## Dependencies

### External Services
- **Azure Services**: App Service, PostgreSQL, Storage, Application Insights
- **Payment Processing**: Stripe for subscription billing
- **Domain/DNS**: Azure DNS or external provider
- **SSL Certificates**: Let's Encrypt via Azure

### Critical Libraries
- **Go CLI**: Standard library only (minimize dependencies)
- **.NET API**: Microsoft.AspNetCore.App (included in runtime)
- **Database**: Npgsql for PostgreSQL connectivity
- **JSON**: System.Text.Json for serialization

### Development Tools
- **IDE**: Visual Studio Code (recommended)
- **Version Control**: Git with GitHub
- **CI/CD**: GitHub Actions
- **Monitoring**: Application Insights + custom dashboards

## Configuration Management

### Environment Variables
```bash
# CLI Configuration
KILOMETERS_API_URL=https://api.kilometers.ai
KILOMETERS_API_KEY=user_api_key

# API Configuration
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__Default=postgresql_connection_string
ApplicationInsights__InstrumentationKey=insights_key
```

### Configuration Sources (Priority Order)
1. Environment variables
2. Configuration files (appsettings.json)
3. Azure Key Vault (production secrets)
4. Default values

## Deployment Strategy

### CLI Distribution
- **GitHub Releases**: Automated builds for all platforms
- **Package Managers**: Homebrew (macOS), Chocolatey (Windows), APT (Linux)
- **Install Script**: One-liner curl script for universal installation

### API Deployment
- **Strategy**: Blue-green deployment via Azure App Service slots
- **Database Migrations**: Automatic on deployment via EF Core
- **Configuration**: Azure App Configuration for feature flags
- **Monitoring**: Application Insights with custom metrics

### Infrastructure Updates
- **Terraform State**: Remote state in Azure Storage
- **Change Management**: PR-based infrastructure changes
- **Secrets Management**: Azure Key Vault integration
- **Backup Strategy**: Automated PostgreSQL backups

## Monitoring & Observability

### Application Monitoring
- **Metrics**: Response times, error rates, throughput
- **Logging**: Structured logging with correlation IDs
- **Tracing**: Distributed tracing for request flows
- **Alerting**: Azure Monitor alerts for critical issues

### Business Monitoring
- **Usage Metrics**: Events processed, customers active
- **Performance Metrics**: CLI overhead, API latency
- **Cost Metrics**: Azure resource usage and costs
- **Health Checks**: Synthetic monitoring for uptime 