#!/bin/bash

# Simple Deployed Environment Test - Kilometers.ai
# Quick test of CLI → Azure API → Dashboard flow
#
# Usage: ./simple-deployed-test.sh

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
DEPLOYED_API_URL="https://api.dev.kilometers.ai"
DEPLOYED_DASHBOARD_URL="https://app.dev.kilometers.ai"

# Get API key from terraform
echo -e "${CYAN}🔍 Getting API key from terraform...${NC}"
cd terraform
API_KEY=$(terraform output -raw kilometers_api_key 2>/dev/null)
cd ..

if [[ -z "$API_KEY" ]]; then
    echo -e "${RED}❌ Failed to get API key from terraform${NC}"
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
    echo "║                   Kilometers.ai - Simple Deployed Test                      ║"
    echo "║                         CLI → Azure API → Dashboard                         ║"
    echo "╚══════════════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo
}

# Test API health
test_api_health() {
    info "Testing API health..."
    local health=$(curl -s "$DEPLOYED_API_URL/health" 2>/dev/null)
    if [[ $? -eq 0 ]]; then
        log "API is healthy: $health"
    else
        error "API health check failed"
        return 1
    fi
}

# Build CLI
build_cli() {
    info "Building CLI if needed..."
    cd cli
    if [[ ! -f "./km" ]] || [[ "main.go" -nt "./km" ]]; then
        warn "Building CLI..."
        go build -o km .
        log "CLI built"
    else
        log "CLI is up to date"
    fi
    cd ..
}

# Test CLI with simple echo server
test_cli_basic() {
    info "Testing CLI with simple echo server..."
    
    # Set environment for deployed API
    export KILOMETERS_API_URL="$DEPLOYED_API_URL"
    export KILOMETERS_API_KEY="$API_KEY"
    export KM_DEBUG="true"
    
    log "Environment configured for deployed API"
    echo "  API URL: $DEPLOYED_API_URL"
    echo "  API Key: ${API_KEY:0:8}..."
    
    # Create a simple test using Node.js echo
    cd cli
    
    info "Sending test MCP request through CLI..."
    
    # Test with a simple Node.js one-liner that acts as MCP server
    local test_request='{"jsonrpc":"2.0","id":123,"method":"tools/call","params":{"name":"test-tool","arguments":{"action":"deploy-test"}}}'
    
    echo "Test request: $test_request"
    
    # Send through CLI wrapper - this should capture the event and send to deployed API
    echo "$test_request" | ./km node -e "
        const readline = require('readline');
        const rl = readline.createInterface({ input: process.stdin });
        rl.on('line', (line) => {
            try {
                const req = JSON.parse(line);
                const response = {
                    jsonrpc: '2.0',
                    id: req.id,
                    result: {
                        status: 'success',
                        data: 'Deployed test completed',
                        timestamp: new Date().toISOString()
                    }
                };
                console.log(JSON.stringify(response));
                rl.close();
            } catch (e) {
                console.error('Error:', e.message);
                rl.close();
            }
        });
    " 2>/dev/null || warn "CLI test may have failed"
    
    cd ..
    log "CLI test completed"
}

# Verify data in API
verify_api_data() {
    info "Checking for events in deployed API..."
    
    # Wait for event processing
    sleep 2
    
    # Query API activity endpoint
    local response=$(curl -s -H "Authorization: Bearer $API_KEY" "$DEPLOYED_API_URL/api/activity?limit=10" 2>/dev/null)
    
    if [[ $? -eq 0 ]]; then
        local count=$(echo "$response" | jq '. | length' 2>/dev/null || echo "0")
        
        if [[ "$count" -gt "0" ]]; then
            log "✅ Found $count events in deployed API!"
            
            # Show recent events
            echo "Recent events:"
            echo "$response" | jq -r '.[:3] | .[] | "  • \(.timestamp // "unknown") - \(.method // .eventType // "event") - \(.riskLevel // "unknown")"' 2>/dev/null || echo "  (Events found but couldn't parse details)"
            
            return 0
        else
            warn "No events found in API (this might be expected if testing for first time)"
            echo "API Response: $response"
            return 1
        fi
    else
        error "Failed to query deployed API"
        return 1
    fi
}

# Open dashboard
open_dashboard() {
    info "Opening dashboard..."
    echo
    echo -e "${CYAN}🎯 Dashboard URL: ${DEPLOYED_DASHBOARD_URL}${NC}"
    echo
    echo "The dashboard should show any events that were successfully sent."
    echo
    
    if command -v open >/dev/null 2>&1; then
        open "$DEPLOYED_DASHBOARD_URL"
        log "Dashboard opened in browser"
    else
        echo "Please manually open: $DEPLOYED_DASHBOARD_URL"
    fi
}

# Main execution
main() {
    print_header
    
    info "Running simple deployed environment test..."
    echo "This will:"
    echo "  1. Check API health"
    echo "  2. Build CLI if needed"
    echo "  3. Send a test MCP event through CLI"
    echo "  4. Check if data appears in deployed API"
    echo "  5. Open dashboard"
    echo
    
    read -p "Press Enter to continue..."
    echo
    
    test_api_health || exit 1
    build_cli || exit 1
    test_cli_basic
    
    echo
    info "Verifying results..."
    verify_api_data || warn "No events found - this might be expected for first run"
    
    echo
    open_dashboard
    
    echo
    log "🎉 Simple deployed test completed!"
    echo
    echo -e "${YELLOW}What to check in the dashboard:${NC}"
    echo "  • Look for recent events in the activity feed"
    echo "  • Check if the test event appears with method 'tools/call'"
    echo "  • Verify API key authentication is working"
    echo
    echo -e "${YELLOW}If no events appear:${NC}"
    echo "  • Check API logs in Azure portal"
    echo "  • Verify KILOMETERS_API_KEY environment variable is set correctly"
    echo "  • Ensure CLI is sending to correct endpoint: $DEPLOYED_API_URL"
}

main "$@" 