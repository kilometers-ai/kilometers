#!/bin/bash

# Test Docker MCP Servers with Kilometers CLI
# This script tests various Docker-based MCP servers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
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

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if CLI exists
    if [[ ! -f "/projects/kilometers.ai/kilometers/cli/km" ]]; then
        log_error "Kilometers CLI not found. Run: cd /projects/kilometers.ai/kilometers/cli && go build -o km ."
        exit 1
    fi
    
    # Check if Docker is available
    if ! command -v docker >/dev/null 2>&1; then
        log_error "Docker is required to test Docker MCP servers"
        exit 1
    fi
    
    # Check if Docker daemon is running
    if ! docker info >/dev/null 2>&1; then
        log_error "Docker daemon is not running. Please start Docker."
        exit 1
    fi
    
    log_success "All prerequisites met"
}

# Test 1: Docker containerized filesystem MCP
test_docker_filesystem_mcp() {
    log_info "Test 1: Docker Filesystem MCP Server"
    
    # Create test directory
    mkdir -p /tmp/mcp-test
    echo "Hello from Docker MCP!" > /tmp/mcp-test/test-file.txt
    
    # Test input
    local test_input='{"jsonrpc":"2.0","id":"test-fs","method":"resources/list"}'
    
    log_info "Testing filesystem MCP in Docker container..."
    if echo "$test_input" | timeout 30s /projects/kilometers.ai/kilometers/cli/km docker run --rm -i -v /tmp/mcp-test:/mnt/allowed mcp/filesystem /mnt/allowed 2>/dev/null; then
        log_success "Docker Filesystem MCP server works!"
    else
        log_warning "Docker Filesystem MCP test failed or timed out"
    fi
}

# Test 2: Docker containerized fetch MCP  
test_docker_fetch_mcp() {
    log_info "Test 2: Docker Fetch MCP Server"
    
    # Test input for fetching a simple webpage
    local test_input='{"jsonrpc":"2.0","id":"test-fetch","method":"tools/call","params":{"name":"fetch","arguments":{"url":"https://httpbin.org/get"}}}'
    
    log_info "Testing fetch MCP in Docker container..."
    if echo "$test_input" | timeout 30s /projects/kilometers.ai/kilometers/cli/km docker run --rm -i mcp/fetch 2>/dev/null; then
        log_success "Docker Fetch MCP server works!"
    else
        log_warning "Docker Fetch MCP test failed or timed out"
    fi
}

# Test 3: Docker containerized time MCP
test_docker_time_mcp() {
    log_info "Test 3: Docker Time MCP Server"
    
    # Test input
    local test_input='{"jsonrpc":"2.0","id":"test-time","method":"tools/call","params":{"name":"get_current_time","arguments":{}}}'
    
    log_info "Testing time MCP in Docker container..."
    if echo "$test_input" | timeout 30s /projects/kilometers.ai/kilometers/cli/km docker run --rm -i mcp/time 2>/dev/null; then
        log_success "Docker Time MCP server works!"
    else
        log_warning "Docker Time MCP test failed or timed out"
    fi
}

# Test 4: Check available Docker MCP images
test_available_docker_mcp_images() {
    log_info "Test 4: Checking available Docker MCP images"
    
    # Try to pull some common MCP images to see what's available
    local mcp_images=("mcp/filesystem" "mcp/fetch" "mcp/time" "mcp/github-mcp-server")
    
    for image in "${mcp_images[@]}"; do
        log_info "Checking if $image is available..."
        if docker pull "$image" >/dev/null 2>&1; then
            log_success "✅ $image is available"
        else
            log_warning "⚠️  $image not available or pull failed"
        fi
    done
}

# Test 5: Monitor Events during Docker MCP usage
test_event_monitoring() {
    log_info "Test 5: Event monitoring during Docker MCP usage"
    
    # Check if API is available
    if ! curl -s http://localhost:5194/health >/dev/null 2>&1; then
        log_warning "API server not available - skipping event monitoring test"
        return
    fi
    
    # Get initial event count
    local initial_count
    initial_count=$(curl -s "http://localhost:5194/api/activity" | jq '.events | length' 2>/dev/null || echo "0")
    
    # Run a Docker MCP command with event capture
    local test_input='{"jsonrpc":"2.0","id":"event-test","method":"ping"}'
    echo "$test_input" | timeout 15s /projects/kilometers.ai/kilometers/cli/km docker run --rm -i mcp/time >/dev/null 2>&1 || true
    
    # Wait and check for new events
    sleep 2
    local final_count
    final_count=$(curl -s "http://localhost:5194/api/activity" | jq '.events | length' 2>/dev/null || echo "0")
    
    if [[ "$final_count" -gt "$initial_count" ]]; then
        log_success "Event capture works with Docker MCP servers! (captured $((final_count - initial_count)) events)"
    else
        log_warning "No new events captured during Docker MCP test"
    fi
}

# Main test execution
main() {
    echo "=============================="
    echo "  Docker MCP Server Tests"
    echo "=============================="
    echo
    
    check_prerequisites
    
    # Enable debug mode
    export KM_DEBUG=true
    export KILOMETERS_API_URL=http://localhost:5194
    
    echo
    log_info "Testing various Docker MCP servers with Kilometers CLI wrapper..."
    echo
    
    test_available_docker_mcp_images
    echo
    
    test_docker_time_mcp
    echo
    
    test_docker_fetch_mcp  
    echo
    
    test_docker_filesystem_mcp
    echo
    
    test_event_monitoring
    echo
    
    echo "=============================="
    echo "       TEST COMPLETE"
    echo "=============================="
    echo
    echo "🎉 Docker MCP testing complete!"
    echo
    echo "Next steps:"
    echo "1. If tests passed, configure your AI tool with Docker MCP servers"
    echo "2. Try the configuration examples above in Cursor or Claude Desktop"
    echo "3. Monitor events at http://localhost:5194/api/activity"
    echo
    echo "Available Docker MCP servers:"
    echo "  mcp/filesystem  - File system operations"  
    echo "  mcp/fetch       - Web content fetching"
    echo "  mcp/time        - Time and date functions"
    echo "  mcp/github-mcp-server - GitHub operations"
    echo "  mcp/postgres    - PostgreSQL database access"
    echo "  mcp/stripe      - Stripe payment operations"
    echo
    echo "Browse more at: https://hub.docker.com/u/mcp"
}

# Run the tests
main "$@"