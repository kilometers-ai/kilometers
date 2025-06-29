# Kilometers.ai - Product Knowledge Reference

## 🎯 Product Overview

**Kilometers.ai** is a production-ready AI monitoring system that provides transparent visibility into AI agent interactions. It acts as a "digital odometer" for AI tools, tracking every interaction, cost, and potential security risk.

### Core Value Proposition
- **30-second setup**: No code changes required - just prefix any MCP command with `km`
- **Universal compatibility**: Works with any MCP (Model Context Protocol) server
- **Complete visibility**: Monitor all AI tool interactions in real-time
- **Cost transparency**: Track and optimize AI usage expenses
- **Security monitoring**: Detect unusual patterns and potential risks

### Current Status
✅ **LAUNCH READY** - All technical components deployed and functional  
🚧 **Pending**: Custom domain configuration for production launch

## 🏗️ Technical Architecture

### System Flow
```
[AI Tool] → [km CLI Wrapper] → [MCP Server]
               ↓ (async events)
           [Azure API] → [PostgreSQL] → [Dashboard]
```

### Technology Stack
- **CLI**: Go 1.24.4 (transparent MCP proxy with <5ms overhead)
- **API**: .NET 9 minimal APIs (high-performance event processing)
- **Database**: PostgreSQL 15 (event sourcing with JSONB)
- **Infrastructure**: Azure (App Service, Static Web Apps, Key Vault)
- **Marketing**: Next.js 15 with React 19 (14 feature flags)
- **Deployment**: Terraform + GitHub Actions (fully automated CI/CD)

## 📁 Project Structure & Migration

### Current State (In Migration)
```
/Users/milesangelo/Source/active/kilometers.ai/
├── kilometers/                    # 🟡 Original monorepo (active)
│   ├── api/                      # .NET 9 API backend
│   ├── cli/                      # Go CLI tool (km binary)
│   ├── marketing/                # Next.js marketing site
│   ├── terraform/                # Infrastructure as Code
│   ├── dashboard/                # Future dashboard component
│   └── .github/                  # CI/CD workflows
│
└── kilometers-infrastructure/     # 🟢 New infrastructure repo
    ├── terraform/                # Modular Terraform structure
    ├── scripts/                  # Infrastructure automation
    └── .github/                  # Separate CI/CD
```

### Migration Status
- ✅ **kilometers-infrastructure**: Partially migrated (minimal scaffold)
- ❌ **kilometers-api**: Still in monorepo
- ❌ **kilometers-cli**: Still in monorepo
- ❌ **kilometers-marketing**: Still in monorepo

## 🛠️ Component Details

### CLI Component (`km` binary)
- **Language**: Go 1.24.4
- **Purpose**: Transparent wrapper between AI tools and MCP servers
- **Performance**: <5ms overhead verified
- **Cross-platform**: Windows, macOS (Intel/ARM), Linux
- **Key Files**: `main.go`, `client.go`, `config.go`
- **Architecture**: Event capture → batch processing → async API calls

### API Component
- **Framework**: .NET 9 minimal APIs
- **Database**: PostgreSQL with automatic migrations
- **Key Endpoints**: `/api/events`, `/api/activity`, `/api/stats`, `/health`
- **Security**: Bearer token auth, Azure Key Vault integration
- **Architecture**: Clean domain model with event sourcing

### Marketing Site
- **Framework**: Next.js 15 with React 19 and TypeScript
- **Styling**: Tailwind CSS
- **Deployment**: Azure Static Web Apps
- **Features**: 14 feature flags for controlled rollout
- **OAuth**: Split pattern (marketing initiates, main app completes)

### Infrastructure
- **Provider**: Azure with complete Terraform automation
- **Environments**: Dev/prod separation with variable files
- **State Management**: Remote backend with proper state management
- **CI/CD**: Automated deployment on main branch pushes
- **Modules**: Reusable components for App Service, Database, Static Web Apps

## 🚀 Development & Operations

### Key Environments & URLs
- **API Health**: `https://app-kilometers-api-dev-[suffix].azurewebsites.net/health`
- **Marketing Site**: Azure Static Web Apps (domain pending)
- **Monitoring**: Application Insights with custom telemetry

### Critical Development Rules

#### Terraform State Management ⚠️
**ALWAYS use environment-specific variable files**:
```bash
# ✅ CORRECT
terraform plan -var-file=config/dev.tfvars
terraform apply -var-file=config/dev.tfvars

# ❌ NEVER DO THIS
terraform plan
terraform apply
```

