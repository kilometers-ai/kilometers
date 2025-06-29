# Docker MCP Integration Guide

## 🐳 Docker MCP Server Testing with Kilometers CLI

This guide shows how to test your Kilometers CLI wrapper with Docker-based MCP servers, providing containerized, isolated, and secure MCP functionality.

## 🎯 Why Test with Docker MCP Servers?

- **Isolated environments** - Each MCP server runs in its own container
- **No dependency conflicts** - Pre-packaged with all requirements
- **Enhanced security** - Container isolation and controlled access
- **Easy cleanup** - Containers are ephemeral and disposable
- **Production-ready** - Same containers work in development and production

## 🚀 Quick Start

### 1. Run the Docker MCP Test Script

```bash
# Make the test script executable
chmod +x /projects/kilometers.ai/kilometers/testing/test-docker-mcp.sh

# Run comprehensive Docker MCP tests
./testing/test-docker-mcp.sh
```

This will test multiple Docker MCP servers and verify event capture.

### 2. Manual Testing Commands

```bash
# Test with filesystem MCP server
echo '{"jsonrpc":"2.0","id":"test","method":"resources/list"}' | \
  km docker run --rm -i -v /tmp:/mnt/allowed mcp/filesystem /mnt/allowed

# Test with web fetch MCP server  
echo '{"jsonrpc":"2.0","id":"test","method":"tools/list"}' | \
  km docker run --rm -i mcp/fetch

# Test with time MCP server
echo '{"jsonrpc":"2.0","id":"test","method":"ping"}' | \
  km docker run --rm -i mcp/time
```

## 🔧 AI Tool Integration Examples

### Cursor Configuration

Add to your Cursor MCP settings:

```json
{
  "mcpServers": {
    "kilometers-docker-filesystem": {
      "command": "km",
      "args": [
        "docker", "run", "--rm", "-i",
        "-v", "/tmp:/mnt/allowed",
        "mcp/filesystem", "/mnt/allowed"
      ]
    },
    "kilometers-docker-fetch": {
      "command": "km", 
      "args": [
        "docker", "run", "--rm", "-i",
        "mcp/fetch"
      ]
    },
    "kilometers-docker-github": {
      "command": "km",
      "args": [
        "docker", "run", "--rm", "-i",
        "-e", "GITHUB_PERSONAL_ACCESS_TOKEN=your_token_here",
        "mcp/github-mcp-server"
      ]
    }
  }
}
```

### Claude Desktop Configuration

Edit your Claude Desktop config file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "kilometers-docker-postgres": {
      "command": "km",
      "args": [
        "docker", "run", "--rm", "-i",
        "-e", "POSTGRES_CONNECTION_STRING=your_connection_string",
        "mcp/postgres"
      ]
    },
    "kilometers-docker-stripe": {
      "command": "km",
      "args": [
        "docker", "run", "--rm", "-i", 
        "-e", "STRIPE_API_KEY=your_stripe_key",
        "mcp/stripe"
      ]
    }
  }
}
```

## 📋 Available Docker MCP Servers

### **Core Utilities**
- `mcp/filesystem` - File system operations with controlled access
- `mcp/fetch` - Web content fetching and parsing
- `mcp/time` - Time and date functions
- `mcp/memory` - Persistent memory across sessions

### **Development Tools**
- `mcp/github-mcp-server` - GitHub repository management
- `mcp/gitlab` - GitLab integration
- `mcp/docker` - Docker container and image management
- `mcp/kubernetes` - Kubernetes cluster operations

### **Database Integrations**
- `mcp/postgres` - PostgreSQL database access
- `mcp/mysql` - MySQL database operations
- `mcp/mongodb` - MongoDB operations
- `mcp/redis` - Redis cache operations

### **Business Services**
- `mcp/stripe` - Stripe payment processing
- `mcp/slack` - Slack workspace integration
- `mcp/notion` - Notion workspace management
- `mcp/google-calendar` - Google Calendar operations

### **AI & ML Services**
- `mcp/openai` - OpenAI API integration
- `mcp/huggingface` - HuggingFace model access
- `mcp/replicate` - Replicate model inference

## 🔐 Security Configuration

### Environment Variables

Pass sensitive data through environment variables:

```bash
# For GitHub integration
km docker run --rm -i \
  -e GITHUB_PERSONAL_ACCESS_TOKEN="your_token" \
  mcp/github-mcp-server

