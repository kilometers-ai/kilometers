#!/bin/bash
set -e

echo "🚀 Setting up HYBRID CLI distribution (Branded domain + GitHub Releases reliability)"
echo ""
echo "📋 Architecture:"
echo "   • Install script: BOTH get.kilometers.ai AND GitHub"
echo "   • Binary hosting: GitHub Releases (reliable)"
echo "   • Marketing: Branded get.kilometers.ai domain works"
echo "   • Fallback: GitHub raw URL also works"
echo ""

cd /Users/milesangelo/Source/active/kilometers.ai/kilometers

# 1. Set up GitHub Releases (reliable binary hosting)
echo "1️⃣ Setting up GitHub Releases workflow..."
./setup-github-releases.sh

# 2. Update install script to prioritize GitHub Releases for binaries
echo "2️⃣ Updating install script for hybrid distribution..."

cd scripts
cat > install.sh << 'EOF'
#!/bin/sh
# Kilometers.ai CLI Installer
# 
# Primary method (branded):
#   curl -sSL https://get.kilometers.ai/install.sh | sh
# 
# Backup method (direct GitHub):  
#   curl -sSL https://raw.githubusercontent.com/kilometers-ai/kilometers/main/scripts/install.sh | sh
#
# Both methods download binaries from GitHub Releases for maximum reliability

set -e

# Configuration
BINARY_NAME="km"
GITHUB_REPO="kilometers-ai/kilometers"
INSTALL_DIR="/usr/local/bin"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

success() {
    printf "${BLUE}[SUCCESS]${NC} %s\n" "$1"
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
        info "Installing to $INSTALL_DIR (no sudo required)"
    else
        if command -v sudo >/dev/null 2>&1; then
            info "Installing to $INSTALL_DIR (requires sudo)"
            SUDO="sudo"
        else
            error "Cannot write to $INSTALL_DIR and sudo is not available"
        fi
    fi
}

# Download the binary from GitHub Releases (most reliable)
download_binary() {
    BINARY_FILE="km-${PLATFORM}"
    if [ "$OS" = "windows" ]; then
        BINARY_FILE="${BINARY_FILE}.exe"
    fi
    
    TEMP_FILE="/tmp/km-download-$$"
    
    # Always use GitHub Releases for maximum reliability
    GITHUB_URL="https://github.com/${GITHUB_REPO}/releases/latest/download/${BINARY_FILE}"
    
    info "Downloading Kilometers CLI from GitHub Releases..."
    info "Source: ${GITHUB_URL}"
    
    if command -v curl >/dev/null 2>&1; then
        if curl -L --fail -o "$TEMP_FILE" "$GITHUB_URL" 2>/dev/null; then
            success "Download completed successfully"
        else
            error "Download failed from GitHub Releases"
        fi
    elif command -v wget >/dev/null 2>&1; then
        if wget -O "$TEMP_FILE" "$GITHUB_URL" 2>/dev/null; then
            success "Download completed successfully"  
        else
            error "Download failed from GitHub Releases"
        fi
    else
        error "Neither curl nor wget found. Please install one of them."
    fi
    
    # Verify download
    if [ ! -f "$TEMP_FILE" ] || [ ! -s "$TEMP_FILE" ]; then
        error "Downloaded file is missing or empty"
    fi
}

# Install the binary
install_binary() {
    info "Installing Kilometers CLI..."
    
    chmod +x "$TEMP_FILE"
    $SUDO mv "$TEMP_FILE" "$INSTALL_DIR/$BINARY_NAME"
    
    if command -v "$BINARY_NAME" >/dev/null 2>&1; then
        success "Installation completed successfully!"
    else
        warn "Binary installed but not found in PATH"
        warn "You may need to add $INSTALL_DIR to your PATH"
    fi
}

# Post-installation setup and info
post_install() {
    echo ""
    success "🎉 Kilometers CLI installed successfully!"
    echo ""
    
    # Show version if available
    if command -v "$BINARY_NAME" >/dev/null 2>&1; then
        VERSION=$("$BINARY_NAME" --version 2>/dev/null || echo "unknown")
        info "Installed version: $VERSION"
        echo ""
    fi
    
    # Show quick start guide
    printf "${BLUE}Quick Start:${NC}\n"
    echo "  1. Set your API key:"
    echo "     export KILOMETERS_API_KEY=\"your-api-key-here\""
    echo ""
    echo "  2. Wrap your MCP server:"
    echo "     km npx @modelcontextprotocol/server-github"
    echo ""
    echo "  3. View debug logs:"
    echo "     export KM_DEBUG=true"
    echo ""
    
    printf "${BLUE}Resources:${NC}\n"
    echo "  • Dashboard: https://app.kilometers.ai"
    echo "  • Documentation: https://docs.kilometers.ai"
    echo "  • Support: support@kilometers.ai"
    echo ""
    
    printf "${GREEN}✓ Ready to monitor your AI tools!${NC}\n"
}

# Main installation flow
main() {
    echo ""
    printf "${BLUE}Kilometers.ai CLI Installer${NC}\n"
    echo "==============================="
    echo ""
    
    case "${1:-}" in
        --help)
            echo "Usage: $0 [--help]"
            echo ""
            echo "Install via branded domain:"
            echo "  curl -sSL https://get.kilometers.ai/install.sh | sh"
            echo ""
            echo "Install via GitHub direct:"
            echo "  curl -sSL https://raw.githubusercontent.com/kilometers-ai/kilometers/main/scripts/install.sh | sh"
            echo ""
            echo "Both methods download from GitHub Releases for reliability."
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

# 3. Upload install script to Azure (for branded domain)
echo "3️⃣ Uploading install script to Azure blob storage..."
az storage blob upload \
    --file scripts/install.sh \
    --container-name install \
    --name install.sh \
    --account-name stkmclib57e3ec7 \
    --overwrite \
    --auth-mode login

echo ""
echo "🎉 HYBRID distribution setup complete!"
echo ""
echo "📊 Your CLI distribution now supports:"
echo "   ✅ Branded domain: curl -sSL https://get.kilometers.ai/install.sh | sh"
echo "   ✅ GitHub backup: curl -sSL https://raw.githubusercontent.com/...install.sh | sh"  
echo "   ✅ Reliable binaries: Downloaded from GitHub Releases"
echo "   ✅ Global CDN: Azure CDN serves install script"
echo "   ✅ 30-second installs: Industry-standard reliability"
echo ""
echo "🚀 Next steps:"
echo "   1. Commit and push changes"
echo "   2. Create release: git tag v0.1.0 && git push origin v0.1.0"
echo "   3. Wait 2-3 minutes for GitHub Actions to build binaries"
echo "   4. Test: curl -sSL https://get.kilometers.ai/install.sh | sh"
echo ""
echo "🔧 CDN issues? The GitHub method works immediately:"
echo "   curl -sSL https://raw.githubusercontent.com/kilometers-ai/kilometers/main/scripts/install.sh | sh"
