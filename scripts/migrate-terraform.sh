#!/bin/bash
# Script to migrate terraform configuration from platforms project to kilometers

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Source and destination paths
SOURCE_DIR="/projects/platforms/terraform-dotnet-iac"
DEST_DIR="/projects/kilometers/terraform"

echo -e "${GREEN}Starting Terraform migration from platforms to kilometers...${NC}"

# 1. Backup existing terraform directory
if [ -d "$DEST_DIR" ]; then
    echo -e "${YELLOW}Backing up existing terraform directory...${NC}"
    mv "$DEST_DIR" "${DEST_DIR}.backup.$(date +%Y%m%d_%H%M%S)"
fi

# 2. Create new terraform directory structure
echo -e "${GREEN}Creating new terraform directory structure...${NC}"
mkdir -p "$DEST_DIR/modules"
mkdir -p "$DEST_DIR/environments/dev"
mkdir -p "$DEST_DIR/environments/prod"

# 3. Copy modules from platforms project
echo -e "${GREEN}Copying terraform modules...${NC}"
modules_to_copy=(
    "networking"
    "database"
    "key_vault"
    "container_registry"
    "service_principal"
)

for module in "${modules_to_copy[@]}"; do
    if [ -d "$SOURCE_DIR/modules/$module" ]; then
        echo "  - Copying module: $module"
        cp -r "$SOURCE_DIR/modules/$module" "$DEST_DIR/modules/"
    else
        echo -e "${YELLOW}  - Warning: Module $module not found${NC}"
    fi
done

# 4. Create backend configuration
echo -e "${GREEN}Creating backend configuration...${NC}"
cat > "$DEST_DIR/backend.tf" << 'EOF'
terraform {
  backend "azurerm" {
    resource_group_name  = "rg-kilometers-terraform"
    storage_account_name = "stkilometerstfstate"
    container_name       = "tfstate"
    key                  = "kilometers.tfstate"
  }
}
EOF

# 5. Create terraform.tfvars.example
echo -e "${GREEN}Creating terraform.tfvars.example...${NC}"
cat > "$DEST_DIR/terraform.tfvars.example" << 'EOF'
# Azure Configuration
environment = "dev"
location    = "East US"

# Database Configuration
db_admin_username = "pgadmin"
db_admin_password = "YourSecurePassword123!"  # Change this!

# Network Security
allowed_ip_ranges = ["YOUR_IP_ADDRESS/32"]  # Add your IP for Key Vault access

# GitHub Integration
github_organization = "your-github-org"
github_repository   = "kilometers"
github_token        = "ghp_your_github_token"  # Requires repo and admin:org permissions

# API Configuration
api_version = "1.0.0"
EOF

# 6. Create .gitignore for terraform
echo -e "${GREEN}Creating .gitignore for terraform...${NC}"
cat > "$DEST_DIR/.gitignore" << 'EOF'
# Terraform files
*.tfstate
*.tfstate.*
*.tfvars
!terraform.tfvars.example
.terraform/
.terraform.lock.hcl
*.tfplan
tfplan
crash.log
override.tf
override.tf.json
*_override.tf
*_override.tf.json

# Editor files
.idea/
.vscode/
*.swp
*.swo
*~

# OS files
.DS_Store
Thumbs.db
EOF

# 7. Create README for terraform
echo -e "${GREEN}Creating README for terraform...${NC}"
cat > "$DEST_DIR/README.md" << 'EOF'
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
EOF

# 8. Create setup script for terraform backend
echo -e "${GREEN}Creating terraform backend setup script...${NC}"
mkdir -p "$DEST_DIR/../scripts"
cat > "$DEST_DIR/../scripts/setup-terraform-backend.sh" << 'EOF'
#!/bin/bash
# Setup Azure Storage for Terraform state

set -e

RESOURCE_GROUP="rg-kilometers-terraform"
STORAGE_ACCOUNT="stkilometerstfstate"
CONTAINER_NAME="tfstate"
LOCATION="eastus"

echo "Creating Terraform backend storage..."

# Create resource group
az group create \
  --name $RESOURCE_GROUP \
  --location $LOCATION

# Create storage account
az storage account create \
  --name $STORAGE_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --sku Standard_LRS \
  --encryption-services blob

# Create blob container
az storage container create \
  --name $CONTAINER_NAME \
  --account-name $STORAGE_ACCOUNT \
  --auth-mode login

# Enable versioning
az storage account blob-service-properties update \
  --account-name $STORAGE_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --enable-versioning true

echo "Terraform backend storage created successfully!"
echo ""
echo "Backend configuration:"
echo "  resource_group_name  = \"$RESOURCE_GROUP\""
echo "  storage_account_name = \"$STORAGE_ACCOUNT\""
echo "  container_name       = \"$CONTAINER_NAME\""
echo "  key                  = \"kilometers.tfstate\""
EOF

chmod +x "$DEST_DIR/../scripts/setup-terraform-backend.sh"

# 9. Create environment-specific configurations
echo -e "${GREEN}Creating environment configurations...${NC}"

# Dev environment
cat > "$DEST_DIR/environments/dev/terraform.tfvars" << 'EOF'
environment = "dev"
location    = "East US"

# Add other dev-specific variables here
EOF

# Prod environment  
cat > "$DEST_DIR/environments/prod/terraform.tfvars" << 'EOF'
environment = "prod"
location    = "East US"

# Add other prod-specific variables here
EOF

# 10. Final message
echo -e "${GREEN}✅ Terraform migration completed!${NC}"
echo ""
echo "Next steps:"
echo "1. Review the migrated files in $DEST_DIR"
echo "2. Update terraform.tfvars with your configuration"
echo "3. Run './scripts/setup-terraform-backend.sh' to create backend storage"
echo "4. Run 'terraform init' to initialize"
echo "5. Run 'terraform plan' to review changes"
echo ""
echo -e "${YELLOW}Note: The old terraform directory has been backed up${NC}"