# For database access
km docker run --rm -i \
  -e POSTGRES_CONNECTION_STRING="postgresql://user:pass@host:5432/db" \
  mcp/postgres
```

### Volume Mounts

Control filesystem access with specific mounts:

```bash
# Only allow access to specific directory
km docker run --rm -i \
  -v /home/user/safe-directory:/mnt/allowed \
  mcp/filesystem /mnt/allowed

# Read-only mount
km docker run --rm -i \
  -v /home/user/project:/mnt/project:ro \
  mcp/filesystem /mnt/project
```

### Network Isolation

Run with limited network access:

```bash
# No network access
km docker run --rm -i --network none mcp/filesystem /tmp

# Custom network
km docker run --rm -i --network my-secure-network mcp/postgres
```

## 🧪 Testing Scenarios

### 1. Basic Functionality Test

```bash
# Test ping response
echo '{"jsonrpc":"2.0","id":"1","method":"ping"}' | \
  km docker run --rm -i mcp/time

# Expected: {"jsonrpc":"2.0","id":"1","result":{}}
```

### 2. Tool Discovery Test

```bash
# List available tools
echo '{"jsonrpc":"2.0","id":"2","method":"tools/list"}' | \
  km docker run --rm -i mcp/fetch

# Expected: List of available tools
```

### 3. Tool Execution Test

```bash
# Execute a tool
echo '{"jsonrpc":"2.0","id":"3","method":"tools/call","params":{"name":"get_current_time","arguments":{}}}' | \
  km docker run --rm -i mcp/time

# Expected: Current time response
```

### 4. Error Handling Test

```bash
# Invalid method
echo '{"jsonrpc":"2.0","id":"4","method":"invalid_method"}' | \
  km docker run --rm -i mcp/time

# Expected: Method not found error
```

## 📊 Monitoring & Debugging

### Enable Debug Mode

```bash
export KM_DEBUG=true
export KILOMETERS_API_URL=http://localhost:5194

# Run with debug output
km docker run --rm -i mcp/time
```

### Monitor Events

```bash
# Watch events in real-time
watch -n 2 'curl -s http://localhost:5194/api/activity | jq ".events | length"'

# Get latest events
curl -s http://localhost:5194/api/activity | jq '.events[-5:]'
```

### Container Logging

```bash
# Run with container logs
km docker run --rm -i --name mcp-test mcp/time

# In another terminal, watch container logs
docker logs -f mcp-test
```

## ⚡ Performance Considerations

### Resource Limits

```bash
# Limit memory and CPU
km docker run --rm -i \
  --memory=512m \
  --cpus=0.5 \
  mcp/fetch
```

### Persistent Volumes

```bash
# Use volumes for data persistence
km docker run --rm -i \
  -v mcp-data:/data \
  mcp/database-server
```

## 🚨 Troubleshooting

### Common Issues

1. **"docker: command not found"**
   ```bash
   # Install Docker and ensure it's in PATH
   docker --version
   ```

2. **"permission denied" errors**
   ```bash
   # Add user to docker group
   sudo usermod -aG docker $USER
   newgrp docker
   ```

3. **Port conflicts**
   ```bash
   # Use different ports
   km docker run --rm -i -p 8081:8080 mcp/web-server
   ```

4. **Volume mount issues**
   ```bash
   # Check directory permissions
   ls -la /path/to/mount
   
   # Use absolute paths
   km docker run --rm -i -v "$(pwd)":/mnt/current mcp/filesystem /mnt/current
   ```

### Debugging Commands

```bash
# Test Docker connectivity
docker info

# List running containers
docker ps

# Check container logs
docker logs <container_id>

# Inspect container
docker inspect <container_id>
```

## 🎯 Success Metrics

Your Docker MCP integration is working when:

- ✅ Container starts and responds to MCP requests
- ✅ Events are captured in your Kilometers API
- ✅ AI tools can communicate through the wrapper
- ✅ Performance overhead remains minimal
- ✅ Security isolation is maintained

## 🔮 Next Steps

1. **Production Configuration**: Set up production-ready Docker MCP servers
2. **Custom MCP Servers**: Containerize your own MCP implementations
3. **Orchestration**: Use Docker Compose for multi-server setups
4. **CI/CD Integration**: Automate Docker MCP server deployments
5. **Monitoring**: Set up comprehensive logging and metrics

---

**Pro Tip**: Docker MCP servers are perfect for production deployments because they provide isolation, security, and consistent behavior across environments. Your Kilometers CLI wrapper makes them even better by adding comprehensive monitoring!