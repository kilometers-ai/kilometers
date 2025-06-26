# Kilometers Infrastructure

This directory contains Terraform configurations for deploying the complete Kilometers.ai infrastructure to Microsoft Azure.

## 🏗️ Infrastructure Overview

The Terraform configuration creates a production-ready environment with:

- **Azure App Service** (Linux) for hosting the .NET API
- **PostgreSQL Flexible Server** for event storage  
- **Azure Key Vault** for secrets management
- **Application Insights** for monitoring and telemetry
- **Storage Account** for logs and static files
- **Managed Identity** for secure service-to-service authentication

## 🚀 Quick Deployment

```bash
# 1. Setup Azure backend and credentials
./scripts/setup-azure.sh

# 2. Deploy complete infrastructure
./scripts/deploy.sh
```

## 📋 Prerequisites

### Required Tools
- **Azure CLI** - [Install guide](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
- **Terraform** 1.0+ - [Install guide](https://terraform.io/downloads)
- **.NET 9 SDK** - [Install guide](https://dotnet.microsoft.com/download/dotnet/9.0)

### Azure Account Setup
```bash
# Login to Azure
az login

# Set subscription (if you have multiple)
az account set --subscription "your-subscription-id"

# Verify login
az account show
```

## ⚙️ Configuration

### Required Variables
Create `terraform.tfvars`:
```hcl
# Database administrator password
db_password = "YourSecurePassword123!"
```

### Variable Requirements
- **db_password**: 
  - Minimum 12 characters
  - Must include uppercase, lowercase, numbers, and special characters
  - No quotes or spaces that could cause shell issues

### Example terraform.tfvars
```hcl
# Required
db_password = "Km@2024SecurePass!"

# Optional overrides
# location = "West US 2"
# environment = "staging"
```

## 🎯 Deployment Steps

### Step 1: Backend Setup (First Time Only)
```bash
# Create Terraform state storage and service principal
./scripts/setup-azure.sh
```

This script creates:
- Storage account for Terraform state
- Service principal for GitHub Actions
- Backend configuration in `backend.tf`
- GitHub secrets template

### Step 2: Plan Infrastructure
```bash
cd terraform/

# Initialize Terraform
terraform init

# Review deployment plan
terraform plan -var-file="terraform.tfvars"
```

### Step 3: Deploy Infrastructure
```bash
# Apply configuration
terraform apply -var-file="terraform.tfvars"

# Or use the automated script
../scripts/deploy.sh
```

### Step 4: Verify Deployment
```bash
# Check API health
curl $(terraform output -raw api_url)/health

# Test database connection
az postgres flexible-server execute \
  --name $(terraform output -raw database_name) \
  --database-name kilometers \
  --admin-user kilometersdba \
  --admin-password "YourPassword" \
  --querytext "SELECT version();"
```

## 📦 Created Resources

### Core Infrastructure
```hcl
# Resource Group
azurerm_resource_group.main
├── Name: rg-kilometers-prod
└── Location: East US

# App Service Plan
azurerm_service_plan.main  
├── Name: asp-kilometers-prod-{suffix}
├── OS: Linux
└── SKU: F1 (Free tier)

# Web App
azurerm_linux_web_app.api
├── Name: app-kilometers-api-{suffix}
├── Runtime: .NET 9
└── Health Check: /health

# PostgreSQL Server
azurerm_postgresql_flexible_server.main
├── Name: psql-kilometers-prod-{suffix}
├── Version: 15
├── SKU: B_Standard_B1ms
└── Storage: 32GB

# Database
azurerm_postgresql_flexible_server_database.main
├── Name: kilometers
├── Charset: utf8
└── Collation: en_US.utf8
```

### Security & Monitoring
```hcl
# Key Vault
azurerm_key_vault.main
├── Name: kv-kilometers-{suffix}
├── Access: Managed identity
└── Secrets: Database connection string

# Application Insights
azurerm_application_insights.main
├── Name: ai-kilometers-prod-{suffix}
├── Type: web
└── Retention: 90 days

# Storage Account
azurerm_storage_account.main
├── Name: stkilometers{suffix}
├── Tier: Standard
└── Replication: LRS
```

## 🔧 Configuration Management

### Environment Variables (App Service)
```hcl
app_settings = {
  "ASPNETCORE_ENVIRONMENT"                  = "Production"
  "APPLICATIONINSIGHTS_CONNECTION_STRING"   = "InstrumentationKey=..."
  "ConnectionStrings__Default"              = "@Microsoft.KeyVault(...)"
  "KeyVault__VaultUri"                      = "https://kv-name.vault.azure.net/"
  "Logging__LogLevel__Default"              = "Information"
  "Logging__LogLevel__Microsoft.AspNetCore" = "Warning"
}
```

### Managed Identity Access
```hcl
# App Service gets Key Vault access
azurerm_key_vault_access_policy.app_service {
  secret_permissions = ["Get", "List"]
}
```

### Database Configuration
```hcl
# Connection string stored securely
azurerm_key_vault_secret.db_connection_string {
  name  = "DatabaseConnectionString"
  value = "Host=${server_fqdn};Database=kilometers;Username=admin;Password=${var.db_password};SSL Mode=Require"
}
```

## 🔄 Management Commands

### View Current State
```bash
# List all resources
terraform state list

# Show specific resource details
terraform state show azurerm_linux_web_app.api

# View outputs
terraform output
```

### Update Infrastructure
```bash
# Plan changes
terraform plan -var-file="terraform.tfvars"

# Apply changes
terraform apply -var-file="terraform.tfvars"
```

### Backup State
```bash
# Download current state
terraform state pull > backup-$(date +%Y%m%d).tfstate

# Restore from backup (emergency only)
terraform state push backup-20240115.tfstate
```

## 🗄️ Outputs

### Available Outputs
```bash
# API endpoint URL
terraform output api_url

# Database server FQDN
terraform output database_fqdn

# Storage account name
terraform output storage_account_name

# Application Insights instrumentation key
terraform output application_insights_key

# Resource group name
terraform output resource_group_name
```

### Using Outputs in Scripts
```bash
#!/bin/bash
API_URL=$(terraform output -raw api_url)
DB_HOST=$(terraform output -raw database_fqdn)

echo "Testing API at: $API_URL"
curl "$API_URL/health"
```

## 🔒 Security Best Practices

### Secrets Management
- **Never commit**: `terraform.tfvars` to version control
- **Use Key Vault**: All production secrets stored in Azure Key Vault
- **Managed Identity**: No service principal keys stored in app settings
- **Least Privilege**: Minimal IAM permissions for all resources

### Network Security
```hcl
# PostgreSQL firewall rules
azurerm_postgresql_flexible_server_firewall_rule.azure_services {
  name             = "AllowAllAzureServicesAndResourcesWithinAzureIps" 
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}
```

### Access Control
```hcl
# Key Vault access policy
azurerm_key_vault_access_policy.main {
  secret_permissions = [
    "Get", "List", "Set", "Delete", "Recover", "Backup", "Restore"
  ]
}
```

## 💰 Cost Optimization

### Current Configuration (Estimated Monthly Costs)
- **App Service Plan (F1)**: $0 (Free tier)
- **PostgreSQL (B1ms)**: ~$25-50
- **Storage Account**: ~$5-10
- **Application Insights**: $0-10 (based on usage)
- **Key Vault**: ~$1-5

### Scaling Options
```hcl
# Production scaling
resource "azurerm_service_plan" "main" {
  sku_name = "P1v3"  # Upgrade to Premium
}

resource "azurerm_postgresql_flexible_server" "main" {
  sku_name   = "GP_Standard_D2s_v3"  # General purpose
  storage_mb = 131072                # 128GB
}
```

## 🚨 Troubleshooting

### Common Issues

#### Terraform Init Failed
```bash
# Check Azure CLI login
az account show

# Verify backend configuration
cat backend.tf

# Reinitialize with backend
terraform init -backend-config=backend.tf
```

#### Database Password Validation Failed
```bash
# Test password complexity
echo "YourPassword123!" | grep -E '^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$'

# Check for shell escape issues
terraform plan -var 'db_password=YourPassword123!'
```

#### Resource Already Exists
```bash
# Import existing resource
terraform import azurerm_resource_group.main /subscriptions/{subscription-id}/resourceGroups/{name}

# Or force replace
terraform apply -replace=azurerm_resource_group.main
```

#### App Service Deployment Failed
```bash
# Check app service logs
az webapp log tail --resource-group rg-kilometers-prod --name app-kilometers-api

# Verify app settings
az webapp config appsettings list --resource-group rg-kilometers-prod --name app-kilometers-api

# Test health endpoint
curl $(terraform output -raw api_url)/health
```

### Debug Commands
```bash
# Enable Terraform debug logging
export TF_LOG=DEBUG
terraform apply

# Validate configuration
terraform validate

# Format code
terraform fmt -recursive

# Check state consistency
terraform plan -detailed-exitcode
```

### Resource Recovery
```bash
# View deleted resources (soft delete)
az resource list --include-deleted

# Recover soft-deleted Key Vault
az keyvault recover --name kv-kilometers-{suffix}

# Force delete stuck resources
az resource delete --resource-group rg-kilometers-prod --name stuck-resource --resource-type Microsoft.Web/sites
```

## 🔄 State Management

### Backend Configuration
```hcl
# backend.tf (auto-generated by setup script)
terraform {
  backend "azurerm" {
    resource_group_name  = "rg-terraform-state"
    storage_account_name = "stkm{random}"
    container_name       = "tfstate"
    key                  = "prod.terraform.tfstate"
  }
}
```

### State Operations
```bash
# Lock state (emergency)
terraform force-unlock <lock-id>

# Move resource between states
terraform state mv azurerm_resource_group.old azurerm_resource_group.new

# Remove resource from state (without destroying)
terraform state rm azurerm_resource_group.temp
```

## 🧪 Testing Infrastructure

### Terraform Testing
```bash
# Validate syntax
terraform validate

# Test plan without apply
terraform plan -var-file="test.tfvars"

# Test destroy plan
terraform plan -destroy -var-file="terraform.tfvars"
```

### Integration Testing
```bash
# Deploy test environment
terraform workspace new test
terraform apply -var-file="test.tfvars"

# Run tests
../scripts/test-infrastructure.sh

# Cleanup
terraform destroy -var-file="test.tfvars"
terraform workspace select default
terraform workspace delete test
```

## 🔄 CI/CD Integration

### GitHub Actions Integration
```yaml
# Workflow uses outputs from Terraform
- name: Deploy API
  run: |
    API_URL=$(terraform output -raw api_url)
    az webapp deployment source config-zip \
      --resource-group $(terraform output -raw resource_group_name) \
      --name $(echo $API_URL | sed 's|https://||' | sed 's|\.azurewebsites\.net||') \
      --src deployment.zip
```

### Environment Management
```bash
# Development environment
terraform workspace new dev
terraform apply -var-file="dev.tfvars"

# Staging environment  
terraform workspace new staging
terraform apply -var-file="staging.tfvars"

# Production environment
terraform workspace new prod
terraform apply -var-file="prod.tfvars"
```

## 📊 Monitoring & Alerting

### Application Insights Queries
```kusto
# API health monitoring
requests
| where name contains "health"
| summarize count() by resultCode
| render piechart

# Database connection errors
exceptions
| where outerMessage contains "database"
| summarize count() by bin(timestamp, 1h)
```

### Cost Monitoring
```bash
# View current costs
az consumption usage list --billing-period-name 202401

# Set up budget alerts
az consumption budget create \
  --budget-name "kilometers-monthly" \
  --amount 100 \
  --resource-group rg-kilometers-prod
```

## 🤝 Contributing

### Development Workflow
1. Create feature branch
2. Modify Terraform configurations
3. Run `terraform validate` and `terraform plan`
4. Test in development environment
5. Submit pull request with plan output

### Code Standards
```bash
# Format all files
terraform fmt -recursive

# Validate all configurations
terraform validate

# Check security with tfsec
tfsec .
```

## 📄 License

MIT License - see [LICENSE](../LICENSE) for details.

## 🆘 Support

- **Infrastructure Issues**: [GitHub Issues](https://github.com/kilometers-ai/kilometers/issues)
- **Azure Documentation**: [Azure Terraform Provider](https://registry.terraform.io/providers/hashicorp/azurerm/latest)
- **Email**: infrastructure@kilometers.ai

---

**Kilometers Infrastructure** - Production-ready Azure deployment for AI monitoring platform. 