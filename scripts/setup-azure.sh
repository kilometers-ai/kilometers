#!/bin/bash

# Azure Setup Script for Kilometers.ai
# This script prepares Azure for Terraform deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
RESOURCE_GROUP="rg-terraform-state"
STORAGE_ACCOUNT="tfkm$(openssl rand -hex 3)"
CONTAINER_NAME="tfstate"
LOCATION="East US"

log_info "Starting Azure setup for Kilometers.ai..."

# Check if logged into Azure
if ! az account show &> /dev/null; then
    log_warning "Not logged into Azure. Please log in..."
    az login
fi

# Show current subscription
SUBSCRIPTION=$(az account show --query name -o tsv)
SUBSCRIPTION_ID=$(az account show --query id -o tsv)
log_info "Using Azure subscription: $SUBSCRIPTION ($SUBSCRIPTION_ID)"

# Confirm subscription
read -p "Continue with this subscription? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_info "Please switch to the correct subscription using: az account set --subscription <subscription-id>"
    exit 1
fi

# Create resource group for Terraform state
log_info "Creating resource group for Terraform state..."
az group create \
    --name "$RESOURCE_GROUP" \
    --location "$LOCATION" \
    --tags Environment=shared Project=Kilometers Purpose=terraform-state

# Create storage account for Terraform state
log_info "Creating storage account: $STORAGE_ACCOUNT"
az storage account create \
    --resource-group "$RESOURCE_GROUP" \
    --name "$STORAGE_ACCOUNT" \
    --sku Standard_LRS \
    --encryption-services blob \
    --tags Environment=shared Project=Kilometers Purpose=terraform-state

# Create blob container for Terraform state
log_info "Creating blob container for Terraform state..."
az storage container create \
    --name "$CONTAINER_NAME" \
    --account-name "$STORAGE_ACCOUNT" \
    --auth-mode login

# Update backend configuration
log_info "Updating Terraform backend configuration..."
cat > ../terraform/backend.tf << EOF
# Backend configuration for Terraform state
# This stores the state in Azure Storage for team collaboration and security

terraform {
  backend "azurerm" {
    resource_group_name  = "$RESOURCE_GROUP"
    storage_account_name = "$STORAGE_ACCOUNT"
    container_name       = "$CONTAINER_NAME"
    key                  = "kilometers.tfstate"
  }
}
EOF

# Create GitHub Actions secrets template
log_info "Creating GitHub Actions secrets template..."
cat > ../github-secrets.txt << EOF
# GitHub Secrets Configuration for CI/CD
# Add these secrets to your GitHub repository:

AZURE_CREDENTIALS:
$(az ad sp create-for-rbac --name "kilometers-github-actions" --role contributor --scopes /subscriptions/$SUBSCRIPTION_ID --sdk-auth)

DB_PASSWORD:
$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)!Km#

# Backend configuration for Terraform init:
TF_BACKEND_RESOURCE_GROUP: $RESOURCE_GROUP
TF_BACKEND_STORAGE_ACCOUNT: $STORAGE_ACCOUNT
TF_BACKEND_CONTAINER: $CONTAINER_NAME
EOF

log_success "Azure setup completed successfully!"
log_info ""
log_info "Next steps:"
log_info "1. Add the secrets from 'github-secrets.txt' to your GitHub repository"
log_info "2. Update terraform/terraform.tfvars with your desired values"
log_info "3. Run: ./deploy.sh to deploy the infrastructure"
log_info ""
log_info "Storage account created: $STORAGE_ACCOUNT"
log_info "Resource group: $RESOURCE_GROUP" 