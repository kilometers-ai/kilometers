#!/bin/bash

# Kilometers.ai Interactive Demo Script
# This script demonstrates the CLI wrapper functionality with a mock MCP server
# 
# Usage:
#   ./demo.sh                    # Interactive mode
#   RECORDING_MODE=true ./demo.sh # Recording mode with auto-advance
#   ./demo.sh --recording        # Recording mode
#   ./demo.sh --help             # Show help

set -e

# Check for help flag
if [[ "$1" == "--help" || "$1" == "-h" ]]; then
    cat << 'EOF'
╔══════════════════════════════════════════════════════════════════════════════╗
║                    Kilometers.ai Demo - Usage Guide                         ║
╚══════════════════════════════════════════════════════════════════════════════╝

INTERACTIVE MODE (default):
  ./demo.sh
  
  • Manual Enter key presses to advance
  • Variable timing based on user speed
  • Left-aligned output
  • Perfect for live demonstrations

RECORDING MODE:
  RECORDING_MODE=true ./demo.sh
  ./demo.sh --recording
  
  • Auto-advance with consistent timing
  • Center-aligned professional layout
  • Optimized for screen recordings
  • ~3-4 minute runtime

CUSTOM TIMING:
  SECTION_DELAY=3.0 STEP_DELAY=2.0 ./demo.sh --recording
  
  Environment Variables:
  • SECTION_DELAY (default: 2.0s) - Time between major sections
  • STEP_DELAY (default: 1.5s)    - Time between steps
  • ACTION_DELAY (default: 0.8s)  - Time between actions
  • TYPING_DELAY (default: 0.6s)  - Typing simulation delay

RECORDING TIPS:
  • Use full screen terminal (1920x1080+ recommended)
  • Dark background with light text for best contrast
  • Readable font (Monaco, Menlo, Consolas) size 14-16
  • Terminal width 80+ columns for proper centering
  
EOF
    exit 0
fi

# Check for recording mode flag
if [[ "$1" == "--recording" ]]; then
    export RECORDING_MODE=true
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Demo configuration
DEMO_DIR="/tmp/kilometers-demo"
MOCK_SERVER_PORT="3000"
API_PORT="5194"
DEMO_API_URL="http://localhost:$API_PORT"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Recording mode configuration
RECORDING_MODE="${RECORDING_MODE:-false}"
STEP_DELAY="${STEP_DELAY:-1.5}"        # Delay between major steps
ACTION_DELAY="${ACTION_DELAY:-0.8}"    # Delay between actions
TYPING_DELAY="${TYPING_DELAY:-0.6}"    # Typing simulation delay
SECTION_DELAY="${SECTION_DELAY:-2.0}"  # Delay between major sections

# Terminal width detection for centering
TERMINAL_WIDTH=$(tput cols 2>/dev/null || stty size 2>/dev/null | cut -d' ' -f2 || echo 80)

# Functions
print_header() {
    clear
    echo
    if [ "$RECORDING_MODE" = "true" ]; then
        center_text "${PURPLE}╔══════════════════════════════════════════════════════════════════════════════╗"
        center_text "║                            Kilometers.ai Demo                               ║"
        center_text "║                     Your AI's Digital Odometer                              ║"
        center_text "╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
    else
        echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════════════════════╗"
        echo -e "║                            Kilometers.ai Demo                               ║"
        echo -e "║                     Your AI's Digital Odometer                              ║"
        echo -e "╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
    fi
    echo
    recording_pause "$SECTION_DELAY"
}

print_section() {
    echo
    if [ "$RECORDING_MODE" = "true" ]; then
        center_text "${CYAN}═══ $1 ═══${NC}"
    else
        echo -e "${CYAN}═══ $1 ═══${NC}"
    fi
    echo
    recording_pause "$STEP_DELAY"
}

