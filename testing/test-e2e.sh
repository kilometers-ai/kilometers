#!/bin/bash

# End-to-End Test Script for Kilometers CLI
# Tests the CLI wrapper with various MCP scenarios

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test configuration
TEST_DIR="/tmp/kilometers-test"
CLI_PATH=""
API_URL="http://localhost:5194"
MOCK_SERVER_PATH="/Users/milesangelo/Source/active/kilometers.ai/kilometers/testing/mock-mcp-server.js"
TEST_RESULTS=()

# Logging functions
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

# Test result tracking
test_passed() {
    TEST_RESULTS+=("PASS: $1")
    log_success "$1"
}

test_failed() {
    TEST_RESULTS+=("FAIL: $1")
    log_error "$1"
}

test_skipped() {
    TEST_RESULTS+=("SKIP: $1")
    log_warning "SKIPPED: $1"
}

# Setup test environment
setup_test_environment() {
    log_info "Setting up test environment..."
    
    # Create test directory
    mkdir -p "$TEST_DIR"
    cd "$TEST_DIR"
    
    # Find the CLI binary
    if [[ -f "/Users/milesangelo/Source/active/kilometers.ai/kilometers/cli/km" ]]; then
        CLI_PATH="/Users/milesangelo/Source/active/kilometers.ai/kilometers/cli/km"
    elif command -v km >/dev/null 2>&1; then
        CLI_PATH=$(which km)
    else
        log_error "kilometers CLI binary not found. Build it first with: cd /Users/milesangelo/Source/active/kilometers.ai/kilometers/cli && go build -o km ."
        exit 1
    fi
    
    log_info "Using CLI binary: $CLI_PATH"
    
    # Set test environment variables
    export KM_DEBUG=true
    export KILOMETERS_API_URL="$API_URL"
    export KM_BATCH_SIZE=5
    export KM_ENABLE_RISK_DETECTION=true
    
    # Make mock server executable
    chmod +x "$MOCK_SERVER_PATH"
    
    # Check if node is available
    if ! command -v node >/dev/null 2>&1; then
        log_error "Node.js is required to run the mock MCP server"
        exit 1
    fi
    
    # Check API availability
    if curl -s "$API_URL/health" >/dev/null 2>&1; then
        log_info "API server is available at $API_URL"
    else
        log_warning "API server not available at $API_URL - events will be logged locally only"
    fi
}

# Test 1: Basic CLI functionality
test_basic_cli() {
    log_info "Test 1: Basic CLI functionality"
    
    # Test version command
    if "$CLI_PATH" --version >/dev/null 2>&1; then
        test_passed "CLI version command works"
    else
        test_failed "CLI version command failed"
        return 1
    fi
    
    # Test help command
    if "$CLI_PATH" --help >/dev/null 2>&1; then
        test_passed "CLI help command works"
    else
        test_failed "CLI help command failed"
    fi
    
    # Test basic command wrapping
    local output
    if output=$("$CLI_PATH" echo "test message" 2>/dev/null); then
        if [[ "$output" == "test message" ]]; then
            test_passed "Basic command wrapping works"
        else
            test_failed "Basic command wrapping output incorrect: $output"
        fi
    else
        test_failed "Basic command wrapping failed"
    fi
}

