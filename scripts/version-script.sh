#!/bin/bash
# Update version manifest in Azure Storage
# This script runs as part of the CI/CD pipeline

set -e

VERSION="$1"
STORAGE_ACCOUNT="$2"

if [ -z "$VERSION" ] || [ -z "$STORAGE_ACCOUNT" ]; then
    echo "Usage: $0 <version> <storage-account>"
    exit 1
fi

# Create version manifest
cat > version.json <<EOF
{
  "latest": "${VERSION}",
  "stable": "${VERSION}",
  "updated": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "downloads": {
    "linux-amd64": "https://get.kilometers.ai/releases/${VERSION}/km-linux-amd64",
    "linux-arm64": "https://get.kilometers.ai/releases/${VERSION}/km-linux-arm64",
    "darwin-amd64": "https://get.kilometers.ai/releases/${VERSION}/km-darwin-amd64",
    "darwin-arm64": "https://get.kilometers.ai/releases/${VERSION}/km-darwin-arm64",
    "windows-amd64": "https://get.kilometers.ai/releases/${VERSION}/km-windows-amd64.exe"
  },
  "checksums": {
    "linux-amd64": "https://get.kilometers.ai/releases/${VERSION}/km-linux-amd64.sha256",
    "linux-arm64": "https://get.kilometers.ai/releases/${VERSION}/km-linux-arm64.sha256",
    "darwin-amd64": "https://get.kilometers.ai/releases/${VERSION}/km-darwin-amd64.sha256",
    "darwin-arm64": "https://get.kilometers.ai/releases/${VERSION}/km-darwin-arm64.sha256",
    "windows-amd64": "https://get.kilometers.ai/releases/${VERSION}/km-windows-amd64.exe.sha256"
  }
}
EOF

# Upload version manifest
az storage blob upload \
  --account-name "${STORAGE_ACCOUNT}" \
  --container-name "install" \
  --name "version.json" \
  --file "version.json" \
  --content-type "application/json" \
  --overwrite

# Create a simple version text file
echo "${VERSION}" > version.txt

az storage blob upload \
  --account-name "${STORAGE_ACCOUNT}" \
  --container-name "install" \
  --name "version" \
  --file "version.txt" \
  --content-type "text/plain" \
  --overwrite

echo "Version manifest updated to ${VERSION}"