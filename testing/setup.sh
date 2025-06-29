#!/bin/bash

# Setup script for Kilometers CLI Testing
# This script prepares everything needed to run E2E tests

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[SETUP]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "=============================="
echo "  Kilometers CLI Test Setup"
echo "=============================="
echo

# Check if we're in the right directory
if [[ ! -d "/Users/milesangelo/Source/active/kilometers.ai/kilometers" ]]; then
    log_error "Please run this script from the kilometers project directory"
    exit 1
fi

cd /Users/milesangelo/Source/active/kilometers.ai/kilometers

# 1. Make test scripts executable
log_info "Making test scripts executable..."
chmod +x testing/test-e2e.sh
chmod +x testing/mock-mcp-server.js
log_success "Test scripts are now executable"

# 2. Check prerequisites
log_info "Checking prerequisites..."

# Check Go
if ! command -v go >/dev/null 2>&1; then
    log_error "Go is not installed. Please install Go 1.24.4 or later"
    exit 1
else
    log_success "Go is installed: $(go version)"
fi

# Check Node.js
if ! command -v node >/dev/null 2>&1; then
    log_error "Node.js is not installed. Please install Node.js to run the mock MCP server"
    exit 1
else
    log_success "Node.js is installed: $(node --version)"
fi

# Check .NET (optional for API tests)
if command -v dotnet >/dev/null 2>&1; then
    log_success ".NET is installed: $(dotnet --version)"
else
    log_warning ".NET not found - API integration tests will be skipped"
fi

# Check curl
if ! command -v curl >/dev/null 2>&1; then
    log_error "curl is required for API testing"
    exit 1
fi

# Check jq (optional but helpful)
if command -v jq >/dev/null 2>&1; then
    log_success "jq is available for JSON processing"
else
    log_warning "jq not found - some API tests may be limited"
fi

# 3. Build CLI if needed
log_info "Checking CLI binary..."
if [[ ! -f "cli/km" ]] || [[ "cli/main.go" -nt "cli/km" ]]; then
    log_info "Building CLI binary..."
    cd cli
    go build -o km .
    cd ..
    log_success "CLI binary built successfully"
else
    log_success "CLI binary is up to date"
fi

# 4. Verify CLI works
log_info "Verifying CLI functionality..."
if ./cli/km --version >/dev/null 2>&1; then
    log_success "CLI is working correctly"
else
    log_error "CLI binary is not working properly"
    exit 1
fi

# 5. Check API server status
log_info "Checking API server status..."
if curl -s http://localhost:5194/health >/dev/null 2>&1; then
    log_success "API server is running at http://localhost:5194"
    echo "  You can monitor events at: http://localhost:5194/api/activity"
else
    log_warning "API server is not running at http://localhost:5194"
    echo "  To start the API server:"
    echo "    cd api/Kilometers.Api"
    echo "    dotnet run"
    echo "  Or run tests without API integration"
fi

# 6. Create helper scripts
log_info "Creating helper scripts..."

# Create run-tests script
cat > run-tests.sh << 'EOF'
#!/bin/bash
# Quick test runner for Kilometers CLI

echo "🚀 Running Kilometers CLI E2E Tests..."
echo

# Ensure we're in the right directory
cd /Users/milesangelo/Source/active/kilometers.ai/kilometers

# Run the tests
./testing/test-e2e.sh "$@"
EOF

chmod +x run-tests.sh

# Create debug-cli script  
cat > debug-cli.sh << 'EOF'
#!/bin/bash
# Debug CLI with verbose output

export KM_DEBUG=true
export KILOMETERS_API_URL=http://localhost:5194

echo "🔍 Debug mode enabled for Kilometers CLI"
echo "API URL: $KILOMETERS_API_URL"
echo "Command: $@"
echo

./cli/km "$@"
EOF

chmod +x debug-cli.sh

log_success "Helper scripts created:"
echo "  ./run-tests.sh     - Run all E2E tests"
echo "  ./debug-cli.sh     - Run CLI with debug output"

echo
echo "=============================="
echo "       SETUP COMPLETE"
echo "=============================="
echo
echo "🎉 Everything is ready for testing!"
echo
echo "Quick start commands:"
echo "  ./run-tests.sh                    # Run all E2E tests"
echo "  ./debug-cli.sh echo 'hello'       # Test CLI with debug output"
echo "  ./testing/test-e2e.sh             # Run tests directly"
echo
echo "Next steps:"
echo "1. Run: ./run-tests.sh"
echo "2. If tests pass, follow: testing/AI-TOOL-INTEGRATION-GUIDE.md"
echo "3. Test with real AI tools (Cursor, Claude Desktop)"
echo
echo "Documentation:"
echo "  testing/AI-TOOL-INTEGRATION-GUIDE.md  - AI tool testing guide"
echo "  testing/mock-mcp-server.js           - Controllable test server"
echo "  testing/test-e2e.sh                  - Comprehensive test suite"