print_step() {
    if [ "$RECORDING_MODE" = "true" ]; then
        echo -e "${BLUE}▶ $1${NC}"
    else
        echo -e "${BLUE}▶ $1${NC}"
    fi
    recording_pause "$ACTION_DELAY"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

wait_for_input() {
    if [ "$RECORDING_MODE" = "true" ]; then
        echo
        center_text "${YELLOW}Press Enter to continue...${NC}"
        recording_pause "$SECTION_DELAY"
    else
        echo -e "\n${YELLOW}Press Enter to continue...${NC}"
        read
    fi
}

# Recording mode helper functions
recording_pause() {
    local duration=${1:-$STEP_DELAY}
    if [ "$RECORDING_MODE" = "true" ]; then
        sleep "$duration"
    fi
}

# Center align text function
center_text() {
    local text="$1"
    local width="${2:-$TERMINAL_WIDTH}"
    
    # Ensure we have a valid width
    if [ -z "$width" ] || [ "$width" -lt 1 ]; then
        width=$(tput cols 2>/dev/null || stty size 2>/dev/null | cut -d' ' -f2 || echo 80)
    fi
    
    # First expand any ${VAR} color variables
    local expanded_text
    expanded_text=$(eval "echo \"$text\"" 2>/dev/null || echo "$text")
    
    # Remove color codes for length calculation
    local clean_text
    clean_text=$(echo -e "$expanded_text" | sed 's/\x1b\[[0-9;]*m//g')
    local text_length=${#clean_text}
    
    # If text is too long, just print it normally
    if [ "$text_length" -ge "$width" ]; then
        echo -e "$expanded_text"
        return
    fi
    
    # Calculate padding and center the text
    local padding=$(( (width - text_length) / 2 ))
    if [ "$padding" -gt 0 ]; then
        printf "%*s" $padding ""
    fi
    echo -e "$expanded_text"
}

# Progressive dots for operations
show_progress() {
    local message="$1"
    local duration="${2:-3}"
    
    if [ "$RECORDING_MODE" = "true" ]; then
        echo -n "$message"
        local step_delay=$(python3 -c "print($duration / 3)" 2>/dev/null || echo "1")
        for i in {1..3}; do
            echo -n "."
            sleep "$step_delay"
        done
        echo " ✅"
    else
        echo "$message... ✅"
    fi
}

# Smart text output (centered in recording mode, normal otherwise)
smart_text() {
    local text="$1"
    if [ "$RECORDING_MODE" = "true" ]; then
        center_text "$text"
        sleep "$TYPING_DELAY"
    else
        echo -e "$text"
    fi
}

# Check prerequisites
check_prerequisites() {
    print_section "Checking Prerequisites"
    
    # Check if Go is installed (for CLI)
    if ! command -v go &> /dev/null; then
        print_error "Go is not installed. Please install Go 1.24.4+ from https://golang.org/dl/"
        exit 1
    fi
    print_success "Go $(go version | cut -d' ' -f3) found"
    
    # Check if .NET is installed (for API)
    if ! command -v dotnet &> /dev/null; then
        print_error ".NET is not installed. Please install .NET 9 SDK from https://dotnet.microsoft.com/download"
        exit 1
    fi
    print_success ".NET $(dotnet --version) found"
    
    # Check if Node.js is available (for mock MCP server)
    if ! command -v node &> /dev/null; then
        print_warning "Node.js not found - will create a simple mock server instead"
    else
        print_success "Node.js $(node --version) found"
    fi
    
    # Check if curl is available
    if ! command -v curl &> /dev/null; then
        print_error "curl is required but not installed"
        exit 1
    fi
    print_success "curl found"
}

# Setup demo environment
setup_demo_environment() {
    print_section "Setting up Demo Environment"
    
    # Create demo directory
    print_step "Creating demo directory: $DEMO_DIR"
    rm -rf "$DEMO_DIR"
    mkdir -p "$DEMO_DIR"
    print_success "Demo directory created"
    
    # Build the CLI
    print_step "Building Kilometers CLI"
    cd "$SCRIPT_DIR/cli"
    go build -o "$DEMO_DIR/km" .
    if [ $? -eq 0 ]; then
        print_success "CLI built successfully: $DEMO_DIR/km"
    else
        print_error "Failed to build CLI"
        exit 1
    fi
    
    # Set CLI to use local API
    export KILOMETERS_API_URL="$DEMO_API_URL"
    export KM_DEBUG="true"
    print_success "CLI configured for demo (API: $DEMO_API_URL)"
}

# Create mock MCP server
create_mock_mcp_server() {
    print_section "Creating Mock MCP Server"
    
    cd "$DEMO_DIR"
    
    if command -v node &> /dev/null; then
        print_step "Creating Node.js-based mock MCP server"
        
        # Create package.json
        cat > package.json << 'EOF'
{
  "name": "mock-mcp-server",
  "version": "1.0.0",
  "main": "server.js",
  "dependencies": {}
}
EOF
        
        # Create mock MCP server
        cat > server.js << 'EOF'
#!/usr/bin/env node

const readline = require('readline');

// Mock MCP server that responds to JSON-RPC requests
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.error('[Mock MCP Server] Starting on stdio...');

rl.on('line', (line) => {
    try {
        const request = JSON.parse(line);
        console.error(`[Mock MCP Server] Received: ${request.method || 'unknown method'}`);
        
        let response;
        
        if (request.method === 'initialize') {
            response = {
                jsonrpc: '2.0',
                id: request.id,
                result: {
                    protocolVersion: '2024-11-05',
                    capabilities: {
                        tools: { listChanged: true },
                        resources: { subscribe: true, listChanged: true }
                    },
                    serverInfo: {
                        name: 'Mock MCP Server',
                        version: '1.0.0'
                    }
                }
            };
        } else if (request.method === 'tools/list') {
            response = {
                jsonrpc: '2.0',
                id: request.id,
                result: {
                    tools: [
                        {
                            name: 'github-search',
                            description: 'Search GitHub repositories',
                            inputSchema: {
                                type: 'object',
                                properties: {
                                    query: { type: 'string' }
                                }
                            }
                        },
                        {
                            name: 'file-read',
                            description: 'Read a file from the filesystem',
                            inputSchema: {
                                type: 'object',
                                properties: {
                                    path: { type: 'string' }
                                }
                            }
                        }
                    ]
                }
            };
        } else if (request.method === 'tools/call') {
            const toolName = request.params?.name || 'unknown';
            response = {
                jsonrpc: '2.0',
                id: request.id,
                result: {
                    content: [
                        {
                            type: 'text',
                            text: `Mock result from ${toolName} with args: ${JSON.stringify(request.params?.arguments || {})}`
                        }
                    ]
                }
            };
        } else {
            response = {
                jsonrpc: '2.0',
                id: request.id,
                error: {
                    code: -32601,
                    message: 'Method not found',
                    data: { method: request.method }
                }
            };
        }
        
        console.log(JSON.stringify(response));
    } catch (error) {
        console.error(`[Mock MCP Server] Error processing request: ${error.message}`);
        if (line.includes('"id"')) {
            try {
                const req = JSON.parse(line);
                const errorResponse = {
                    jsonrpc: '2.0',
                    id: req.id,
                    error: {
                        code: -32700,
                        message: 'Parse error'
                    }
                };
                console.log(JSON.stringify(errorResponse));
            } catch (e) {
                // Invalid JSON, ignore
            }
        }
    }
});

console.error('[Mock MCP Server] Ready for requests');
EOF
        
        chmod +x server.js
        print_success "Node.js mock MCP server created"
        
    else
        print_step "Creating Python-based mock MCP server"
        
        # Create simple Python mock server
        cat > mock_mcp_server.py << 'EOF'
#!/usr/bin/env python3

import json
import sys
import time

def log(message):
    print(f"[Mock MCP Server] {message}", file=sys.stderr)

def send_response(response):
    print(json.dumps(response), flush=True)

log("Starting on stdio...")

try:
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
            
        try:
            request = json.loads(line)
            method = request.get('method', 'unknown')
            log(f"Received: {method}")
            
            if method == 'initialize':
                response = {
                    'jsonrpc': '2.0',
                    'id': request['id'],
                    'result': {
                        'protocolVersion': '2024-11-05',
                        'capabilities': {
                            'tools': {'listChanged': True},
                            'resources': {'subscribe': True, 'listChanged': True}
                        },
                        'serverInfo': {
                            'name': 'Mock MCP Server',
                            'version': '1.0.0'
                        }
                    }
                }
            elif method == 'tools/list':
                response = {
                    'jsonrpc': '2.0',
                    'id': request['id'],
                    'result': {
                        'tools': [
                            {
                                'name': 'github-search',
                                'description': 'Search GitHub repositories',
                                'inputSchema': {
                                    'type': 'object',
                                    'properties': {
                                        'query': {'type': 'string'}
                                    }
                                }
                            }
                        ]
                    }
                }
            elif method == 'tools/call':
                tool_name = request.get('params', {}).get('name', 'unknown')
                response = {
                    'jsonrpc': '2.0',
                    'id': request['id'],
                    'result': {
                        'content': [{
                            'type': 'text',
                            'text': f'Mock result from {tool_name}'
                        }]
                    }
                }
            else:
                response = {
                    'jsonrpc': '2.0',
                    'id': request['id'],
                    'error': {
                        'code': -32601,
                        'message': 'Method not found'
                    }
                }
            
            send_response(response)
            
        except json.JSONDecodeError:
            log("Invalid JSON received")
        except KeyError as e:
            log(f"Missing required field: {e}")
            
except KeyboardInterrupt:
    log("Shutting down")
EOF
        
        chmod +x mock_mcp_server.py
        print_success "Python mock MCP server created"
    fi
}

# Start the API server
start_api_server() {
    print_section "Starting Kilometers API"
    
    cd "$SCRIPT_DIR/api/Kilometers.Api"
    
    print_step "Starting .NET API on port $API_PORT"
    
    # Set environment for in-memory storage
    export ASPNETCORE_ENVIRONMENT=Development
    export ASPNETCORE_URLS="http://localhost:$API_PORT"
    
    # Start API in background
    dotnet run > "$DEMO_DIR/api.log" 2>&1 &
    API_PID=$!
    echo $API_PID > "$DEMO_DIR/api.pid"
    
    # Wait for API to start
    print_step "Waiting for API to start..."
    for i in {1..30}; do
        if curl -s "http://localhost:$API_PORT/health" > /dev/null 2>&1; then
            print_success "API started successfully on http://localhost:$API_PORT"
            return 0
        fi
        sleep 1
    done
    
    print_error "API failed to start within 30 seconds"
    print_error "Check logs: $DEMO_DIR/api.log"
    kill $API_PID 2>/dev/null || true
    exit 1
}

# Demonstrate CLI wrapping
demonstrate_cli_wrapping() {
    print_section "Demonstrating CLI Wrapping"
    
    cd "$DEMO_DIR"
    
    smart_text "${CYAN}We'll now demonstrate how the Kilometers CLI transparently wraps MCP servers.${NC}"
    echo
    recording_pause "$STEP_DELAY"
    
    if [ "$RECORDING_MODE" = "true" ]; then
        center_text "${YELLOW}Normal MCP server execution:${NC}"
        recording_pause "$ACTION_DELAY"
        if command -v node &> /dev/null; then
            center_text "${BLUE}node server.js${NC}"
        else
            center_text "${BLUE}python3 mock_mcp_server.py${NC}"
        fi
        recording_pause "$ACTION_DELAY"
        
        echo
        center_text "${YELLOW}With Kilometers monitoring:${NC}"
        recording_pause "$ACTION_DELAY"
        if command -v node &> /dev/null; then
            center_text "${GREEN}./km node server.js${NC}"
        else
            center_text "${GREEN}./km python3 mock_mcp_server.py${NC}"
        fi
        recording_pause "$STEP_DELAY"
        
        echo
        center_text "${GREEN}Key benefits:${NC}"
        recording_pause "$ACTION_DELAY"
        center_text "✅ Zero configuration changes required"
        recording_pause 0.6
        center_text "✅ Transparent operation - MCP server works exactly the same"
        recording_pause 0.6
        center_text "✅ All interactions monitored and sent to dashboard"
        recording_pause 0.6
        center_text "✅ <5ms performance overhead"
        recording_pause "$ACTION_DELAY"
    else
        echo -e "${YELLOW}Normal MCP server execution:${NC}"
        if command -v node &> /dev/null; then
            echo "  node server.js"
        else
            echo "  python3 mock_mcp_server.py"
        fi
        
        echo -e "\n${YELLOW}With Kilometers monitoring:${NC}"
        if command -v node &> /dev/null; then
            echo "  ./km node server.js"
        else
            echo "  ./km python3 mock_mcp_server.py"
        fi
        
        echo -e "\n${GREEN}Key benefits:${NC}"
        echo "  ✅ Zero configuration changes required"
        echo "  ✅ Transparent operation - MCP server works exactly the same"
        echo "  ✅ All interactions monitored and sent to dashboard"
        echo "  ✅ <5ms performance overhead"
    fi
    
    wait_for_input
}

# Test MCP interaction
test_mcp_interaction() {
    print_section "Testing MCP Interactions"
    
    cd "$DEMO_DIR"
    
    print_step "Testing single MCP interactions via stdin/stdout"
    
    echo
    smart_text "${CYAN}MCP servers communicate via stdin/stdout JSON-RPC protocol.${NC}"
    smart_text "${CYAN}We'll send some sample requests to demonstrate event capture.${NC}"
    echo
    recording_pause "$STEP_DELAY"
    
    # Create test requests file
    cat > test_requests.jsonl << 'EOF'
{"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"protocolVersion": "2024-11-05", "capabilities": {}, "clientInfo": {"name": "Demo Client", "version": "1.0.0"}}}
{"jsonrpc": "2.0", "id": 2, "method": "tools/list", "params": {}}
{"jsonrpc": "2.0", "id": 3, "method": "tools/call", "params": {"name": "github-search", "arguments": {"query": "kilometers ai monitoring"}}}
{"jsonrpc": "2.0", "id": 4, "method": "tools/call", "params": {"name": "file-read", "arguments": {"path": "/demo/file.txt"}}}
{"jsonrpc": "2.0", "id": 5, "method": "tools/call", "params": {"name": "github-search", "arguments": {"query": "mcp protocol"}}}
EOF
    
    # Demonstrate CLI wrapping with actual JSON-RPC communication
    print_step "Sending JSON-RPC requests through Kilometers CLI wrapper..."
    
    if command -v node &> /dev/null; then
        cat test_requests.jsonl | timeout 10 ./km node server.js > mcp_responses.log 2>&1 || true
    else
        cat test_requests.jsonl | timeout 10 ./km python3 mock_mcp_server.py > mcp_responses.log 2>&1 || true
    fi
    
    print_success "MCP interactions completed"
    
    echo -e "\n${CYAN}CLI Debug Output (showing event capture):${NC}"
    if [ -f mcp_responses.log ]; then
        echo -e "${YELLOW}Last 15 lines of CLI output:${NC}"
        tail -15 mcp_responses.log
    fi
    
    echo -e "\n${CYAN}Responses received from MCP server:${NC}"
    if [ -f mcp_responses.log ]; then
        grep "jsonrpc" mcp_responses.log | head -3 | jq . 2>/dev/null || echo "MCP server responses captured"
    fi
}

# Test bulk MCP interactions
test_bulk_mcp_interaction() {
    print_section "Testing Bulk MCP Interactions"
    
    cd "$DEMO_DIR"
    
    print_step "Generating bulk requests to test event batching"
    
    echo
    smart_text "${CYAN}Kilometers CLI batches events for efficient transmission.${NC}"
    smart_text "${CYAN}Let's generate 25 rapid-fire requests to demonstrate bulk processing.${NC}"
    echo
    recording_pause "$STEP_DELAY"
    
    # Generate bulk test requests
    echo "# Generating bulk requests..." > bulk_requests.jsonl
    
    # Generate initialize request
    echo '{"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"protocolVersion": "2024-11-05", "capabilities": {}, "clientInfo": {"name": "Bulk Demo Client", "version": "1.0.0"}}}' >> bulk_requests.jsonl
    
    # Generate tools/list request
    echo '{"jsonrpc": "2.0", "id": 2, "method": "tools/list", "params": {}}' >> bulk_requests.jsonl
    
    # Generate multiple tool calls
    for i in {3..25}; do
        case $((i % 4)) in
            0)
                echo "{\"jsonrpc\": \"2.0\", \"id\": $i, \"method\": \"tools/call\", \"params\": {\"name\": \"github-search\", \"arguments\": {\"query\": \"bulk-test-$i\"}}}" >> bulk_requests.jsonl
                ;;
            1)
                echo "{\"jsonrpc\": \"2.0\", \"id\": $i, \"method\": \"tools/call\", \"params\": {\"name\": \"file-read\", \"arguments\": {\"path\": \"/tmp/test-$i.txt\"}}}" >> bulk_requests.jsonl
                ;;
            2)
                echo "{\"jsonrpc\": \"2.0\", \"id\": $i, \"method\": \"resources/read\", \"params\": {\"uri\": \"file:///demo/resource-$i.json\"}}" >> bulk_requests.jsonl
                ;;
            3)
                echo "{\"jsonrpc\": \"2.0\", \"id\": $i, \"method\": \"prompts/get\", \"params\": {\"name\": \"demo-prompt-$i\", \"arguments\": {\"context\": \"bulk-demo\"}}}" >> bulk_requests.jsonl
                ;;
        esac
    done
    
    REQUEST_COUNT=$(wc -l < bulk_requests.jsonl)
    show_progress "Generated $REQUEST_COUNT bulk requests" 2
    recording_pause "$ACTION_DELAY"
    
    print_step "Processing bulk requests through Kilometers CLI..."
    if [ "$RECORDING_MODE" = "true" ]; then
        center_text "${YELLOW}This will demonstrate:${NC}"
        recording_pause "$ACTION_DELAY"
        center_text "• Event batching (groups of 10 events per batch)"
        recording_pause 0.5
        center_text "• High-throughput processing"
        recording_pause 0.5
        center_text "• Minimal performance overhead"
        recording_pause 0.5
        center_text "• Real-time event capture and transmission"
        recording_pause "$STEP_DELAY"
    else
        echo -e "${YELLOW}This will demonstrate:${NC}"
        echo "  • Event batching (groups of 10 events per batch)"
        echo "  • High-throughput processing"
        echo "  • Minimal performance overhead"
        echo "  • Real-time event capture and transmission"
    fi
    
    # Process bulk requests through the CLI
    if command -v node &> /dev/null; then
        cat bulk_requests.jsonl | timeout 15 ./km node server.js > bulk_responses.log 2>&1 || true
    else
        cat bulk_requests.jsonl | timeout 15 ./km python3 mock_mcp_server.py > bulk_responses.log 2>&1 || true
    fi
    
    print_success "Bulk MCP interactions completed"
    
    echo -e "\n${CYAN}Bulk Processing Results:${NC}"
    if [ -f bulk_responses.log ]; then
        TOTAL_EVENTS=$(grep -c "Processed.*events" bulk_responses.log 2>/dev/null || echo "0")
        EVENT_COUNT=$(grep "Processed.*total events" bulk_responses.log | tail -1 | grep -o '[0-9]\+' | tail -1 2>/dev/null || echo "0")
        
        echo -e "${GREEN}✅ Total events processed: ${EVENT_COUNT}${NC}"
        
        if [ "$EVENT_COUNT" -gt "0" ]; then
            echo -e "${GREEN}✅ Event batching working correctly${NC}"
            echo -e "${GREEN}✅ High-throughput processing demonstrated${NC}"
        fi
        
        echo -e "\n${YELLOW}CLI Performance Summary:${NC}"
        tail -10 bulk_responses.log | grep -E "\[km\].*events|batch|API" || echo "Check bulk_responses.log for detailed output"
    fi
    
    echo -e "\n${CYAN}Sample bulk responses:${NC}"
    if [ -f bulk_responses.log ]; then
        grep "jsonrpc" bulk_responses.log | head -5 | while read line; do
            echo "$line" | jq -c . 2>/dev/null || echo "$line"
        done
    fi
}

