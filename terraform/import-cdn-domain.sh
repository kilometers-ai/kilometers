#!/bin/bash
set -e

echo "🔧 Importing existing CDN custom domain instead of recreating..."

cd /Users/milesangelo/Source/active/kilometers.ai/kilometers/terraform

# Remove the problematic resource from terraform state
echo "📤 Removing custom domain from terraform state..."
terraform state rm module.cli_distribution.azurerm_cdn_endpoint_custom_domain.get_kilometers_ai

# Import the existing Azure resource
echo "📥 Importing existing custom domain..."
CDN_ENDPOINT_ID="/subscriptions/b902128f-2e17-43c6-8ba5-49bf19e3f82b/resourceGroups/rg-kilometers-dev/providers/Microsoft.Network/CDN/Profiles/cdnp-kilometers-cli-dev/Endpoints/cdne-kilometers-get-dev/CustomDomains/get-kilometers-ai"

terraform import -var-file=config/dev.tfvars module.cli_distribution.azurerm_cdn_endpoint_custom_domain.get_kilometers_ai "$CDN_ENDPOINT_ID"

echo "✅ Import complete! The custom domain now exists without HTTPS"
echo "🕐 HTTPS can be enabled after 8-hour Azure cooldown period"
echo ""
echo "🧪 Test the domain (HTTP only for now):"
echo "   curl -I http://get.kilometers.ai/install/install.sh"
