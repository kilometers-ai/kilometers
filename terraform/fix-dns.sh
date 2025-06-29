#!/bin/bash
set -e

echo "🔧 Fixing DNS CNAME for get.kilometers.ai to point to CDN endpoint..."

# Ensure we're in the terraform directory
cd /Users/milesangelo/Source/active/kilometers/terraform

# Check the planned changes
echo "📋 Reviewing planned changes..."
terraform plan -var-file=config/dev.tfvars

echo ""
echo "⚠️  This will update the DNS CNAME record for get.kilometers.ai"
echo "   Current: Points to blob storage (causing SSL errors)"
echo "   New: Points to CDN endpoint (with proper SSL certificate)"
echo ""

read -p "🚀 Apply changes? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "✅ Applying terraform changes..."
    terraform apply -var-file=config/dev.tfvars -auto-approve
    
    echo ""
    echo "🎉 DNS fix applied successfully!"
    echo ""
    echo "⏱️  DNS propagation may take 5-15 minutes"
    echo "🧪 Test the fix in ~10 minutes with:"
    echo "   curl -I https://get.kilometers.ai/install/install.sh"
    echo ""
else
    echo "❌ Changes not applied"
fi
