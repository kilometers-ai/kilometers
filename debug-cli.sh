#!/bin/bash
# Debug CLI with verbose output

export KM_DEBUG=true
export KILOMETERS_API_URL=http://localhost:5194

echo "🔍 Debug mode enabled for Kilometers CLI"
echo "API URL: $KILOMETERS_API_URL"
echo "Command: $@"
echo

./cli/km "$@"
