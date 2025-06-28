#!/bin/bash
set -e

echo "🚀 Setting up GitHub Releases as primary CLI distribution..."

# Check if we're in the right repo directory
if [ ! -d ".git" ]; then
    echo "❌ Must be run from git repository root"
    exit 1
fi

# Create GitHub Actions workflow for automated releases
mkdir -p .github/workflows

cat > .github/workflows/release-cli.yml << 'EOF'
name: Release CLI

on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:
    inputs:
      version:
        description: 'Version to release (e.g., v0.1.0)'
        required: true
        default: 'v0.1.0'

jobs:
  build-and-release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Go
      uses: actions/setup-go@v4
      with:
        go-version: '1.21'
    
    - name: Set version
      run: |
        if [ "${{ github.event_name }}" = "workflow_dispatch" ]; then
          echo "VERSION=${{ github.event.inputs.version }}" >> $GITHUB_ENV
        else
          echo "VERSION=${GITHUB_REF#refs/tags/}" >> $GITHUB_ENV
        fi
    
    - name: Build CLI binaries
      run: |
        cd cli
        chmod +x build-releases.sh
        VERSION=${VERSION#v} ./build-releases.sh
    
    - name: Create Release
      uses: softprops/action-gh-release@v1
      with:
        tag_name: ${{ env.VERSION }}
        name: Release ${{ env.VERSION }}
        draft: false
        prerelease: false
        files: cli/releases/*
        generate_release_notes: true
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
EOF

echo "✅ GitHub Actions workflow created"

# Update build script to accept version parameter
cd cli
cp build-releases.sh build-releases.sh.backup

cat > build-releases.sh << 'EOF'
#!/bin/bash
set -e

# Build script for Kilometers CLI releases
VERSION="${VERSION:-0.1.0}"
BINARY_NAME="km"

echo "Building Kilometers CLI v$VERSION for multiple platforms..."

# Create releases directory
mkdir -p releases

# Build for different platforms
PLATFORMS=(
    "linux/amd64"
    "linux/arm64" 
    "darwin/amd64"
    "darwin/arm64"
    "windows/amd64"
)

for platform in "${PLATFORMS[@]}"; do
    IFS='/' read -r -a array <<< "$platform"
    GOOS="${array[0]}"
    GOARCH="${array[1]}"
    
    output_name="$BINARY_NAME-$GOOS-$GOARCH"
    if [ "$GOOS" = "windows" ]; then
        output_name+=".exe"
    fi
    
    echo "Building for $GOOS/$GOARCH..."
    env GOOS="$GOOS" GOARCH="$GOARCH" go build -ldflags="-X main.Version=$VERSION" -o "releases/$output_name" .
    
    echo "Built: releases/$output_name"
done

echo ""
echo "Build complete! Generated binaries:"
ls -la releases/

echo ""
echo "GitHub Releases will automatically distribute these files globally"
EOF

chmod +x build-releases.sh
cd ..

# Update install script to prioritize GitHub Releases
cd scripts
cp install.sh install.sh.backup

# Modify the install script to prioritize GitHub over CDN
sed -i.tmp 's/CDN_BASE="https:\/\/stkmclib57e3ec7.blob.core.windows.net"/CDN_BASE="https:\/\/stkmclib57e3ec7.blob.core.windows.net"/' install.sh
sed -i.tmp 's/# Try CDN first, fallback to GitHub releases/# Try GitHub releases first, fallback to CDN/' install.sh

# Swap the order in the script logic
cat > install.sh << 'EOF'
#!/bin/sh
# Kilometers.ai CLI Installer
# Usage: curl -sSL https://get.kilometers.ai/install.sh | sh
#   or:  curl -sSL https://raw.githubusercontent.com/kilometers-ai/kilometers/main/scripts/install.sh | sh

set -e

# Configuration
BINARY_NAME="km"
GITHUB_REPO="kilometers-ai/kilometers"
CDN_BASE="https://stkmclib57e3ec7.blob.core.windows.net"
INSTALL_DIR="/usr/local/bin"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
info() {
    printf "${GREEN}[INFO]${NC} %s\n" "$1"
}

warn() {
    printf "${YELLOW}[WARN]${NC} %s\n" "$1"
}

error() {
    printf "${RED}[ERROR]${NC} %s\n" "$1" >&2
    exit 1
}

# Detect OS and architecture
detect_platform() {
    OS=$(uname -s | tr '[:upper:]' '[:lower:]')
    ARCH=$(uname -m)
    
    case $OS in
        linux) OS="linux" ;;
        darwin) OS="darwin" ;;
        mingw*|msys*|cygwin*) OS="windows" ;;
        *) error "Unsupported operating system: $OS" ;;
    esac
    
    case $ARCH in
        x86_64|amd64) ARCH="amd64" ;;
        arm64|aarch64) ARCH="arm64" ;;
        *) error "Unsupported architecture: $ARCH" ;;
    esac
    
    PLATFORM="${OS}-${ARCH}"
    info "Detected platform: $PLATFORM"
}

# Check if we need sudo
check_permissions() {
    if [ -w "$INSTALL_DIR" ]; then
        SUDO=""
    else
        if command -v sudo >/dev/null 2>&1; then
            info "Installation requires sudo privileges"
            SUDO="sudo"
        else
            error "Cannot write to $INSTALL_DIR and sudo is not available"
        fi
    fi
}

# Download the binary
download_binary() {
    BINARY_FILE="km-${PLATFORM}"
    if [ "$OS" = "windows" ]; then
        BINARY_FILE="${BINARY_FILE}.exe"
    fi
    
    TEMP_FILE="/tmp/km-download-$$"
    
    # Try GitHub releases first (most reliable)
    GITHUB_URL="https://github.com/${GITHUB_REPO}/releases/latest/download/${BINARY_FILE}"
    
    info "Downloading Kilometers CLI from GitHub Releases..."
    info "URL: $GITHUB_URL"
    
    if command -v curl >/dev/null 2>&1; then
        HTTP_CODE=$(curl -w '%{http_code}' -L -o "$TEMP_FILE" "$GITHUB_URL" 2>/dev/null)
    elif command -v wget >/dev/null 2>&1; then
        HTTP_CODE=$(wget --server-response -O "$TEMP_FILE" "$GITHUB_URL" 2>&1 | awk '/^  HTTP/{print $2}' | tail -1)
    else
        error "Neither curl nor wget found. Please install one of them."
    fi
    
    # If GitHub fails, try CDN fallback
    if [ "$HTTP_CODE" != "200" ]; then
        warn "GitHub download failed, trying CDN fallback..."
        CDN_URL="${CDN_BASE}/releases/latest/${BINARY_FILE}"
        
        if command -v curl >/dev/null 2>&1; then
            curl -L -o "$TEMP_FILE" "$CDN_URL" || error "All download sources failed"
        else
            wget -O "$TEMP_FILE" "$CDN_URL" || error "All download sources failed"
        fi
    fi
    
    # Verify download
    if [ ! -f "$TEMP_FILE" ] || [ ! -s "$TEMP_FILE" ]; then
        error "Download failed or file is empty"
    fi
    
    info "Download complete"
}

# Install the binary
install_binary() {
    info "Installing to $INSTALL_DIR/$BINARY_NAME..."
    
    chmod +x "$TEMP_FILE"
    $SUDO mv "$TEMP_FILE" "$INSTALL_DIR/$BINARY_NAME"
    
    if command -v "$BINARY_NAME" >/dev/null 2>&1; then
        info "Installation successful!"
    else
        warn "Binary installed but not found in PATH"
        warn "You may need to add $INSTALL_DIR to your PATH"
    fi
}

# Post-installation setup
post_install() {
    if command -v "$BINARY_NAME" >/dev/null 2>&1; then
        VERSION=$("$BINARY_NAME" --version 2>/dev/null || echo "unknown")
        info "Installed version: $VERSION"
    fi
    
    cat << EOF

${GREEN}✓ Kilometers CLI installed successfully!${NC}

To get started:
  1. Set your API key:
     export KILOMETERS_API_KEY="your-api-key-here"
  
  2. Wrap your MCP server:
     km npx @modelcontextprotocol/server-github
  
  3. View debug logs:
     export KM_DEBUG=true

For more information:
  - Documentation: https://docs.kilometers.ai
  - Dashboard: https://app.kilometers.ai
  - Support: support@kilometers.ai

EOF
}

# Main installation flow
main() {
    info "Installing Kilometers CLI..."
    
    case "${1:-}" in
        --help)
            echo "Usage: $0 [--help]"
            echo ""
            echo "Install from GitHub Releases:"
            echo "  curl -sSL https://raw.githubusercontent.com/kilometers-ai/kilometers/main/scripts/install.sh | sh"
            echo ""
            echo "Install from CDN (if configured):"
            echo "  curl -sSL https://get.kilometers.ai/install.sh | sh"
            exit 0
            ;;
    esac
    
    detect_platform
    check_permissions
    download_binary
    install_binary
    post_install
}

# Run main function
main "$@"
EOF

chmod +x install.sh
cd ..

echo ""
echo "🎉 GitHub Releases setup complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Commit and push these changes"
echo "  2. Create a release tag: git tag v0.1.0 && git push origin v0.1.0"
echo "  3. GitHub Actions will automatically build and publish binaries"
echo ""
echo "🧪 Test the install command:"
echo "  curl -sSL https://raw.githubusercontent.com/kilometers-ai/kilometers/main/scripts/install.sh | sh"
echo ""
echo "🏷️ Or create a release manually from GitHub web UI"