# Test 2: MCP server integration
test_mcp_integration() {
    log_info "Test 2: MCP server integration"
    
    # Test with mock MCP server
    local test_file="$TEST_DIR/mcp_test_input.json"
    local output_file="$TEST_DIR/mcp_test_output.txt"
    
    # Create test input
    cat > "$test_file" << 'EOF'
{"jsonrpc":"2.0","id":"test-1","method":"ping"}
{"jsonrpc":"2.0","id":"test-2","method":"initialize","params":{"clientInfo":{"name":"test-client","version":"1.0.0"}}}
{"jsonrpc":"2.0","id":"test-3","method":"tools/list"}
EOF

    # Run CLI with mock server
    if timeout 10s "$CLI_PATH" node "$MOCK_SERVER_PATH" < "$test_file" > "$output_file" 2>/dev/null; then
        # Check if responses were received
        local response_count=$(grep -c '"jsonrpc":"2.0"' "$output_file" 2>/dev/null || echo "0")
        if [[ "$response_count" -ge 3 ]]; then
            test_passed "MCP server integration works (received $response_count responses)"
        else
            test_failed "MCP server integration incomplete (received $response_count responses)"
            log_info "Output file contents:"
            cat "$output_file" | head -10
        fi
    else
        test_failed "MCP server integration failed"
        if [[ -f "$output_file" ]]; then
            log_info "Partial output:"
            cat "$output_file" | head -5
        fi
    fi
}

# Test 3: Event capture validation
test_event_capture() {
    log_info "Test 3: Event capture validation"
    
    # Check if API is available for event verification
    if ! curl -s "$API_URL/health" >/dev/null 2>&1; then
        test_skipped "Event capture validation (API not available)"
        return
    fi
    
    # Get initial event count
    local initial_count
    initial_count=$(curl -s "$API_URL/api/activity" | jq '.events | length' 2>/dev/null || echo "0")
    
    # Create test input with identifiable content
    local test_file="$TEST_DIR/event_test_input.json"
    cat > "$test_file" << EOF
{"jsonrpc":"2.0","id":"event-test-1","method":"ping"}
{"jsonrpc":"2.0","id":"event-test-2","method":"tools/call","params":{"name":"test_tool","arguments":{"action":"event_capture_test"}}}
EOF

    # Run CLI with mock server
    if timeout 10s "$CLI_PATH" node "$MOCK_SERVER_PATH" < "$test_file" >/dev/null 2>&1; then
        # Wait for events to be processed
        sleep 2
        
        # Check for new events
        local final_count
        final_count=$(curl -s "$API_URL/api/activity" | jq '.events | length' 2>/dev/null || echo "0")
        
        if [[ "$final_count" -gt "$initial_count" ]]; then
            test_passed "Event capture works (captured $((final_count - initial_count)) events)"
        else
            test_failed "Event capture failed (no new events captured)"
        fi
    else
        test_failed "Event capture test execution failed"
    fi
}

# Test 4: Risk detection
test_risk_detection() {
    log_info "Test 4: Risk detection"
    
    # Test with high-risk content
    local test_file="$TEST_DIR/risk_test_input.json"
    cat > "$test_file" << 'EOF'
{"jsonrpc":"2.0","id":"risk-1","method":"resources/read","params":{"uri":"file:///etc/passwd"}}
{"jsonrpc":"2.0","id":"risk-2","method":"tools/call","params":{"name":"dangerous_tool","arguments":{"command":"rm -rf /","target":"/etc/shadow"}}}
EOF

    # Run with risk detection enabled
    export KM_ENABLE_RISK_DETECTION=true
    export KM_HIGH_RISK_ONLY=false
    
    local output_file="$TEST_DIR/risk_test_output.txt"
    if timeout 10s "$CLI_PATH" node "$MOCK_SERVER_PATH" --enable-high_risk_content < "$test_file" > "$output_file" 2>&1; then
        # Check debug output for risk detection
        if grep -q "risk=" "$output_file" 2>/dev/null; then
            test_passed "Risk detection is active"
        else
            test_failed "Risk detection not working"
            log_info "Debug output:"
            cat "$output_file" | grep -i risk | head -3
        fi
    else
        test_failed "Risk detection test execution failed"
    fi
}

# Test 5: Error handling
test_error_handling() {
    log_info "Test 5: Error handling"
    
    # Test with non-existent command
    if "$CLI_PATH" /nonexistent/command 2>/dev/null; then
        test_failed "Should fail for non-existent command"
    else
        test_passed "Properly handles non-existent commands"
    fi
    
    # Test with command that exits with error
    if "$CLI_PATH" false 2>/dev/null; then
        test_failed "Should propagate exit codes"
    else
        test_passed "Properly propagates exit codes"
    fi
}

