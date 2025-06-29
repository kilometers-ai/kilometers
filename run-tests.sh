#!/bin/bash
# Quick test runner for Kilometers CLI

echo "🚀 Running Kilometers CLI E2E Tests..."
echo

# Ensure we're in the right directory
cd /Users/milesangelo/Source/active/kilometers.ai/kilometers

# Run the tests
./testing/test-e2e.sh "$@"
