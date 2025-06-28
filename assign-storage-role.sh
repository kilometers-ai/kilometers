#!/bin/bash
set -e

echo "🔐 Setting up storage permissions for CLI upload..."

# Get current user info
CURRENT_USER=$(az account show --query user.name -o tsv)
CURRENT_USER_ID=$(az ad signed-in-user show --query id -o tsv)
STORAGE_ACCOUNT="stkmclib57e3ec7"
RESOURCE_GROUP="rg-kilometers-dev"

echo "👤 Current user: $CURRENT_USER"
echo "🆔 User ID: $CURRENT_USER_ID"

# Get storage account resource ID
STORAGE_ACCOUNT_ID=$(az storage account show \
    --name "$STORAGE_ACCOUNT" \
    --resource-group "$RESOURCE_GROUP" \
    --query id -o tsv)

echo "💾 Storage Account ID: $STORAGE_ACCOUNT_ID"

# Assign Storage Blob Data Contributor role
echo "🔑 Assigning Storage Blob Data Contributor role..."
az role assignment create \
    --role "Storage Blob Data Contributor" \
    --assignee "$CURRENT_USER_ID" \
    --scope "$STORAGE_ACCOUNT_ID"

echo "✅ Role assignment complete!"
echo ""
echo "⏱️  Role propagation may take 1-2 minutes"
echo "🚀 Then retry the upload command"
