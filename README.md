# Kilometers.ai

> **Your AI's digital odometer** - Track every interaction, understand patterns, control costs.

Kilometers.ai monitors AI agent activity by transparently wrapping MCP (Model Context Protocol) servers, providing immediate visibility into AI tool usage, costs, and potential risks with a 30-second setup.

[![Build Status](https://github.com/kilometers-ai/kilometers/actions/workflows/deploy.yml/badge.svg)](https://github.com/kilometers-ai/kilometers/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Go Version](https://img.shields.io/badge/Go-1.24.4+-blue.svg)](https://golang.org)
[![.NET Version](https://img.shields.io/badge/.NET-9.0-purple.svg)](https://dotnet.microsoft.com)

## 🚀 Quick Start

```bash
# 1. Install the CLI wrapper
curl -sSL https://get.kilometers.ai | sh

# 2. Wrap your MCP server
km npx @modelcontextprotocol/server-github

# 3. View insights at https://app.kilometers.ai
```

That's it! Your AI interactions are now monitored with zero configuration changes.

## 🎯 What is Kilometers.ai?

### The Problem
Organizations using AI agents have **zero visibility** into:
- What tools their AI is accessing
- How much these interactions cost  
- Whether sensitive data is being exposed
- Performance patterns and bottlenecks

### The Solution
Kilometers.ai provides a transparent monitoring layer for AI agents:

```
[AI Tool (Cursor/Claude)] 
    ↓ MCP Protocol
[km CLI Wrapper] ← Monitors transparently
    ↓ 
[Original MCP Server (GitHub/Slack/etc.)]
    ↓ Events
[Kilometers.ai Dashboard] ← Real-time insights
```

### Key Benefits
- ✅ **30-second setup** - No code changes required
- ✅ **Universal compatibility** - Works with any MCP server
- ✅ **Zero performance impact** - <5ms overhead
- ✅ **Complete visibility** - All AI interactions captured
- ✅ **Cost transparency** - Real-time usage tracking
- ✅ **Security monitoring** - Risk detection and alerts

## 🏗️ Architecture

### System Components
```
📦 kilometers/
├── 🔧 cli/               # Go CLI wrapper (transparent MCP proxy)
├── 🌐 api/               # .NET 9 API backend (event processing)
├── 🏗️ terraform/         # Azure infrastructure (production deployment)
├── 📖 docs/              # Documentation and guides
└── 📚 memory-bank/       # Project context and progress tracking
```

### Technology Stack
- **CLI**: Go 1.24.4 (cross-platform, minimal dependencies)
- **API**: .NET 9 with minimal APIs (high performance, cloud-native)
- **Database**: PostgreSQL 15 (event sourcing, JSONB support)
- **Infrastructure**: Azure (App Service, Key Vault, Application Insights)
- **CI/CD**: GitHub Actions (automated testing and deployment)

## 📖 Component Documentation

### [CLI Documentation](cli/README.md)
Learn how to install, configure, and use the Kilometers CLI wrapper:
- Installation options (curl, manual, build from source)
- Configuration (environment variables, config files)
- Usage examples with different MCP servers
- Troubleshooting and performance monitoring

### [API Documentation](api/README.md)
Understand the backend API for event processing and analytics:
- Development setup and dependencies
- API endpoints and data models
- Database configuration and migrations
- Deployment and scaling guidance

### [Infrastructure Documentation](terraform/README.md)
Deploy production infrastructure to Azure:
- Prerequisites and Azure setup
- Terraform configuration and deployment
- Cost optimization and monitoring
- Security best practices

## 🎮 Interactive Demo

Try the demo script to see Kilometers.ai in action:

```bash
# Run the interactive demo
./demo.sh

# This will:
# 1. Set up a mock MCP server
# 2. Demonstrate CLI wrapping
# 3. Show event capture
# 4. Display API integration
```

## 🔧 Development

### Local Setup
```bash
# Clone the repository
git clone https://github.com/kilometers-ai/kilometers
cd kilometers

# Run API locally
cd api/Kilometers.Api
dotnet run
# API available at: https://localhost:5194

# Build CLI locally  
cd ../../cli
go build -o km .
./km --help
```

### Testing
```bash
# Test CLI
cd cli/
go test ./...

# Test API
cd api/Kilometers.Api/
dotnet test

# Integration test
./demo.sh
```

## 🚀 Production Deployment

### Prerequisites
- Azure subscription
- Azure CLI installed
- Terraform installed
- .NET 9 SDK installed

### One-Command Deployment
```bash
# Setup Azure backend (first time only)
./scripts/setup-azure.sh

# Deploy complete infrastructure and application
./scripts/deploy.sh
```

### Manual Deployment
```bash
# 1. Configure Terraform variables
cp terraform/terraform.tfvars.example terraform/terraform.tfvars
# Edit terraform.tfvars with your database password

# 2. Deploy infrastructure
cd terraform/
terraform init
terraform plan -var-file="terraform.tfvars"
terraform apply -var-file="terraform.tfvars"

# 3. Deploy API
cd ../api/Kilometers.Api/
dotnet publish --configuration Release
# Follow deployment guide in api/README.md

# 4. Build and distribute CLI
cd ../../cli/
./build-all-platforms.sh
```

## 🔍 Usage Examples

### Basic MCP Server Monitoring
```bash
# GitHub MCP Server
km npx @modelcontextprotocol/server-github

# Slack MCP Server
km python -m slack_mcp_server

# File System MCP Server
km npx @modelcontextprotocol/server-filesystem --path /workspace
```

### Configure for AI Tools

#### Cursor
```json
{
  "mcp.servers": {
    "github": {
      "command": "km",
      "args": ["npx", "@modelcontextprotocol/server-github"]
    }
  }
}
```

#### Claude Desktop
```json
{
  "mcpServers": {
    "github": {
      "command": "km", 
      "args": ["npx", "@modelcontextprotocol/server-github"]
    }
  }
}
```

### Production Configuration
```bash
# Set production API endpoint
export KILOMETERS_API_URL="https://api.kilometers.ai"
export KILOMETERS_API_KEY="your-api-key"

# Run with production settings
km your-mcp-server
```

## 📊 What Gets Monitored

### Captured Data
- **MCP JSON-RPC Messages**: All requests and responses
- **Method Calls**: `tools/call`, `resources/read`, `prompts/get`, etc.
- **Performance Metrics**: Response times, payload sizes, error rates
- **Cost Estimates**: Usage-based cost calculations
- **Risk Analysis**: Security and compliance assessments

### Example Event
```json
{
  "id": "evt_1234567890abcdef",
  "timestamp": "2024-01-15T10:30:45Z",
  "direction": "request",
  "method": "tools/call", 
  "payload": "eyJ0b29sIjogImdpdGh1Yi1zZWFyY2giLCAiYXJncyI6IHt9fQ==",
  "size": 156,
  "costEstimate": 0.00156,
  "riskScore": 3
}
```

## 🔒 Security & Privacy

### Data Protection
- **Encryption**: All data encrypted in transit (TLS 1.3) and at rest
- **Authentication**: Secure API keys and Azure managed identity
- **Access Control**: Role-based access with least privilege
- **Audit Trail**: Complete logging of all access and changes

### Privacy Controls
- **Opt-out**: Remove wrapper to stop monitoring instantly
- **Data Retention**: Configurable retention periods (7-90 days)
- **Data Export**: Request complete data exports anytime
- **Data Deletion**: Request immediate data deletion anytime

### Compliance
- **GDPR Ready**: Built-in privacy controls and data rights
- **SOC 2 Type II**: Security controls and audit procedures
- **Enterprise**: Custom compliance requirements supported

## 💰 Pricing

### Free Tier
- 7-day data retention
- Basic monitoring and analytics
- Community support

### Pro Tier - $49/month
- 90-day data retention
- Advanced analytics and insights
- Cost optimization recommendations
- Email support
- API access

### Enterprise - Custom Pricing
- Custom data retention
- SSO integration
- Custom compliance requirements
- Dedicated support
- On-premises deployment options

## 🎯 Roadmap

### Phase 1: Core Monitoring ✅
- [x] CLI wrapper for transparent MCP monitoring
- [x] Cloud API for event processing
- [x] Basic cost and risk analysis
- [x] Production deployment infrastructure

### Phase 2: Dashboard & Analytics (Q1 2024)
- [ ] React web dashboard
- [ ] Real-time event visualization
- [ ] Advanced cost tracking
- [ ] Custom alerting system

### Phase 3: Intelligence (Q2 2024)
- [ ] ML-based anomaly detection
- [ ] Predictive cost modeling
- [ ] Performance optimization recommendations
- [ ] Advanced security analysis

### Phase 4: Enterprise (Q3 2024)
- [ ] Multi-tenant architecture
- [ ] SSO integration
- [ ] Advanced reporting
- [ ] On-premises deployment

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Start for Contributors
```bash
# Fork and clone
git clone https://github.com/your-username/kilometers
cd kilometers

# Set up development environment
./scripts/dev-setup.sh

# Run tests
./scripts/test-all.sh

# Submit pull request
```

### Areas for Contribution
- 🔧 **CLI enhancements**: Cross-platform compatibility, performance
- 🌐 **API features**: New endpoints, analytics capabilities  
- 🎨 **Dashboard**: React components, data visualization
- 📖 **Documentation**: Guides, tutorials, examples
- 🧪 **Testing**: Unit tests, integration tests, performance tests

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🆘 Support

### Community Support
- **Documentation**: [https://docs.kilometers.ai](https://docs.kilometers.ai)
- **GitHub Issues**: [Report bugs and request features](https://github.com/kilometers-ai/kilometers/issues)
- **Discord**: [Join our community](https://discord.gg/kilometers)

### Commercial Support
- **Email**: support@kilometers.ai
- **Enterprise**: enterprise@kilometers.ai
- **Security**: security@kilometers.ai

## 🏆 Acknowledgments

- **MCP Protocol**: Built on the [Model Context Protocol](https://modelcontextprotocol.io/)
- **Azure**: Hosted on Microsoft Azure cloud platform
- **Open Source**: Powered by Go, .NET, PostgreSQL, and Terraform

---

<div align="center">

**[Get Started](https://get.kilometers.ai)** | **[Documentation](https://docs.kilometers.ai)** | **[Dashboard](https://app.kilometers.ai)**

Made with ❤️ for the AI developer community

</div> 