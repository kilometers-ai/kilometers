#!/bin/bash
set -e

echo "🔧 Fixing CDN origin to use static website hosting endpoint..."

cd /Users/milesangelo/Source/active/kilometers.ai/kilometers/terraform/modules/cli-distribution

# Create backup
cp main.tf main.tf.backup

# Update CDN origin to use static website endpoint instead of blob endpoint
sed -i.tmp 's/host_name = azurerm_storage_account.cli_distribution.primary_blob_host/host_name = azurerm_storage_account.cli_distribution.primary_web_host/' main.tf

echo "✅ Updated CDN origin configuration"
echo ""
echo "📋 Change made:"
echo "   Before: primary_blob_host (container-based routing)"
echo "   After:  primary_web_host (static website routing)"
echo ""
echo "🚀 Apply the fix:"
echo "   cd /Users/milesangelo/Source/active/kilometers.ai/kilometers/terraform"
echo "   terraform plan -var-file=config/dev.tfvars"
echo "   terraform apply -var-file=config/dev.tfvars"
echo ""
echo "📄 Then upload install script to static website root:"
echo "   az storage blob upload --file scripts/install.sh --container-name '\$web' --name install.sh --account-name stkmclib57e3ec7 --auth-mode login"
