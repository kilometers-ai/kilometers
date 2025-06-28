#!/bin/bash
set -e

echo "🚀 Uploading Kilometers CLI files to Azure Blob Storage..."

# Get configuration from Terraform outputs and tfvars
echo "📋 Getting configuration from Terraform state..."

cd terraform

# Check if terraform state exists
if ! terraform show -json &>/dev/null; then
    echo "❌ Error: No Terraform state found. Please run 'terraform apply' first."
    exit 1
fi

# Get outputs from Terraform
STORAGE_ACCOUNT=$(terraform output -raw cli_storage_account)
RESOURCE_GROUP=$(terraform output -raw resource_group_name)

# Get configuration from tfvars
SUBSCRIPTION_ID=$(grep 'subscription_id' config/dev.tfvars | cut -d'"' -f2)
ARM_CLIENT_ID=$(grep 'arm_client_id' config/dev.tfvars | cut -d'"' -f2)
ARM_TENANT_ID=$(az account show --query 'tenantId' -o tsv)

echo "   Storage Account: $STORAGE_ACCOUNT"
echo "   Resource Group: $RESOURCE_GROUP"
echo "   Subscription: $SUBSCRIPTION_ID"
echo "   GitHub Actions SP: $ARM_CLIENT_ID"

cd ..

# Ensure we're in the right directory (repository root)
if [ ! -f "scripts/install.sh" ] || [ ! -d "cli" ]; then
    echo "❌ Error: Please run this script from the repository root directory"
    echo "   The script expects to find 'scripts/install.sh' and 'cli/' directory"
    exit 1
fi

echo "📂 Current directory: $(pwd)"

# Setup authentication method
echo "🔐 Setting up authentication..."

# Check if GitHub Actions service principal credentials are available
if [ -n "$ARM_CLIENT_SECRET" ]; then
    echo "   Using GitHub Actions service principal authentication"
    echo "   Note: The SP already has Storage Blob Data Contributor role via Terraform"
    AUTH_MODE="login"
else
    echo "   Using user account authentication"
    echo "   Note: If this fails, set ARM_CLIENT_SECRET environment variable"
    
    # Check if current user has required permissions
    CURRENT_USER=$(az account show --query 'user.name' -o tsv)
    STORAGE_SCOPE="/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.Storage/storageAccounts/$STORAGE_ACCOUNT"
    
    if ! az role assignment list --assignee "$CURRENT_USER" --scope "$STORAGE_SCOPE" --query "[?roleDefinitionName=='Storage Blob Data Contributor']" -o tsv | grep -q .; then
        echo "📝 Granting Storage Blob Data Contributor role to $CURRENT_USER..."
        az role assignment create \
            --role "Storage Blob Data Contributor" \
            --assignee "$CURRENT_USER" \
            --scope "$STORAGE_SCOPE"
        echo "✅ Permission granted successfully"
    else
        echo "✅ User already has Storage Blob Data Contributor role"
    fi
    
    AUTH_MODE="login"
fi

# 1. Upload install script
echo "📄 Uploading install script..."
az storage blob upload \
    --file scripts/install.sh \
    --container-name install \
    --name install.sh \
    --account-name "$STORAGE_ACCOUNT" \
    --overwrite \
    --auth-mode "$AUTH_MODE"

echo "✅ Install script uploaded successfully"

# 2. Check if CLI binaries exist, build if needed
if [ ! -d "cli/releases" ] || [ -z "$(ls -A cli/releases 2>/dev/null)" ]; then
    echo "🔨 Building CLI binaries..."
    cd cli
    chmod +x build-releases.sh
    ./build-releases.sh
    cd ..
else
    echo "📦 CLI binaries already exist"
fi

# 3. Upload CLI binaries
echo "📦 Uploading CLI binaries..."
az storage blob upload-batch \
    --source cli/releases \
    --destination releases/latest \
    --account-name "$STORAGE_ACCOUNT" \
    --overwrite \
    --auth-mode "$AUTH_MODE"

echo "✅ CLI binaries uploaded successfully"

# 4. Test the endpoints
echo ""
echo "🧪 Testing uploaded files..."

echo "📄 Testing install script:"
curl -I "https://$STORAGE_ACCOUNT.blob.core.windows.net/install/install.sh"

echo ""
echo "📦 Testing a binary (Linux AMD64):"
curl -I "https://$STORAGE_ACCOUNT.blob.core.windows.net/releases/latest/km-linux-amd64"

echo ""
echo "🎉 Upload complete!"
echo ""

# Get CDN endpoint from Terraform if available
cd terraform
if CDN_ENDPOINT=$(terraform output -raw cli_cdn_endpoint 2>/dev/null); then
    echo "🌐 CDN Endpoint available: $CDN_ENDPOINT"
    echo "🧪 Test the branded install command:"
    echo "   curl -sSL https://$CDN_ENDPOINT/install/install.sh | sh"
else
    echo "🧪 Test the direct install command:"
    echo "   curl -sSL https://$STORAGE_ACCOUNT.blob.core.windows.net/install/install.sh | sh"
fi
cd ..

echo ""
echo "💡 To use GitHub Actions service principal authentication:"
echo "   export ARM_CLIENT_ID=\"$ARM_CLIENT_ID\""
echo "   export ARM_CLIENT_SECRET=\"<secret-from-terraform-or-github>\""
echo "   export ARM_TENANT_ID=\"$ARM_TENANT_ID\""
echo "   export ARM_SUBSCRIPTION_ID=\"$SUBSCRIPTION_ID\""
echo "   az login --service-principal -u \$ARM_CLIENT_ID -p \$ARM_CLIENT_SECRET --tenant \$ARM_TENANT_ID"
