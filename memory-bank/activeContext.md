# Active Context: Kilometers.ai

## Current Work Focus

### Project Status: Foundation Phase
We are in the very early stages of Kilometers.ai development. The project structure has been established and the functional specification is complete, but core implementation work is just beginning.

### Immediate Priority: Phase 1 - CLI Wrapper Implementation
The first critical milestone is building the Go CLI wrapper that can transparently monitor MCP server interactions.

## Recent Changes

### ✅ Completed
- **Project Structure**: Basic directory structure established with CLI, API, and infrastructure components
- **Functional Specification**: Comprehensive 457-line specification document created
- **Technology Decisions**: Go for CLI, .NET 9 for API, PostgreSQL for storage, Azure for hosting
- **Memory Bank**: Complete documentation system established

### 🔧 Current API State
- **Scaffold Created**: Basic .NET 9 minimal API with "Hello World" endpoint
- **Project File**: Standard web project configuration with .NET 9 target
- **Configuration**: Basic appsettings structure in place

### 🔧 Current CLI State  
- **Module Initialized**: Go module created with Go 1.24.4
- **No Implementation**: Main.go and core wrapper logic not yet created

### 🔧 Current Infrastructure State
- **Terraform Directory**: Created but empty main.tf file
- **No Deployment**: No Azure resources configured or deployed

## Active Decisions & Considerations

### Architecture Decisions Made
1. **Transparent Proxy Pattern**: CLI will act as transparent wrapper around MCP servers
2. **Event Sourcing**: All interactions captured as immutable events
3. **Hexagonal Architecture**: Clean separation between domain, infrastructure, and API layers
4. **Minimal APIs**: Using .NET 9 minimal APIs for high performance and simplicity

### Technical Decisions Pending
1. **CLI Event Batching**: How to buffer and batch events for API transmission
2. **API Authentication**: JWT vs API key strategy for CLI authentication
3. **Database Schema**: Final event table structure and indexing strategy
4. **Error Handling**: Graceful degradation when API is unavailable

### Design Questions to Resolve
1. **CLI Configuration**: How users will configure API endpoints and authentication
2. **Cross-Platform Distribution**: Package manager strategy for different platforms
3. **Performance Monitoring**: How to measure and minimize CLI overhead
4. **Development Workflow**: Local testing setup for CLI + API integration

## Next Steps (Priority Order)

### Immediate (This Week)
1. **Implement CLI Core** (`cli/main.go`)
   - Basic process wrapper functionality
   - MCP protocol parsing and logging
   - Event structure definition

2. **Extend API Foundation** (`api/Kilometers.Api/`)
   - Event ingestion endpoint
   - Basic domain models
   - Database context setup

3. **Infrastructure Setup** (`terraform/main.tf`)
   - Azure resource group and basic services
   - PostgreSQL database configuration
   - App Service for API hosting

### Short Term (Next 2 Weeks)
1. **CLI-API Integration**
   - HTTP client in CLI for event transmission
   - Authentication mechanism
   - Error handling and retry logic

2. **Event Processing Pipeline**
   - Background event processing in API
   - Risk analysis implementation
   - Cost calculation logic

3. **Basic Dashboard**
   - React SPA setup
   - Activity feed component
   - Real-time updates via polling

### Medium Term (Next Month)
1. **Production Deployment**
   - CI/CD pipeline via GitHub Actions
   - Multi-platform CLI builds
   - Azure production environment

2. **Advanced Features**
   - Cost tracking and alerts
   - Security risk detection
   - Performance analytics

## Current Blockers & Risks

### Technical Risks
- **MCP Protocol Complexity**: Need to ensure robust parsing of all MCP message types
- **Cross-Platform Compatibility**: CLI must work reliably on Windows, macOS, and Linux
- **Performance Overhead**: Must minimize latency impact on AI workflows

### Development Risks
- **Azure Learning Curve**: Team needs to become proficient with Azure services
- **Go Expertise**: May need to ramp up on Go best practices for CLI development
- **Real-World Testing**: Need access to various MCP servers for comprehensive testing

### Business Risks
- **Market Validation**: Need to validate demand with real users quickly
- **Competition**: Other monitoring solutions may emerge
- **MCP Protocol Changes**: Dependency on external protocol specification

## Key Metrics to Track

### Development Metrics
- **CLI Performance**: Latency overhead per MCP interaction
- **API Throughput**: Events processed per second
- **Test Coverage**: Unit and integration test coverage percentage
- **Build Success Rate**: CI/CD pipeline reliability

### User Experience Metrics
- **Installation Success**: Percentage of successful CLI installations
- **Setup Time**: Time from installation to first dashboard insights
- **Error Rates**: CLI crash frequency and API error rates
- **Data Accuracy**: Correctness of cost and usage calculations

## Environment Setup Notes

### Development Requirements
- Go 1.24.4+ for CLI development
- .NET 9 SDK for API development  
- PostgreSQL client for database work
- Azure CLI for infrastructure management
- Terraform for infrastructure as code

### Local Testing Strategy
1. **CLI Testing**: Mock MCP servers for isolated testing
2. **API Testing**: In-memory database for unit tests
3. **Integration Testing**: Docker Compose for full stack testing
4. **E2E Testing**: Real MCP servers in test environment

## Communication & Coordination

### Documentation Strategy
- **Memory Bank**: Keep current context updated after major changes
- **Code Comments**: Focus on business logic and complex algorithms
- **API Documentation**: OpenAPI spec for dashboard integration
- **CLI Help**: Comprehensive help text and examples

### Decision Log
- All architectural decisions documented in systemPatterns.md
- Technical trade-offs captured in Memory Bank updates
- User feedback and feature requests tracked in Linear
- Performance benchmarks documented for optimization

---

*Last Updated: During Memory Bank initialization*
*Next Update: After CLI core implementation* 