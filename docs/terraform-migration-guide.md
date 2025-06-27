# Kilometers Terraform Migration & Monorepo CI/CD Guide

## Overview

This guide documents the migration of the Terraform infrastructure from the `platforms` project to the `kilometers` monorepo, along with the implementation of isolated CI/CD workflows for each component.

## Architecture Changes

### 1. Monorepo Structure with Isolated Workflows

```
kilometers/
├── .github/workflows/
│   ├── deploy-api.yml          # API deployment (triggers on api/* changes)
│   ├── release-cli.yml         # CLI releases (triggers on cli/* changes)
│   ├── deploy-infrastructure.yml # Terraform (triggers on terraform/* changes)
│   └── deploy-dashboard.yml    # Future: Dashboard deployment
├── api/                        # .NET 9 API
├── cli/                        # Go CLI tool
├── terraform/                  # Infrastructure as Code
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   ├── backend.tf
│   └── modules/               # Migrated from platforms project
├── dashboard/                  # Future: React dashboard
└── docs/

```

### 2. CI/CD Workflow Isolation

Each workflow is configured to only run when its respective directory changes:

- **API Workflow**: Triggers on `api/**` changes
- **CLI Workflow**: Triggers on `cli/**` changes  
- **Infrastructure Workflow**: Triggers on `terraform/**` changes

This prevents unnecessary builds and deployments, saving CI/CD minutes and reducing deployment time.

### 3. Terraform Migration

The Terraform configuration has been migrated and enhanced with:

- **Modular structure** from the working `platforms` project
- **GitHub provider** for automatic secret management
- **Environment-specific configurations** (dev/staging/prod)
- **CLI distribution infrastructure** with Azure CDN
- **Integrated monitoring** with Application Insights

## Migration Steps

### Step 1: Backup Current State

```bash
# Backup existing terraform directory
cp -r kilometers/terraform kilometers/terraform.backup

# Backup any existing state files
cd kilometers/terraform
terraform state pull > terraform.state.backup.json
```

### Step 2: Run Migration Script

```bash
# Make the migration script executable
chmod +x scripts/migrate-terraform.sh

# Run the migration
./scripts/migrate-terraform.sh
```

### Step 3: Setup Terraform Backend

```bash
# Create Azure storage for Terraform state
./scripts/setup-terraform-backend.sh
```

### Step 4: Configure Variables

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars

# Edit terraform.tfvars with your values:
# - Azure subscription details
# - Database credentials
# - GitHub token (with repo and admin:org permissions)
# - Allowed IP addresses
```

### Step 5: Initialize and Deploy

```bash
# Initialize Terraform
terraform init

# Review the plan
terraform plan

# Apply the infrastructure
terraform apply
```

### Step 6: Configure GitHub Secrets

The Terraform configuration automatically creates these GitHub secrets:
- `AZURE_CREDENTIALS`
- `ARM_CLIENT_ID`, `ARM_CLIENT_SECRET`, `ARM_SUBSCRIPTION_ID`, `ARM_TENANT_ID`
- `API_URL`
- `API_APP_SERVICE_NAME`
- `DATABASE_CONNECTION_STRING`
- `CLI_STORAGE_ACCOUNT`
- `KILOMETERS_API_KEY`

### Step 7: Update Workflows

The workflows are already configured in `.github/workflows/`:
- `deploy-api.yml` - API deployment
- `release-cli.yml` - CLI releases
- `deploy-infrastructure.yml` - Infrastructure updates

## Key Features

### 1. Automated Secret Management

The GitHub provider automatically syncs infrastructure outputs to GitHub secrets:

```hcl
resource "github_actions_secret" "api_url" {
  repository      = data.github_repository.main.name
  secret_name     = "API_URL"
  plaintext_value = "https://${azurerm_linux_web_app.api.default_hostname}"
}
```

### 2. Environment Isolation

Different configurations for dev/staging/prod:

```hcl
locals {
  environment_config = {
    dev = {
      api_sku = "B1"
      db_sku  = "B_Standard_B1ms"
    }
    prod = {
      api_sku = "P1v2"
      db_sku  = "B_Standard_B4ms"
    }
  }
}
```

### 3. CLI Distribution

Dedicated module for CLI binary distribution:
- Azure Storage with static website hosting
- Azure CDN for global distribution
- Automated binary uploads via GitHub Actions

### 4. Network Security

- Private endpoints for production resources
- VNet integration for App Service
- Firewall rules for PostgreSQL
- Key Vault access policies

## Deployment Workflows

### API Deployment

```yaml
# Triggers on api/ changes
on:
  push:
    paths:
      - 'api/**'
```

1. Runs tests
2. Builds .NET application
3. Deploys to App Service
4. Runs EF migrations
5. Performs health checks

### CLI Release

```yaml
# Triggers on cli/ changes or version tags
on:
  push:
    paths:
      - 'cli/**'
    tags:
      - 'cli-v*'
```

1. Builds for multiple platforms
2. Creates GitHub release
3. Uploads to Azure Storage
4. Updates CDN
5. Tests installation

### Infrastructure Updates

```yaml
# Triggers on terraform/ changes
on:
  push:
    paths:
      - 'terraform/**'
```

1. Validates Terraform syntax
2. Plans changes
3. Comments on PR with plan
4. Applies changes (main branch only)
5. Updates GitHub secrets

## Best Practices

### 1. Version Management

- **API**: Uses `api_version` variable in Terraform
- **CLI**: Version injected at build time with `-ldflags`
- **Infrastructure**: Terraform state versioning

### 2. Security

- All secrets stored in Azure Key Vault
- Managed identities for Azure resources
- GitHub OIDC for passwordless authentication (future)
- Network isolation with private endpoints

### 3. Cost Optimization

- Environment-specific SKUs
- Auto-scaling for production
- Scheduled scaling for dev/staging
- CDN caching for CLI binaries

### 4. Monitoring

- Application Insights for all components
- Structured logging
- Custom metrics for business KPIs
- Alerts for critical issues

## Troubleshooting

### Common Issues

1. **Terraform State Lock**
   ```bash
   terraform force-unlock <lock-id>
   ```

2. **GitHub Token Permissions**
   - Ensure token has `repo` scope
   - For organization repos, need `admin:org` scope

3. **Azure Permissions**
   - Service principal needs Contributor role
   - Key Vault access policies must be configured

4. **Module Not Found**
   ```bash
   terraform get -update
   ```

### Rollback Procedures

1. **Infrastructure Rollback**
   ```bash
   # Restore previous state
   terraform state push terraform.state.backup.json
   ```

2. **API Rollback**
   - Use App Service deployment slots
   - Or redeploy previous Docker image

3. **CLI Rollback**
   - Binaries are versioned in storage
   - Update "latest" pointer to previous version

## Future Enhancements

1. **Multi-Region Deployment**
   - Traffic Manager for global load balancing
   - Regional database replicas
   - Multi-region CDN origins

2. **Advanced Monitoring**
   - Distributed tracing
   - Custom dashboards
   - SLO/SLA monitoring

3. **Security Hardening**
   - Azure Firewall
   - DDoS Protection
   - WAF for API endpoints

4. **Developer Experience**
   - Local development containers
   - Feature flag system
   - Blue-green deployments

## Conclusion

This migration provides:
- ✅ Isolated CI/CD workflows for each component
- ✅ Automated infrastructure management
- ✅ Integrated secret management
- ✅ Production-ready security
- ✅ Global CLI distribution
- ✅ Comprehensive monitoring

The monorepo structure with isolated workflows ensures that changes to one component don't trigger unnecessary deployments of others, while still maintaining the benefits of a unified codebase.