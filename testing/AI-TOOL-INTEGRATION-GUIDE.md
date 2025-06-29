# AI Tool Integration Testing Guide

## 🎯 Quick Start: Test Your CLI with Real AI Tools

After running the E2E test script, follow these steps to test with actual AI development tools.

## 📋 Prerequisites

1. **CLI Built and Tested**: Run the E2E test script first
2. **API Running**: Ensure your .NET API is running locally
3. **MCP Servers**: Have some MCP servers available to test with

## 🔧 Step 1: Cursor Integration Test

### Current Cursor MCP Configuration

1. **Open Cursor Settings** → **Features** → **Model Context Protocol**

2. **Add Test Server** with Kilometers wrapper:

```json
{
  "mcpServers": {
    "kilometers-test-filesystem": {
      "command": "km",
      "args": ["npx", "-y", "@modelcontextprotocol/server-filesystem", "--path", "/tmp"]
    }
  }
}
```

### Verification Steps

1. **Check MCP Connection**:
   - Look for green dot next to the server in Cursor
   - Server should appear as "Connected" in MCP settings

2. **Test Interaction**:
   - Ask Cursor: "List the files in the /tmp directory"
   - Cursor should use the filesystem MCP server through your wrapper

3. **Verify Event Capture**:
   ```bash
   curl http://localhost:5194/api/activity
   # Should show captured MCP events
   ```

## 🔧 Step 2: Claude Desktop Integration Test

### Current Claude Desktop Configuration

1. **Edit Config File**:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

2. **Add Test Configuration**:

```json
{
  "mcpServers": {
    "kilometers-test-github": {
      "command": "km",
      "args": ["npx", "-y", "@modelcontextprotocol/server-github"]
    }
  }
}
```

3. **Restart Claude Desktop**

### Verification Steps

1. **Check Server Status**:
   - Look for MCP servers in Claude's status indicator
   - Server should show as connected

2. **Test Interaction**:
   - Ask Claude: "Search for repositories related to MCP"
   - Claude should use the GitHub MCP server through your wrapper

## 🧪 Step 3: Linear Integration Test (Your Original Example)

```json
{
  "mcpServers": {
    "kilometers-linear": {
      "command": "km",
      "args": ["npx", "-y", "mcp-remote", "https://mcp.linear.app/sse"]
    }
  }
}
```

**Test Commands**:
- "Show me my current Linear issues"
- "Create a new issue in Linear"
- "Update the status of issue #123"

## 🔍 Step 4: Debug Mode Testing

### Enable Detailed Logging

```bash
export KM_DEBUG=true
export KILOMETERS_API_URL=http://localhost:5194
```

### Watch Events in Real-Time

```bash
# Terminal 1: Watch CLI logs
tail -f ~/.config/kilometers/debug.log

# Terminal 2: Watch API events
watch -n 2 'curl -s http://localhost:5194/api/activity | jq ".events | length"'

# Terminal 3: Use AI tool normally
```

## ⚠️ Common Issues & Solutions

### Issue 1: "Command not found: km"

**Solution**: Ensure the CLI is built and in PATH:
```bash
cd /Users/milesangelo/Source/active/kilometers.ai/kilometers/cli
go build -o km .
sudo cp km /usr/local/bin/  # Or add to PATH
```

### Issue 2: "MCP Server Failed to Start"

**Symptoms**: Red dot in Cursor, server shows as disconnected

**Debug Steps**:
1. Test the wrapped command directly:
   ```bash
   km npx -y @modelcontextprotocol/server-filesystem --path /tmp
   ```

2. Check if the original command works:
   ```bash
   npx -y @modelcontextprotocol/server-filesystem --path /tmp
   ```

3. Verify MCP protocol communication:
   ```bash
   echo '{"jsonrpc":"2.0","id":"test","method":"ping"}' | km npx -y @modelcontextprotocol/server-filesystem --path /tmp
   ```

### Issue 3: "No Events Captured"

**Symptoms**: API shows empty events, CLI seems to work

**Debug Steps**:
1. Enable debug mode: `export KM_DEBUG=true`
2. Check API connectivity: `curl http://localhost:5194/health`
3. Verify configuration: `km --version`
4. Test with mock server first

### Issue 4: "High CPU Usage"

**Symptoms**: CLI uses excessive resources

**Debug Steps**:
1. Check for event loops in debug output
2. Reduce batch size: `export KM_BATCH_SIZE=1`
3. Enable filtering: `export KM_EXCLUDE_PING=true`

## 📊 Success Criteria

### ✅ Basic Integration Success
- [ ] MCP server shows as "Connected" in AI tool
- [ ] AI tool can execute MCP commands through wrapper
- [ ] Original functionality is preserved
- [ ] No noticeable performance impact

### ✅ Event Capture Success
- [ ] Events appear in API `/api/activity` endpoint
- [ ] Request/response pairs are captured
- [ ] Event timestamps are reasonable
- [ ] Risk scores are calculated (if enabled)

### ✅ Production Readiness
- [ ] Works with multiple MCP servers simultaneously
- [ ] Handles network interruptions gracefully
- [ ] API failures don't break MCP functionality
- [ ] Resource usage remains minimal

## 🚀 Next Steps After Successful Testing

1. **Update Documentation**: Verify README examples work
2. **Configure Production API**: Point to production endpoints
3. **Create Release**: Tag a stable version
4. **Setup Distribution**: Configure install script URLs
5. **Monitor Usage**: Set up production monitoring

## 📞 Need Help?

If you encounter issues:

1. **Check the E2E test results** - fix any failed tests first
2. **Enable debug mode** - `export KM_DEBUG=true`
3. **Test incrementally** - start with simple MCP servers
4. **Verify API health** - ensure backend is responding
5. **Check original MCP server** - ensure it works without wrapper

## 🎯 Integration Test Checklist

### Before AI Tool Testing:
- [ ] E2E test script passes
- [ ] CLI binary is built and accessible
- [ ] API server is running and healthy
- [ ] Debug mode can be enabled

### During AI Tool Testing:
- [ ] MCP server connects successfully
- [ ] AI tool can execute commands
- [ ] Events are captured in API
- [ ] No performance degradation
- [ ] Error handling works correctly

### After Successful Testing:
- [ ] Document working configurations
- [ ] Test with multiple AI tools
- [ ] Verify production API integration
- [ ] Update installation instructions
- [ ] Prepare for public launch

---

**Remember**: The goal is transparent monitoring. If the AI tool behaves differently with your wrapper than without it, that's a bug that needs fixing!