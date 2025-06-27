# Kilometers Infrastructure as Code

This directory contains the Terraform configuration for deploying the Kilometers.ai infrastructure on Azure.

## Prerequisites

1. [Terraform](https://www.terraform.io/downloads) >= 1.0
2. [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
3. Azure subscription with appropriate permissions
4. GitHub personal access token with `repo` and `admin:org` permissions

## Quick Start

1. **Initialize Terraform backend storage** (one-time setup):
   ```bash
   ./scripts/setup-terraform-backend.sh
   ```

2. **Configure variables**:
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   # Edit terraform.tfvars with your values
   ```

3. **Initialize Terraform**:
   ```bash
   terraform init
   ```

4. **Plan the deployment**:
   ```bash
   terraform plan
   ```

5. **Apply the configuration**:
   ```bash
   terraform apply
   ```

## Directory Structure

```
terraform/
├── main.tf                 # Main configuration
├── variables.tf            # Input variables
├── outputs.tf              # Output values
├── backend.tf              # State backend configuration
├── modules/                # Reusable modules
│   ├── networking/         # VNet and subnets
│   ├── database/           # PostgreSQL
│   ├── key_vault/          # Azure Key Vault
│   ├── cli-distribution/   # CLI CDN setup
│   └── ...
└── environments/           # Environment-specific configs
    ├── dev/
    └── prod/
```

## Key Resources Created

- **Resource Group**: Container for all resources
- **Virtual Network**: Isolated network for resources
- **PostgreSQL Database**: Application database
- **App Service**: Hosts the .NET API
- **Key Vault**: Secure storage for secrets
- **Application Insights**: Monitoring and telemetry
- **Storage Account**: CLI binaries and logs
- **CDN**: Global distribution for CLI
- **GitHub Secrets**: Automated CI/CD configuration

## Environment Management

### Development
```bash
terraform workspace select dev
terraform apply -var="environment=dev"
```

### Production
```bash
terraform workspace select prod
terraform apply -var="environment=prod"
```

## Outputs

After successful deployment, Terraform will output:

- API URL
- Database connection details
- Storage account information
- Key Vault details
- GitHub Actions configuration

## Destroying Resources

To tear down all resources:
```bash
terraform destroy
```

## Troubleshooting

1. **State Lock Issues**:
   ```bash
   terraform force-unlock <lock-id>
   ```

2. **Provider Authentication**:
   ```bash
   az login
   az account set --subscription <subscription-id>
   ```

3. **GitHub Token Issues**:
   - Ensure token has `repo` and `admin:org` permissions
   - Token must be from an organization owner or admin

## Security Best Practices

1. Never commit `terraform.tfvars` or state files
2. Use Azure Key Vault for all secrets
3. Enable state file encryption
4. Regularly rotate credentials
5. Use managed identities where possible