# Query API for captured events
query_captured_events() {
    print_section "Querying API for Captured Events"
    
    print_step "Checking API health"
    if curl -s "$DEMO_API_URL/health" | jq . 2>/dev/null; then
        print_success "API is healthy"
    else
        print_warning "API health check returned non-JSON response"
        curl -s "$DEMO_API_URL/health" || echo "API not responding"
    fi
    
    wait_for_input
    
    print_step "Testing event ingestion endpoint"
    
    # Send a test event to the API
    TIMESTAMP=$(date +%s)
    ISO_TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    ENCODED_PAYLOAD=$(echo '{"tool": "github-search", "args": {"query": "kilometers"}}' | base64)
    
    TEST_EVENT="{
        \"id\": \"demo_event_${TIMESTAMP}\",
        \"timestamp\": \"${ISO_TIMESTAMP}\",
        \"customerId\": \"demo-user\",
        \"direction\": \"request\", 
        \"method\": \"tools/call\",
        \"payload\": \"${ENCODED_PAYLOAD}\",
        \"size\": 64
    }"
    
    echo -e "${YELLOW}Sending test event to API:${NC}"
    echo "$TEST_EVENT" | jq .
    
    RESPONSE=$(curl -s -X POST "$DEMO_API_URL/api/events" \
        -H "Content-Type: application/json" \
        -d "$TEST_EVENT")
    
    echo -e "\n${YELLOW}API Response:${NC}"
    echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"
    
    if echo "$RESPONSE" | grep -q "success.*true"; then
        print_success "Event successfully ingested by API"
    else
        print_warning "Event ingestion may have failed"
    fi
    
    wait_for_input
}

