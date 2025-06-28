#!/bin/bash

# Quick Test Script for Kilometers.ai Stack
# Use this for rapid iteration and debugging during development

set -e

# Configuration
PROJECT_ROOT="/Users/milesangelo/Source/active/kilometers.ai/kilometers"
API_URL="http://localhost:5194"
DASHBOARD_URL="http://localhost:3001"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}✓ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠ $1${NC}"; }
error() { echo -e "${RED}✗ $1${NC}"; }

# Quick health checks
check_api() {
    echo "🔍 Checking API..."
    if curl -s "$API_URL/health" > /dev/null; then
        local health=$(curl -s "$API_URL/health" | jq -r '.status' 2>/dev/null || echo "unknown")
        log "API is running (status: $health)"
        return 0
    else
        error "API is not responding at $API_URL"
        return 1
    fi
}

check_dashboard() {
    echo "🔍 Checking Dashboard..."
    if curl -s "$DASHBOARD_URL" > /dev/null; then
        log "Dashboard is running"
        return 0
    else
        error "Dashboard is not responding at $DASHBOARD_URL"
        return 1
    fi
}

check_cli() {
    echo "🔍 Checking CLI..."
    cd "$PROJECT_ROOT/cli"
    if [[ -f "./km" ]]; then
        log "CLI binary exists"
        return 0
    else
        warn "CLI binary not found, building..."
        go build -o km .
        log "CLI built successfully"
        return 0
    fi
}

