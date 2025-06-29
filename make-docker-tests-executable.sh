#!/bin/bash
# Make Docker MCP test script executable
chmod +x /projects/kilometers.ai/kilometers/testing/test-docker-mcp.sh
echo "✅ Docker MCP test script is now executable"
echo ""
echo "Quick test commands:"
echo "  ./testing/test-docker-mcp.sh           # Run all Docker MCP tests"
echo "  ./testing/test-docker-mcp.sh --check   # Just check available images"