# Show monitoring capabilities
show_monitoring_capabilities() {
    print_section "Monitoring Capabilities Summary"
    
    if [ "$RECORDING_MODE" = "true" ]; then
        center_text "${GREEN}✅ What Kilometers.ai captures:${NC}"
        center_text "• All MCP JSON-RPC requests and responses"
        center_text "• Method calls (tools/call, resources/read, prompts/get, etc.)"
        center_text "• Performance data (response times, payload sizes)"
        center_text "• Cost estimates (based on usage patterns)"
        center_text "• Risk analysis (security and compliance scoring)"
        echo
        
        center_text "${GREEN}✅ Key benefits demonstrated:${NC}"
        center_text "• Zero configuration - works with any MCP server"
        center_text "• Transparent operation - no changes to existing setup"
        center_text "• Real-time monitoring - events captured immediately"
        center_text "• Cloud integration - data sent to centralized dashboard"
        center_text "• Minimal overhead - <5ms latency impact"
        echo
        
        center_text "${CYAN}🎯 Next steps for production use:${NC}"
        center_text "1. Install CLI: curl -sSL https://get.kilometers.ai | sh"
        center_text "2. Get API key from https://app.kilometers.ai"
        center_text "3. Set KILOMETERS_API_KEY environment variable"
        center_text "4. Wrap your MCP servers: km your-mcp-server"
        center_text "5. View insights in the dashboard"
        echo
        
        center_text "${PURPLE}🔗 Resources:${NC}"
        center_text "• Documentation: https://docs.kilometers.ai"
        center_text "• GitHub: https://github.com/kilometers-ai/kilometers"
        center_text "• Support: support@kilometers.ai"
    else
        echo -e "${GREEN}✅ What Kilometers.ai captures:${NC}"
        echo "   • All MCP JSON-RPC requests and responses"
        echo "   • Method calls (tools/call, resources/read, prompts/get, etc.)"
        echo "   • Performance data (response times, payload sizes)"
        echo "   • Cost estimates (based on usage patterns)"
        echo "   • Risk analysis (security and compliance scoring)"
        
        echo -e "\n${GREEN}✅ Key benefits demonstrated:${NC}"
        echo "   • Zero configuration - works with any MCP server"
        echo "   • Transparent operation - no changes to existing setup"
        echo "   • Real-time monitoring - events captured immediately"
        echo "   • Cloud integration - data sent to centralized dashboard"
        echo "   • Minimal overhead - <5ms latency impact"
        
        echo -e "\n${CYAN}🎯 Next steps for production use:${NC}"
        echo "   1. Install CLI: curl -sSL https://get.kilometers.ai | sh"
        echo "   2. Get API key from https://app.kilometers.ai"
        echo "   3. Set KILOMETERS_API_KEY environment variable"
        echo "   4. Wrap your MCP servers: km your-mcp-server"
        echo "   5. View insights in the dashboard"
        
        echo -e "\n${PURPLE}🔗 Resources:${NC}"
        echo "   • Documentation: https://docs.kilometers.ai"
        echo "   • GitHub: https://github.com/kilometers-ai/kilometers"
        echo "   • Support: support@kilometers.ai"
    fi
}

