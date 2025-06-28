#!/bin/bash
set -e

echo "🔍 Monitoring DNS propagation for get.kilometers.ai..."
echo "🎯 Target: CDN endpoint (cdne-kilometers-get-dev.azureedge.net)"
echo ""

# Function to check DNS propagation
check_dns() {
    echo "⏱️  $(date): Checking DNS propagation..."
    
    # Check if nslookup is available, fallback to dig
    if command -v nslookup &> /dev/null; then
        result=$(nslookup get.kilometers.ai 2>/dev/null | grep -A1 "Non-authoritative answer:" | tail -1 || echo "not found")
        echo "   DNS Result: $result"
        
        if [[ $result == *"cdne-kilometers-get-dev.azureedge.net"* ]]; then
            return 0
        fi
    elif command -v dig &> /dev/null; then
        result=$(dig +short get.kilometers.ai 2>/dev/null || echo "not found")
        echo "   DNS Result: $result"
        
        if [[ $result == *"cdne-kilometers-get-dev.azureedge.net"* ]]; then
            return 0
        fi
    else
        echo "   ⚠️  Neither nslookup nor dig available, will retry terraform anyway"
        return 0
    fi
    
    return 1
}

# Check DNS propagation (up to 10 minutes)
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    if check_dns; then
        echo "✅ DNS propagation complete!"
        echo ""
        break
    fi
    
    echo "   ⏳ DNS not propagated yet (attempt $attempt/$max_attempts)"
    
    if [ $attempt -eq $max_attempts ]; then
        echo ""
        echo "⚠️  DNS propagation taking longer than expected"
        echo "   This is normal and terraform should still work"
        echo ""
        break
    fi
    
    sleep 20
    ((attempt++))
done

echo "🚀 Retrying terraform apply..."
cd ~/Source/active/kilometers.ai/kilometers/terraform

# Retry terraform apply to create the custom domain
terraform apply -var-file=config/dev.tfvars -auto-approve

echo ""
echo "🎉 CDN custom domain configuration complete!"
echo ""
echo "🧪 Test the branded install command:"
echo "   curl -I https://get.kilometers.ai/install/install.sh"
echo "   curl -sSL https://get.kilometers.ai/install/install.sh | sh"
