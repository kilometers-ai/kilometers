#!/bin/bash

# Test Deployed Environment - Kilometers.ai
# This script tests the complete deployed flow: CLI → Azure API → Dashboard
#
# Usage: ./test-deployed-environment.sh

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration - DEPLOYED ENVIRONMENT
DEPLOYED_API_URL="https://api.dev.kilometers.ai"
DEPLOYED_DASHBOARD_URL="https://app.dev.kilometers.ai"
TEST_CUSTOMER_ID="deployed-test-$(date +%s)"

# Get API key from terraform
echo -e "${CYAN}🔍 Getting API key from terraform...${NC}"
cd terraform
API_KEY=$(terraform output -raw kilometers_api_key 2>/dev/null)
cd ..

if [[ -z "$API_KEY" ]]; then
    echo -e "${RED}❌ Failed to get API key from terraform${NC}"
    echo "Run: cd terraform && terraform output kilometers_api_key"
    exit 1
fi

echo -e "${GREEN}✅ Got API key: ${API_KEY:0:8}...${NC}"

# Utility functions
log() { echo -e "${GREEN}✅ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }
info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

print_header() {
    clear
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════════════════════════════════════╗"
    echo "║                    Kilometers.ai - Deployed Environment Test                ║"
    echo "║                         CLI → Azure API → Dashboard                         ║"
    echo "╚══════════════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo
}

check_api_health() {
    info "Checking deployed API health at $DEPLOYED_API_URL..."
    
    local health_response=$(curl -s -w "%{http_code}" "$DEPLOYED_API_URL/health" -o /tmp/health_response.json 2>/dev/null || echo "000")
    
    if [[ "$health_response" == "200" ]]; then
        local status=$(cat /tmp/health_response.json 2>/dev/null | jq -r '.status' 2>/dev/null || echo "unknown")
        log "Deployed API is healthy (status: $status)"
        return 0
    else
        error "Deployed API health check failed (HTTP: $health_response)"
        if [[ -f /tmp/health_response.json ]]; then
            echo "Response: $(cat /tmp/health_response.json)"
        fi
        return 1
    fi
}

build_cli() {
    info "Building CLI..."
    cd cli
    
    if [[ ! -f "./km" ]] || [[ "main.go" -nt "./km" ]]; then
        warn "CLI binary missing or outdated, building..."
        go build -o km .
        log "CLI built successfully"
    else
        log "CLI binary up to date"
    fi
    
    cd ..
}

setup_environment() {
    info "Setting up environment for deployed testing..."
    
    # Export environment variables for CLI
    export KILOMETERS_API_URL="$DEPLOYED_API_URL"
    export KILOMETERS_API_KEY="$API_KEY"
    export KM_DEBUG="true"
    export KM_ENABLE_RISK_DETECTION="true"
    
    log "Environment configured:"
    echo "  API URL: $DEPLOYED_API_URL"
    echo "  API Key: ${API_KEY:0:8}..."
    echo "  Customer: $TEST_CUSTOMER_ID"
    echo "  Debug: enabled"
}

start_mock_mcp_server() {
    info "Starting mock MCP server..."
    
    # Kill any existing mock server
    pkill -f "mock-mcp-server.js" 2>/dev/null || true
    
    # Start mock server in background
    cd testing
    node mock-mcp-server.js > /tmp/mock-mcp.log 2>&1 &
    MOCK_PID=$!
    cd ..
    
    # Wait a moment for startup
    sleep 2
    
    if kill -0 $MOCK_PID 2>/dev/null; then
        log "Mock MCP server started (PID: $MOCK_PID)"
    else
        error "Failed to start mock MCP server"
        cat /tmp/mock-mcp.log
        return 1
    fi
}

run_test_scenarios() {
    info "Running test scenarios through CLI wrapper..."
    cd cli
    
    # Test data - various MCP calls that should generate interesting events
    local test_commands=(
        '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{"tools":{},"resources":{}}}}'
        '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'
        '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"github-search","arguments":{"query":"kubernetes deployment"}}}'
        '{"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"file-read","arguments":{"path":"/etc/passwd"}}}'
        '{"jsonrpc":"2.0","id":5,"method":"resources/list"}'
        '{"jsonrpc":"2.0","id":6,"method":"resources/read","params":{"uri":"file:///config/app.json"}}'
        '{"jsonrpc":"2.0","id":7,"method":"prompts/list"}'
        '{"jsonrpc":"2.0","id":8,"method":"prompts/get","params":{"name":"code-review","arguments":{"language":"python"}}}'
    )
    
    echo "Sending ${#test_commands[@]} test commands..."
    
    for i in "${!test_commands[@]}"; do
        local cmd="${test_commands[$i]}"
        info "Test $((i+1))/${#test_commands[@]}: $(echo "$cmd" | jq -r '.method' 2>/dev/null || echo "unknown")"
        
        # Send command through CLI wrapper to mock MCP server
        echo "$cmd" | timeout 10s ./km node testing/mock-mcp-server.js > /dev/null 2>&1 || warn "Command $((i+1)) may have failed"
        
        # Small delay between commands
        sleep 0.5
    done
    
    cd ..
    log "Test scenarios completed"
}

verify_api_data() {
    info "Verifying data in deployed API..."
    
    # Wait for events to be processed
    sleep 3
    
    # Check activity endpoint with API key
    local activity_response=$(curl -s -H "Authorization: Bearer $API_KEY" "$DEPLOYED_API_URL/api/activity?limit=20" 2>/dev/null)
    
    if [[ $? -eq 0 ]]; then
        local event_count=$(echo "$activity_response" | jq '. | length' 2>/dev/null || echo "0")
        
        if [[ "$event_count" -gt 0 ]]; then
            log "✅ Found $event_count events in deployed API!"
            
            # Show sample events
            echo "Sample events:"
            echo "$activity_response" | jq -r '.[:3] | .[] | "  • \(.timestamp) - \(.method // "response") - Risk: \(.riskLevel // "unknown")"' 2>/dev/null || echo "  (Could not parse events)"
            
            # Check for high-risk events
            local high_risk_count=$(echo "$activity_response" | jq '[.[] | select(.riskLevel == "HIGH")] | length' 2>/dev/null || echo "0")
            if [[ "$high_risk_count" -gt 0 ]]; then
                warn "Found $high_risk_count high-risk events (good for testing!)"
            fi
            
            return 0
        else
            error "No events found in deployed API"
            echo "API Response: $activity_response"
            return 1
        fi
    else
        error "Failed to query deployed API"
        return 1
    fi
}

open_dashboard() {
    info "Opening dashboard to view results..."
    
    echo
    echo -e "${CYAN}🎯 Dashboard URL: ${DEPLOYED_DASHBOARD_URL}${NC}"
    echo
    echo "The dashboard should now show the test events we just generated."
    echo "Look for:"
    echo "  • Recent activity in the last few minutes"
    echo "  • Various MCP methods (tools/call, resources/read, etc.)"
    echo "  • Risk levels including potential HIGH risk events"
    echo
    
    read -p "Press Enter to open dashboard in browser..."
    
    # Open dashboard in default browser
    if command -v open >/dev/null 2>&1; then
        open "$DEPLOYED_DASHBOARD_URL"
    elif command -v xdg-open >/dev/null 2>&1; then
        xdg-open "$DEPLOYED_DASHBOARD_URL"
    else
        echo "Please manually open: $DEPLOYED_DASHBOARD_URL"
    fi
}

cleanup() {
    info "Cleaning up..."
    
    # Kill mock server if running
    if [[ -n "$MOCK_PID" ]]; then
        kill $MOCK_PID 2>/dev/null || true
        log "Mock MCP server stopped"
    fi
    
    # Clean up temp files
    rm -f /tmp/health_response.json /tmp/mock-mcp.log
}

# Main execution
main() {
    print_header
    
    # Set up cleanup trap
    trap cleanup EXIT
    
    info "Testing deployed Kilometers.ai environment..."
    echo "This will:"
    echo "  1. Check API health"
    echo "  2. Build CLI if needed"
    echo "  3. Generate test MCP events"
    echo "  4. Verify data appears in deployed API"
    echo "  5. Open dashboard to view results"
    echo
    
    read -p "Press Enter to continue..."
    echo
    
    # Execute test steps
    check_api_health || exit 1
    build_cli || exit 1
    setup_environment
    start_mock_mcp_server || exit 1
    run_test_scenarios
    verify_api_data || exit 1
    open_dashboard
    
    echo
    log "🎉 Deployed environment test completed successfully!"
    echo
    echo -e "${YELLOW}Next steps:${NC}"
    echo "  • Check the dashboard for real-time data"
    echo "  • Run CLI with real MCP servers: ./cli/km <your-mcp-command>"
    echo "  • Monitor API logs in Azure for production debugging"
}

# Run main function
main "$@" 