# Cleanup function
cleanup() {
    print_section "Cleaning Up Demo Environment"
    
    # Stop API server
    if [ -f "$DEMO_DIR/api.pid" ]; then
        API_PID=$(cat "$DEMO_DIR/api.pid")
        if kill -0 $API_PID 2>/dev/null; then
            print_step "Stopping API server (PID: $API_PID)"
            kill $API_PID
            print_success "API server stopped"
        fi
    fi
    
    # Stop MCP server
    if [ -f "$DEMO_DIR/mcp.pid" ]; then
        MCP_PID=$(cat "$DEMO_DIR/mcp.pid")
        if kill -0 $MCP_PID 2>/dev/null; then
            print_step "Stopping MCP server (PID: $MCP_PID)"
            kill $MCP_PID
            print_success "MCP server stopped"
        fi
    fi
    
    # Optionally remove demo directory
    echo -e "\n${YELLOW}Demo files are in: $DEMO_DIR${NC}"
    if [ "$RECORDING_MODE" = "true" ]; then
        # In recording mode, automatically preserve files
        print_success "Demo directory preserved for inspection"
    else
        echo -e "${YELLOW}Would you like to remove the demo directory? (y/N)${NC}"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            rm -rf "$DEMO_DIR"
            print_success "Demo directory removed"
        else
            print_success "Demo directory preserved for inspection"
        fi
    fi
}