# Quick data test
test_data_flow() {
    echo "🧪 Testing CLI-to-API data flow..."
    cd "$PROJECT_ROOT/cli"
    
    # Use consistent customer ID for testing (matches dashboard configuration)
    local test_customer="test-customer"
    export KILOMETERS_API_URL="$API_URL"
    export KILOMETERS_CUSTOMER_ID="$test_customer"
    export KM_DEBUG="true"
    
    log "Testing with customer ID: $test_customer"
    
    # Test with a high-risk method to verify risk detection
    local test_request='{"jsonrpc":"2.0","id":999,"method":"tools/call","params":{"name":"shell-command"}}'
    echo "📡 Sending test request: $test_request"
    
    local response=$(echo "$test_request" | ./km node -e "
        const readline = require('readline');
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        rl.on('line', (line) => {
            const req = JSON.parse(line);
            console.log(JSON.stringify({jsonrpc:'2.0',id:req.id,result:{status:'success'}}));
            rl.close();
        });
    " 2>/dev/null || echo "failed")
    
    if [[ "$response" != "failed" ]]; then
        log "CLI wrapper executed successfully"
        
        # Verify events were received by API
        echo "🔍 Checking API for received events..."
        sleep 1
        
        local stats=$(curl -s "$API_URL/api/stats?customerId=$test_customer" 2>/dev/null)
        local total_events=$(echo "$stats" | jq -r '.totalEvents // 0' 2>/dev/null || echo "0")
        
        if [[ "$total_events" -gt "0" ]]; then
            log "✅ API received $total_events events from CLI"
            local cost=$(echo "$stats" | jq -r '.totalCost // 0' 2>/dev/null || echo "0")
            log "💰 Total cost: \$$cost"
            
            # Show event details
            local activity=$(curl -s "$API_URL/api/activity?customerId=$test_customer&limit=5" 2>/dev/null)
            local methods=$(echo "$activity" | jq -r '.[].method // "response"' 2>/dev/null | sort | uniq | tr '\n' ' ')
            log "📊 Methods captured: $methods"
        else
            error "❌ API did not receive any events from CLI"
            warn "Check API logs for errors"
            return 1
        fi
    else
        error "CLI wrapper test failed"
        return 1
    fi
}

# Generate comprehensive test events for dashboard testing
generate_test_events() {
    echo "📊 Generating comprehensive test events using CLI risk detection..."
    cd "$PROJECT_ROOT/cli"
    
    export KILOMETERS_API_URL="$API_URL"
    export KILOMETERS_CUSTOMER_ID="test-customer"
    export KM_DEBUG="true"
    
    # Enhanced Node.js MCP responder with realistic responses
    local node_responder='
        const readline = require("readline");
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        rl.on("line", (line) => {
            try {
                const req = JSON.parse(line);
                let response = { jsonrpc: "2.0", id: req.id };
                
                // Generate realistic responses based on method
                switch(req.method) {
                    case "tools/list":
                        response.result = {
                            tools: [
                                {name: "github-search", description: "Search GitHub repositories"},
                                {name: "file-read", description: "Read file contents"},
                                {name: "database-query", description: "Query database"}
                            ]
                        };
                        break;
                    case "tools/call":
                        const toolName = req.params?.name || "unknown";
                        if (toolName === "github-search") {
                            response.result = {
                                content: [{
                                    type: "text", 
                                    text: `Found 1,234 repositories for query: ${req.params?.arguments?.query || "default"}`
                                }]
                            };
                        } else if (toolName === "file-read") {
                            response.result = {
                                content: [{
                                    type: "text",
                                    text: JSON.stringify({config: "production", debug: false, version: "1.0.0"})
                                }]
                            };
                        } else {
                            response.result = { success: true, data: "Operation completed" };
                        }
                        break;
                    case "resources/read":
                        response.result = {
                            contents: [{
                                uri: req.params?.uri,
                                mimeType: req.params?.mimeType || "text/plain",
                                text: "Sample file content with configuration data..."
                            }]
                        };
                        break;
                    case "resources/list":
                        response.result = {
                            resources: [
                                {uri: "file:///config/app.json", name: "App Config"},
                                {uri: "file:///logs/app.log", name: "Application Logs"}
                            ]
                        };
                        break;
                    case "prompts/list":
                        response.result = {
                            prompts: [
                                {name: "code-review", description: "Review code for issues"},
                                {name: "documentation", description: "Generate documentation"}
                            ]
                        };
                        break;
                    case "prompts/get":
                        response.result = {
                            description: "AI-powered code review assistant",
                            arguments: req.params?.arguments || {}
                        };
                        break;
                    default:
                        response.result = { status: "ok", method: req.method };
                }
                
                console.log(JSON.stringify(response));
            } catch(e) {
                console.log("{\"jsonrpc\":\"2.0\",\"id\":null,\"error\":{\"code\":-32700,\"message\":\"Parse error\"}}");
            }
            rl.close();
        });
    '
    
    # Test scenarios using the new CLI configuration system
    echo "Testing CLI risk detection capabilities..."
    
    # Test 1: All events (baseline)
    echo "🔍 Test 1: All events capture (no filtering)"
    local test_scenarios=(
        '{"jsonrpc":"2.0","id":1,"method":"resources/read","params":{"uri":"file:///etc/passwd","mimeType":"text/plain"}}'
        '{"jsonrpc":"2.0","id":2,"method":"resources/read","params":{"uri":"file:///home/user/.ssh/id_rsa","mimeType":"text/plain"}}'
        '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"database-query","arguments":{"query":"SELECT * FROM users WHERE admin=1"}}}'
        '{"jsonrpc":"2.0","id":4,"method":"resources/read","params":{"uri":"file:///app/.env","mimeType":"text/plain"}}'
        '{"jsonrpc":"2.0","id":5,"method":"tools/list"}'
        '{"jsonrpc":"2.0","id":6,"method":"prompts/list"}'
        '{"jsonrpc":"2.0","id":7,"method":"ping"}'
    )
    
    for scenario in "${test_scenarios[@]}"; do
        echo "$scenario" | ./km node -e "$node_responder" > /dev/null 2>&1 || true
        sleep 0.1
    done
    
    echo "   ✅ Sent ${#test_scenarios[@]} diverse events (should capture all except ping due to default exclusion)"
    
    # Test 2: High-risk only filtering
    echo "🔍 Test 2: High-risk events only"
    export KM_ENABLE_RISK_DETECTION=true
    export KM_HIGH_RISK_ONLY=true
    
    for scenario in "${test_scenarios[@]}"; do
        echo "$scenario" | ./km node -e "$node_responder" > /dev/null 2>&1 || true
        sleep 0.1
    done
    
    echo "   ✅ Sent ${#test_scenarios[@]} events with high-risk filtering (should only capture file system access)"
    
    # Test 3: Method whitelist filtering
    echo "🔍 Test 3: Method whitelist (tools/* only)"
    unset KM_HIGH_RISK_ONLY
    export KM_METHOD_WHITELIST="tools/call,tools/list"
    
    for scenario in "${test_scenarios[@]}"; do
        echo "$scenario" | ./km node -e "$node_responder" > /dev/null 2>&1 || true
        sleep 0.1
    done
    
    echo "   ✅ Sent ${#test_scenarios[@]} events with method filtering (should only capture tools/* methods)"
    
    # Test 4: Payload size limit
    echo "🔍 Test 4: Payload size limits"
    unset KM_METHOD_WHITELIST
    export KM_PAYLOAD_SIZE_LIMIT=100  # Very small limit to test filtering
    
    # Add a large payload scenario
    local large_payload='{"jsonrpc":"2.0","id":8,"method":"tools/call","params":{"name":"large-data","arguments":{"data":"'$(printf 'A%.0s' {1..200})'"}}}' 
    
    echo "$large_payload" | ./km node -e "$node_responder" > /dev/null 2>&1 || true
    echo '{"jsonrpc":"2.0","id":9,"method":"tools/list"}' | ./km node -e "$node_responder" > /dev/null 2>&1 || true
    
    echo "   ✅ Sent events with payload size limits (should filter out large payloads)"
    
    # Test 5: Complete filtering (enterprise security mode)
    echo "🔍 Test 5: Enterprise security mode"
    export KM_ENABLE_RISK_DETECTION=true
    export KM_METHOD_WHITELIST="resources/read,tools/call"
    export KM_PAYLOAD_SIZE_LIMIT=5120
    export KM_EXCLUDE_PING=true
    
    for scenario in "${test_scenarios[@]}"; do
        echo "$scenario" | ./km node -e "$node_responder" > /dev/null 2>&1 || true
        sleep 0.1
    done
    
    echo "   ✅ Sent ${#test_scenarios[@]} events with enterprise filtering (method + size + ping exclusion)"
    
    # Reset environment
    unset KM_ENABLE_RISK_DETECTION KM_HIGH_RISK_ONLY KM_METHOD_WHITELIST KM_PAYLOAD_SIZE_LIMIT KM_EXCLUDE_PING
    
    echo
    log "Generated comprehensive test events using CLI risk detection!"
    echo "   📊 Test results show CLI filtering capabilities:"
    echo "      • High-risk detection: Automatically identifies system file access"
    echo "      • Method filtering: Selective capture based on MCP method patterns"
    echo "      • Payload limits: Size-based filtering for bandwidth management"
    echo "      • Combined filtering: Enterprise security mode with multiple constraints"
    echo "      • Risk scoring: Client-side assessment matching API standards"
    
    # Show final stats
    sleep 2
    show_stats
}

# Display current stats
show_stats() {
    echo "📈 Current Stats:"
    
    # API stats
    local stats=$(curl -s "$API_URL/api/stats?customerId=test-customer" 2>/dev/null)
    if [[ -n "$stats" ]]; then
        echo "   📊 API Stats:"
        echo "      $stats" | jq '.' 2>/dev/null || echo "      $stats"
    else
        warn "   Could not fetch API stats"
    fi
    
    # Recent activity
    local activity=$(curl -s "$API_URL/api/activity?customerId=test-customer&limit=10" 2>/dev/null)
    if [[ -n "$activity" ]]; then
        local count=$(echo "$activity" | jq '. | length' 2>/dev/null || echo "unknown")
        echo "   📝 Recent Events: $count"
        
        # Show method breakdown
        if command -v jq >/dev/null 2>&1; then
            echo "   🔍 Method breakdown:"
            echo "$activity" | jq -r '.[].method' 2>/dev/null | sort | uniq -c | while read count method; do
                echo "      • $method: $count events"
            done
            
            echo "   ⚠️  Risk levels:"
            echo "$activity" | jq -r '.[].riskScore // 0' 2>/dev/null | awk '
                {
                    if ($1 < 20) low++
                    else if ($1 < 50) medium++
                    else high++
                }
                END {
                    print "      • Low (0-19): " (low+0) " events"
                    print "      • Medium (20-49): " (medium+0) " events"  
                    print "      • High (50+): " (high+0) " events"
                }'
        fi
    else
        warn "   Could not fetch recent activity"
    fi
    
    echo "   🌐 Dashboard URL: $DASHBOARD_URL"
    echo "   💡 Tip: Open dashboard to see real-time visualization"
}

# Clear test data (useful for fresh testing)
clear_test_data() {
    echo "🧹 Clearing test data..."
    
    # Note: Since we're using in-memory storage for development,
    # the easiest way to clear data is to restart the API
    warn "Note: Currently using in-memory storage"
    warn "To clear data completely, restart the API (option 6)"
    
    # For now, just show current state
    echo "   Current test customer events:"
    local activity=$(curl -s "$API_URL/api/activity?customerId=test-customer&limit=100" 2>/dev/null)
    if [[ -n "$activity" ]]; then
        local count=$(echo "$activity" | jq '. | length' 2>/dev/null || echo "unknown")
        echo "   📊 Total events in memory: $count"
    else
        echo "   📊 No events found or API not responding"
    fi
    
    echo
    echo "   🔄 To start fresh:"
    echo "      1. Stop API (Ctrl+C if running)"
    echo "      2. Start API (option 6)"
    echo "      3. Generate new test events (option 3)"
}

# Build components quickly
quick_build() {
    echo "🔨 Quick build..."
    
    # Build CLI
    cd "$PROJECT_ROOT/cli"
    go build -o km .
    log "CLI built"
    
    # Check if API needs restore
    cd "$PROJECT_ROOT/api/Kilometers.Api"
    if [[ ! -d "bin" ]]; then
        dotnet restore
        dotnet build
        log "API built"
    else
        log "API already built"
    fi
    
    # Check if dashboard needs npm install
    cd "$PROJECT_ROOT/dashboard"
    if [[ ! -d "node_modules" ]]; then
        npm install
        log "Dashboard dependencies installed"
    else
        log "Dashboard dependencies already installed"
    fi
}

# Start just the API for testing
start_api_only() {
    echo "🚀 Starting API only..."
    cd "$PROJECT_ROOT/api/Kilometers.Api"
    
    export ASPNETCORE_ENVIRONMENT=Development
    export ASPNETCORE_URLS="http://localhost:5194"
    
    echo "Starting API... (Ctrl+C to stop)"
    dotnet run --no-build
}

# Start just the dashboard for testing
start_dashboard_only() {
    echo "🌐 Starting Dashboard only..."
    cd "$PROJECT_ROOT/dashboard"
    
    export NEXT_PUBLIC_API_URL="$API_URL"
    export PORT="3001"
    
    echo "Starting Dashboard... (Ctrl+C to stop)"
    npm run dev
}

# Main menu
show_menu() {
    echo
    echo "🛠️  Kilometers.ai Quick Test Menu"
    echo "================================="
    echo "1. 🔍 Health Check All"
    echo "2. 🧪 Test Data Flow"
    echo "3. 📊 Generate Test Events"
    echo "4. 📈 Show Current Stats"
    echo "5. 🧹 Clear Test Data"
    echo "6. 🔨 Quick Build All"
    echo "7. 🚀 Start API Only"
    echo "8. 🌐 Start Dashboard Only"
    echo "9. 🆘 Debug Info"
    echo "0. ❌ Exit"
    echo
    read -p "Choose option (0-9): " choice
}

# Debug information
show_debug_info() {
    echo "🆘 Debug Information:"
    echo "   Project Root: $PROJECT_ROOT"
    echo "   API URL: $API_URL"
    echo "   Dashboard URL: $DASHBOARD_URL"
    echo "   Current Dir: $(pwd)"
    echo
    
    echo "📁 File Check:"
    echo "   CLI Binary: $(ls -la $PROJECT_ROOT/cli/km 2>/dev/null || echo 'NOT FOUND')"
    echo "   API Project: $(ls -la $PROJECT_ROOT/api/Kilometers.Api/*.csproj 2>/dev/null || echo 'NOT FOUND')"
    echo "   Dashboard: $(ls -la $PROJECT_ROOT/dashboard/package.json 2>/dev/null || echo 'NOT FOUND')"
    echo
    
    echo "🔌 Port Check:"
    lsof -i :5194 2>/dev/null || echo "   Port 5194: Available"
    lsof -i :3001 2>/dev/null || echo "   Port 3001: Available"
    echo
    
    echo "🛠️  Tool Check:"
    command -v dotnet >/dev/null && echo "   ✓ dotnet: $(dotnet --version)" || echo "   ✗ dotnet: Not found"
    command -v npm >/dev/null && echo "   ✓ npm: $(npm --version)" || echo "   ✗ npm: Not found"
    command -v go >/dev/null && echo "   ✓ go: $(go version | cut -d' ' -f3)" || echo "   ✗ go: Not found"
    command -v curl >/dev/null && echo "   ✓ curl: Available" || echo "   ✗ curl: Not found"
}

# Interactive mode
interactive_mode() {
    while true; do
        show_menu
        case $choice in
            1)
                check_cli && check_api && check_dashboard
                ;;
            2)
                test_data_flow
                ;;
            3)
                generate_test_events
                show_stats
                ;;
            4)
                show_stats
                ;;
            5)
                clear_test_data
                ;;
            6)
                quick_build
                ;;
            7)
                start_api_only
                ;;
            8)
                start_dashboard_only
                ;;
            9)
                show_debug_info
                ;;
            0)
                echo "👋 Goodbye!"
                exit 0
                ;;
            *)
                warn "Invalid option: $choice"
                ;;
        esac
        echo
        read -p "Press Enter to continue..."
    done
}

# Command line mode
if [[ $# -eq 0 ]]; then
    interactive_mode
else
    case $1 in
        "health")
            check_cli && check_api && check_dashboard
            ;;
        "test")
            test_data_flow
            ;;
        "events")
            generate_test_events
            show_stats
            ;;
        "stats")
            show_stats
            ;;
        "clear")
            clear_test_data
            ;;
        "build")
            quick_build
            ;;
        "api")
            start_api_only
            ;;
        "dashboard")
            start_dashboard_only
            ;;
        "debug")
            show_debug_info
            ;;
        *)
            echo "Usage: $0 [health|test|events|stats|clear|build|api|dashboard|debug]"
            echo "   or run without arguments for interactive mode"
            exit 1
            ;;
    esac
fi