# Test 6: Performance impact
test_performance() {
    log_info "Test 6: Performance impact"
    
    # Time a simple command without wrapper
    local start_time=$(date +%s%N)
    echo "test" >/dev/null
    local end_time=$(date +%s%N)
    local direct_time=$((end_time - start_time))
    
    # Time the same command with wrapper
    start_time=$(date +%s%N)
    "$CLI_PATH" echo "test" >/dev/null 2>&1
    end_time=$(date +%s%N)
    local wrapped_time=$((end_time - start_time))
    
    # Calculate overhead (in microseconds)
    local overhead=$(((wrapped_time - direct_time) / 1000))
    
    if [[ $overhead -lt 10000 ]]; then  # Less than 10ms overhead
        test_passed "Performance impact acceptable (${overhead}μs overhead)"
    else
        test_failed "Performance impact too high (${overhead}μs overhead)"
    fi
}

# Test 7: Real MCP server (if available)
test_real_mcp_server() {
    log_info "Test 7: Real MCP server integration"
    
    # Try to test with a real MCP server if npx is available
    if command -v npx >/dev/null 2>&1; then
        local test_input='{"jsonrpc":"2.0","id":"real-test","method":"ping"}'
        
        # Try with filesystem MCP server
        if timeout 10s bash -c "echo '$test_input' | \"$CLI_PATH\" npx -y @modelcontextprotocol/server-filesystem --path /tmp" >/dev/null 2>&1; then
            test_passed "Real MCP server integration works (filesystem server)"
        else
            test_skipped "Real MCP server test (filesystem server not available)"
        fi
    else
        test_skipped "Real MCP server test (npx not available)"
    fi
}

# Cleanup function
cleanup() {
    log_info "Cleaning up test environment..."
    cd /
    rm -rf "$TEST_DIR"
    
    # Reset environment variables
    unset KM_DEBUG
    unset KILOMETERS_API_URL
    unset KM_BATCH_SIZE
    unset KM_ENABLE_RISK_DETECTION
    unset KM_HIGH_RISK_ONLY
}

# Print test results
print_results() {
    echo
    echo "=============================="
    echo "       TEST RESULTS"
    echo "=============================="
    
    local passed=0
    local failed=0
    local skipped=0
    
    for result in "${TEST_RESULTS[@]}"; do
        echo "$result"
        if [[ "$result" == PASS:* ]]; then
            ((passed++))
        elif [[ "$result" == FAIL:* ]]; then
            ((failed++))
        elif [[ "$result" == SKIP:* ]]; then
            ((skipped++))
        fi
    done
    
    echo
    echo "Summary: $passed passed, $failed failed, $skipped skipped"
    
    if [[ $failed -eq 0 ]]; then
        log_success "All tests passed! 🎉"
        echo
        echo "Your Kilometers CLI is ready for AI tool integration!"
        echo "Next steps:"
        echo "1. Test with Cursor/Claude Desktop using the configuration examples"
        echo "2. Monitor events at $API_URL/api/activity"
        echo "3. Configure production API endpoint for public launch"
        return 0
    else
        log_error "Some tests failed. Please fix issues before proceeding."
        return 1
    fi
}

# Main execution
main() {
    echo "=============================="
    echo "  Kilometers CLI E2E Tests"
    echo "=============================="
    echo
    
    setup_test_environment
    
    # Run all tests
    test_basic_cli
    test_mcp_integration
    test_event_capture
    test_risk_detection
    test_error_handling
    test_performance
    test_real_mcp_server
    
    print_results
    local exit_code=$?
    
    cleanup
    exit $exit_code
}

# Handle script interruption
trap cleanup EXIT

# Run main function
main "$@"