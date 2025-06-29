#!/bin/bash
# Make all testing scripts executable
chmod +x ./testing/setup.sh
chmod +x ./testing/test-e2e.sh
chmod +x ./testing/mock-mcp-server.js
echo "✅ All testing scripts are now executable!"
echo ""
echo "Run the setup with:"
echo "  cd ./kilometers.ai/kilometers"
echo "  ./testing/setup.sh"