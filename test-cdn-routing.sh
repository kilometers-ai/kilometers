#!/bin/bash
set -e

echo "🧪 Testing blob storage access and CDN routing..."

STORAGE_ACCOUNT="stkmclib57e3ec7"
CDN_ENDPOINT="cdne-kilometers-get-dev.azureedge.net"

echo "1️⃣ Testing direct blob storage access..."
echo "📄 Install script:"
curl -I "https://$STORAGE_ACCOUNT.blob.core.windows.net/install/install.sh"

echo ""
echo "2️⃣ Testing CDN endpoint access..."
echo "📄 Via CDN:"
curl -I "https://$CDN_ENDPOINT/install/install.sh"

echo ""
echo "3️⃣ Testing custom domain (get.kilometers.ai)..."
echo "📄 Via custom domain:"
curl -I "http://get.kilometers.ai/install/install.sh"

echo ""
echo "4️⃣ If direct blob works but CDN doesn't, purging CDN cache..."
az cdn endpoint purge \
    --profile-name cdnp-kilometers-cli-dev \
    --name cdne-kilometers-get-dev \
    --resource-group rg-kilometers-dev \
    --content-paths "/install/install.sh" \
    --no-wait

echo "✅ CDN cache purge initiated"
echo "⏱️  Cache purge takes 2-10 minutes"
echo "🔄 Retry testing in 5 minutes"