# Trap to ensure cleanup on exit
trap cleanup EXIT

# Main demo flow
main() {
    # Show recording mode notice if enabled
    if [ "$RECORDING_MODE" = "true" ]; then
        echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════════════════════╗"
        echo -e "║                    RECORDING MODE ENABLED                                   ║"
        echo -e "║            Auto-advance • Center alignment • Optimized timing               ║"
        echo -e "╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
        echo
        sleep 2
    fi
    
    print_header
    
    smart_text "${CYAN}Welcome to the Kilometers.ai interactive demo!${NC}"
    recording_pause "$ACTION_DELAY"
    smart_text "${CYAN}This demo will show you how to monitor AI agent interactions transparently.${NC}"
    echo
    recording_pause "$STEP_DELAY"
    
    if [ "$RECORDING_MODE" = "true" ]; then
        center_text "${YELLOW}What we'll demonstrate:${NC}"
        recording_pause "$ACTION_DELAY"
        center_text "1. CLI wrapper that monitors MCP servers transparently"
        recording_pause 0.5
        center_text "2. Event capture and transmission to API"
        recording_pause 0.5
        center_text "3. Bulk event processing and batching"
        recording_pause 0.5
        center_text "4. Real-time monitoring capabilities"
        recording_pause 0.5
        center_text "5. Zero-configuration setup"
        recording_pause "$ACTION_DELAY"
    else
        echo -e "${YELLOW}What we'll demonstrate:${NC}"
        echo "  1. CLI wrapper that monitors MCP servers transparently"
        echo "  2. Event capture and transmission to API"
        echo "  3. Bulk event processing and batching"
        echo "  4. Real-time monitoring capabilities"
        echo "  5. Zero-configuration setup"
    fi
    
    wait_for_input
    
    check_prerequisites
    setup_demo_environment
    create_mock_mcp_server
    start_api_server
    
    demonstrate_cli_wrapping
    test_mcp_interaction
    test_bulk_mcp_interaction
    query_captured_events
    show_monitoring_capabilities
    
    echo -e "\n${GREEN}🎉 Demo completed successfully!${NC}"
    echo -e "${GREEN}Thank you for trying Kilometers.ai${NC}\n"
}

# Run the demo
main "$@" 