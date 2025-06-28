#!/bin/sh
# Kilometers.ai CLI Installer
# Usage: curl -sSL https://get.kilometers.ai | sh

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
    
    # Windows ARM64 is not supported yet
    if [ "$OS" = "windows" ] && [ "$ARCH" = "arm64" ]; then
        error "Windows ARM64 is not supported yet"
    fi
    
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
    # Construct binary name
    BINARY_FILE="km-${PLATFORM}"
    if [ "$OS" = "windows" ]; then
        BINARY_FILE="${BINARY_FILE}.exe"
    fi
    
    # Try CDN first, fallback to GitHub releases
    DOWNLOAD_URL="${CDN_BASE}/releases/latest/${BINARY_FILE}"
    TEMP_FILE="/tmp/km-download-$$"
    
    info "Downloading Kilometers CLI..."
    info "URL: $DOWNLOAD_URL"
    
    if command -v curl >/dev/null 2>&1; then
        HTTP_CODE=$(curl -w '%{http_code}' -L -o "$TEMP_FILE" "$DOWNLOAD_URL" 2>/dev/null)
    elif command -v wget >/dev/null 2>&1; then
        HTTP_CODE=$(wget --server-response -O "$TEMP_FILE" "$DOWNLOAD_URL" 2>&1 | awk '/^  HTTP/{print $2}' | tail -1)
    else
        error "Neither curl nor wget found. Please install one of them."
    fi
    
    # If CDN fails, try GitHub releases
    if [ "$HTTP_CODE" != "200" ]; then
        warn "CDN download failed, trying GitHub releases..."
        GITHUB_URL="https://github.com/${GITHUB_REPO}/releases/latest/download/${BINARY_FILE}"
        
        if command -v curl >/dev/null 2>&1; then
            curl -L -o "$TEMP_FILE" "$GITHUB_URL" || error "Download failed"
        else
            wget -O "$TEMP_FILE" "$GITHUB_URL" || error "Download failed"
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
    
    # Make executable
    chmod +x "$TEMP_FILE"
    
    # Move to install directory
    $SUDO mv "$TEMP_FILE" "$INSTALL_DIR/$BINARY_NAME"
    
    # Verify installation
    if command -v "$BINARY_NAME" >/dev/null 2>&1; then
        info "Installation successful!"
    else
        warn "Binary installed but not found in PATH"
        warn "You may need to add $INSTALL_DIR to your PATH"
    fi
}

# Post-installation setup
post_install() {
    # Show version
    if command -v "$BINARY_NAME" >/dev/null 2>&1; then
        VERSION=$("$BINARY_NAME" --version 2>/dev/null || echo "unknown")
        info "Installed version: $VERSION"
    fi
    
    # Configuration hints
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

# Uninstall function (for future use)
uninstall() {
    info "Uninstalling Kilometers CLI..."
    
    if [ -f "$INSTALL_DIR/$BINARY_NAME" ]; then
        $SUDO rm -f "$INSTALL_DIR/$BINARY_NAME"
        info "Kilometers CLI uninstalled"
    else
        warn "Kilometers CLI not found at $INSTALL_DIR/$BINARY_NAME"
    fi
}

# Main installation flow
main() {
    info "Installing Kilometers CLI..."
    
    # Parse arguments
    case "${1:-}" in
        --uninstall)
            uninstall
            exit 0
            ;;
        --help)
            echo "Usage: $0 [--uninstall] [--help]"
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