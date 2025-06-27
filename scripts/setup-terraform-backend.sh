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
