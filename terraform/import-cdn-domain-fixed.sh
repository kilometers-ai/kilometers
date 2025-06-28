#!/bin/bash
set -e

echo "🔧 Importing existing CDN custom domain with correct resource ID format..."



# Remove from terraform state
# echo "📤 Removing custom domain from terraform state..."
# terraform state rm module.cli_distribution.azurerm_cdn_endpoint_custom_domain.get_kilometers_ai

# Import with correct Azure CDN resource ID format
echo "📥 Importing existing custom domain..."
CDN_CUSTOM_DOMAIN_ID="/subscriptions/b902128f-2e17-43c6-8ba5-49bf19e3f82b/resourceGroups/rg-kilometers-dev/providers/Microsoft.Cdn/profiles/cdnp-kilometers-cli-dev/endpoints/cdne-kilometers-get-dev/customDomains/get-kilometers-ai"

terraform import -var-file=config/dev.tfvars module.cli_distribution.azurerm_cdn_endpoint_custom_domain.get_kilometers_ai "$CDN_CUSTOM_DOMAIN_ID"

echo "✅ Import complete!"
echo "🚀 Now applying configuration (HTTPS disabled temporarily)..."

# Apply configuration to sync state
terraform apply -var-file=config/dev.tfvars -auto-approve

echo ""
echo "🎉 CDN custom domain successfully imported and configured!"
echo ""
echo "🧪 Test the HTTP domain:"
echo "   curl -I http://get.kilometers.ai/install/install.sh"
echo "   curl -sSL http://get.kilometers.ai/install/install.sh | sh"
echo ""
echo "🕐 HTTPS can be re-enabled after 8-hour Azure cooldown period"
