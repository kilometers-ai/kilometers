# Kilometers CLI Testing Suite

This directory contains a comprehensive testing suite for the Kilometers CLI wrapper, including end-to-end tests, mock servers, and AI tool integration guides.

## 🚀 Quick Start

```bash
# 1. Run setup (one time)
chmod +x testing/setup.sh
./testing/setup.sh

# 2. Run all tests
./run-tests.sh

# 3. If tests pass, test with real AI tools
# Follow: testing/AI-TOOL-INTEGRATION-GUIDE.md
```

## 📁 Files in this Directory

### Core Testing Files
- **`setup.sh`** - One-time setup script that prepares everything for testing
- **`test-e2e.sh`** - Comprehensive end-to-end test suite (7 test categories)
- **`mock-mcp-server.js`** - Controllable mock MCP server for testing scenarios

### Documentation
- **`AI-TOOL-INTEGRATION-GUIDE.md`** - Step-by-step guide for testing with Cursor, Claude Desktop, etc.
- **`DOCKER-MCP-GUIDE.md`** - Comprehensive Docker MCP server testing guide
- **`README.md`** - This file

### Generated Helper Scripts (created by setup.sh)
- **`../run-tests.sh`** - Quick test runner
- **`../debug-cli.sh`** - CLI with debug output enabled
- **`test-docker-mcp.sh`** - Docker MCP server testing
- **`make-docker-tests-executable.sh`** - Helper to make Docker tests executable

## 🧪 Test Categories

The E2E test suite covers these areas:

1. **Basic CLI Functionality** - version, help, command wrapping
2. **MCP Server Integration** - JSON-RPC protocol passthrough
3. **Event Capture Validation** - API integration and event logging
4. **Risk Detection** - Security analysis features
5. **Error Handling** - Exit codes, non-existent commands
6. **Performance Impact** - Overhead measurement (<10ms target)
7. **Real MCP Server Integration** - Live server testing

## 🎯 Mock MCP Server Features

The mock server (`mock-mcp-server.js`) supports these test scenarios:

- **Normal Operation** - Standard MCP responses
- **Slow Responses** - Simulate network delays
- **High Risk Content** - Security testing with dangerous patterns
- **Large Payloads** - Performance testing with big responses
- **Random Errors** - Error handling validation
- **Simulate Crash** - Recovery testing

Enable scenarios with command line flags:
```bash
node mock-mcp-server.js --enable-high_risk_content --enable-large_payloads
```

## 🔧 Prerequisites

- **Go 1.24.4+** - To build the CLI
- **Node.js** - To run the mock MCP server
- **.NET 9** - For API integration tests (optional)
- **curl** - For API health checks
- **jq** - For JSON processing (optional but recommended)

## 📊 Understanding Test Results

### ✅ All Tests Pass
Your CLI is ready for AI tool integration! Proceed to test with real tools.

### ❌ Some Tests Fail
Common issues and solutions:

**CLI Build Failures**:
```bash
cd /Users/milesangelo/Source/active/kilometers.ai/kilometers/cli
go mod tidy
go build -o km .
```

**MCP Integration Failures**:
- Check that Node.js is installed
- Verify mock server is executable
- Test with `./debug-cli.sh node testing/mock-mcp-server.js`

**Event Capture Failures**:
- Ensure API server is running: `cd api/Kilometers.Api && dotnet run`
- Check API health: `curl http://localhost:5194/health`

**Performance Failures**:
- May indicate system load or inefficient implementation
- Check debug output for bottlenecks

## 🔍 Debug Mode

Enable detailed logging for troubleshooting:

```bash
export KM_DEBUG=true
export KILOMETERS_API_URL=http://localhost:5194
./cli/km your-command-here
```

Or use the helper script:
```bash
./debug-cli.sh your-command-here
```

## 🐳 Docker MCP Testing

Test your CLI with containerized MCP servers for enhanced security and isolation:

```bash
# Make Docker test script executable
chmod +x testing/test-docker-mcp.sh

# Run all Docker MCP tests
./testing/test-docker-mcp.sh
```

**Available Docker MCP servers**:
- `mcp/filesystem` - File system operations
- `mcp/fetch` - Web content fetching  
- `mcp/time` - Time and date functions
- `mcp/github-mcp-server` - GitHub operations
- `mcp/postgres` - PostgreSQL database access
- `mcp/stripe` - Stripe payment operations

See `DOCKER-MCP-GUIDE.md` for complete Docker MCP integration instructions.

## 🎯 AI Tool Testing

After E2E tests pass, test with real AI tools:

### Cursor Configuration
```json
{
  "mcpServers": {
    "kilometers-test": {
      "command": "km",
      "args": ["npx", "-y", "@modelcontextprotocol/server-filesystem", "--path", "/tmp"]
    }
  }
}
```

### Claude Desktop Configuration
```json
{
  "mcpServers": {
    "kilometers-test": {
      "command": "km", 
      "args": ["npx", "-y", "@modelcontextprotocol/server-github"]
    }
  }
}
```

See `AI-TOOL-INTEGRATION-GUIDE.md` for complete instructions.

## 🚨 Troubleshooting

### "Command not found: km"
```bash
cd /Users/milesangelo/Source/active/kilometers.ai/kilometers/cli
go build -o km .
export PATH=$PATH:$(pwd)
```

### Mock server won't start
```bash
chmod +x testing/mock-mcp-server.js
node --version  # Ensure Node.js is installed
```

### API tests fail
```bash
cd /Users/milesangelo/Source/active/kilometers.ai/kilometers/api/Kilometers.Api
dotnet run &
sleep 5
curl http://localhost:5194/health
```

### Permission denied errors
```bash
chmod +x testing/setup.sh
chmod +x testing/test-e2e.sh
chmod +x testing/mock-mcp-server.js
```

## 📈 Success Metrics

Your CLI is production-ready when:

- ✅ All E2E tests pass
- ✅ Performance overhead < 10ms
- ✅ AI tools connect successfully with wrapper
- ✅ Events are captured in API
- ✅ Risk detection works (if enabled)
- ✅ Error handling is robust

## 🎉 Next Steps

After successful testing:

1. **Update README.md** - Verify examples work
2. **Configure Production API** - Point to production endpoints  
3. **Test Distribution** - Verify install scripts work
4. **Launch Preparation** - Set up monitoring and analytics

---

**Remember**: The goal is transparent monitoring. Your wrapper should be invisible to the AI tools while capturing everything they do!