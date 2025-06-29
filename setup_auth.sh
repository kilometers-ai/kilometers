#!/bin/bash
# Get Terraform API Key and Complete Setup

set -e

echo "🔑 Kilometers.ai Setup - Get API Key & Test Authentication"
echo "========================================================"

# Check if we're in the right directory
if [ ! -f "terraform/main.tf" ]; then
    echo "❌ Please run this script from the kilometers project root"
    echo "   Expected: terraform/main.tf should exist"
    exit 1
fi

cd terraform

# Get the terraform API key
echo "📡 Getting Terraform API Key..."

# Try terraform output first
TERRAFORM_API_KEY=""
if terraform output kilometers_api_key >/dev/null 2>&1; then
    TERRAFORM_API_KEY=$(terraform output -raw kilometers_api_key 2>/dev/null || echo "")
fi

# If that fails, check environment variable
if [ -z "$TERRAFORM_API_KEY" ]; then
    TERRAFORM_API_KEY="${KILOMETERS_API_KEY:-}"
fi

if [ -z "$TERRAFORM_API_KEY" ]; then
    echo "❌ Could not find terraform API key. Options:"
    echo "   1. Set KILOMETERS_API_KEY environment variable"
    echo "   2. Run 'terraform apply' to generate the key"
    echo "   3. Check: terraform output kilometers_api_key"
    exit 1
fi

echo "✅ Found API key: ${TERRAFORM_API_KEY:0:8}...${TERRAFORM_API_KEY: -4}"

# Go back to project root
cd ..

# Set environment variable for this session
export KILOMETERS_API_KEY="$TERRAFORM_API_KEY"

echo ""
echo "🔧 Setting up CLI configuration..."
mkdir -p ~/.config/kilometers

cat > ~/.config/kilometers/config.json << EOF
{
  "api_endpoint": "http://localhost:5194",
  "api_key": "$TERRAFORM_API_KEY",
  "batch_size": 10,
  "debug": true
}
EOF

echo "✅ CLI config created at ~/.config/kilometers/config.json"

echo ""
echo "🔧 Setting up Dashboard environment..."
cat > dashboard/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:5194
NEXT_PUBLIC_KILOMETERS_API_KEY=$TERRAFORM_API_KEY
EOF

echo "✅ Dashboard environment updated"

echo ""
echo "🗄️  Creating EF Core Migration..."
echo "============================="
cd api/Kilometers.Api

# Create new migration for the schema change
echo "Creating migration: RemoveCustomerIdAddApiKeyHash"
dotnet ef migrations add RemoveCustomerIdAddApiKeyHash --verbose

if [ $? -eq 0 ]; then
    echo "✅ Migration created successfully"
    echo ""
    echo "📋 Review the migration file in Migrations/ folder"
    echo "   Then run: dotnet ef database update"
else
    echo "❌ Migration creation failed. Check for errors above."
fi

cd ../..

echo ""
echo "🧪 Testing API Authentication..."
echo "==============================="

# Test if API is running
if curl -s http://localhost:5194/health >/dev/null 2>&1; then
    echo "✅ API is running"
    
    # Test authentication
    response=$(curl -s -w "%{http_code}" -H "Authorization: Bearer $TERRAFORM_API_KEY" \
               http://localhost:5194/api/customer 2>/dev/null)
    
    http_code="${response: -3}"
    if [ "$http_code" = "200" ]; then
        echo "✅ API key authentication successful"
    else
        echo "⚠️  Authentication test returned HTTP $http_code"
        echo "   Make sure you've built and started the API"
    fi
else
    echo "⚠️  API not running. Start it with:"
    echo "   cd api/Kilometers.Api && dotnet run"
fi

echo ""
echo "🚀 Next Steps"
echo "============"
echo "1. 🏗️  Build and run API:"
echo "   cd api/Kilometers.Api && dotnet run"
echo ""
echo "2. 🗄️  Run EF Core migration:"
echo "   cd api/Kilometers.Api && dotnet ef database update"
echo ""
echo "3. 🔧 Test CLI:"
echo "   ./cli/km npx @modelcontextprotocol/server-github"
echo ""
echo "4. 🌐 Test Dashboard:"
echo "   cd dashboard && npm run dev"
echo ""
echo "🎉 Your API key is: $TERRAFORM_API_KEY"
echo "   Keep this secure - it's your authentication token!"

# Clean up - no Python script needed for EF Core!