#### Development Workflow
```bash
# API Development
cd api/Kilometers.Api && dotnet run
# → https://localhost:5194

# CLI Development  
cd cli && go build -o km . && ./km --help

# Marketing Site
cd marketing && npm install && npm run dev
# → http://localhost:3001

# Infrastructure
cd terraform && terraform init && terraform plan -var-file=config/dev.tfvars
```

### Testing & Validation
```bash
# Comprehensive demo
./demo.sh

# Component tests
cd cli && go test ./...
cd api && dotnet test
cd marketing && npm test
cd terraform && terraform validate
```

## 🎯 Key Design Patterns

### Transparent Proxy Pattern (CLI)
- CLI acts as transparent proxy between AI tools and MCP servers
- Captures events without modifying communication
- Preserves original tool behavior completely

### Event Sourcing Pattern (API)
- All AI interactions stored as immutable events
- PostgreSQL JSONB for flexible event storage
- Append-only pattern, never modified

### Feature Flag Pattern (Marketing)
- 14 environment variables control site behavior
- Enables controlled rollout and A/B testing
- Progressive disclosure of features

### Infrastructure as Code
- Everything defined in Terraform for reproducible deployments
- Environment separation with variable files
- Automated CI/CD for all components

## 🛡️ Security & Monitoring

### Security Implementation
- **Encryption**: TLS 1.3 in transit, encrypted at rest
- **Authentication**: Bearer tokens and Azure managed identity
- **Access Control**: Role-based access with least privilege
- **Key Management**: Azure Key Vault for secrets
- **Audit Trail**: Complete logging of all access and changes

### Monitoring & Health
- **API Health Checks**: `/health` endpoint with detailed status
- **Application Insights**: Automatic telemetry and custom metrics
- **Database**: PostgreSQL flexible server with automated backups
- **Performance**: <5ms CLI overhead maintained
- **Reliability**: 99.9% API uptime target

## 📊 Success Metrics

### Technical KPIs
- **Performance**: <5ms CLI overhead
- **Reliability**: 99.9% API uptime
- **Scalability**: 10K events/minute per customer
- **Compatibility**: All MCP servers without modification

### Business KPIs
- **Setup Time**: 30 seconds to first insight
- **Daily Usage**: Dashboard engagement metrics
- **Cost Savings**: Per-customer optimization value
- **Growth**: Month-over-month acquisition

## 🔮 Roadmap & Priorities

### Immediate (Q3 2025)
- **Custom Domain Configuration**: Configure kilometers.ai domain
- **Complete Repository Migration**: Finish multi-repo architecture
- **Dashboard Application**: React SPA with user authentication

### Near-term (Q4 2025)
- **Advanced Analytics**: ML-powered insights
- **Enhanced Monitoring**: Security risk detection
- **Performance Optimization**: Sub-millisecond overhead

### Long-term (2026)
- **Enterprise Features**: SSO and multi-tenant
- **On-premises Deployment**: Self-hosted options
- **Advanced Integrations**: Broader AI tool ecosystem

## 🧠 Key Lessons & Best Practices

### Technical Lessons
1. **State Management**: Terraform consistency is critical
2. **Dependency Management**: Remove unused packages early
3. **Proxy Architecture**: Go excels at minimal-overhead wrappers
4. **Event Storage**: PostgreSQL JSONB provides flexibility
5. **Feature Control**: Environment variables enable safe rollouts

### Product Lessons
1. **Developer Experience**: Zero-friction setup is non-negotiable
2. **Monitoring Philosophy**: Visibility without modification wins
3. **Infrastructure**: Automation from day one prevents debt
4. **Marketing**: Technical credibility requires working demos

### Operational Lessons
1. **Documentation**: Memory bank pattern preserves context
2. **Iteration**: Ship working minimums before complexity
3. **Deployment**: Separate concerns allow independent releases
4. **Monitoring**: Health endpoints and observability are essential

## 🎯 Project Mission

**Kilometers.ai provides transparent AI monitoring that enables organizations to understand, optimize, and secure their AI agent interactions without disrupting existing workflows.**

The project represents the convergence of developer tools, AI monitoring, and cloud-native architecture to solve a critical visibility gap in the AI-powered development ecosystem.

---

**Status**: Production Ready  
**Next Milestone**: Custom Domain Configuration  
**Launch Target**: Q3 2025