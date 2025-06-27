#!/bin/bash
set -e

echo "🚀 Deploying to DEVELOPMENT environment"
echo "======================================="

# Initialize with dev backend
terraform init -backend-config=config/backend-dev.hcl -reconfigure

# Plan with dev variables
echo "📋 Planning changes..."
terraform plan -var-file=config/dev.tfvars -out=dev.tfplan

# Ask for confirmation
read -p "Deploy to dev? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    terraform apply dev.tfplan
    rm dev.tfplan
    echo "✅ Development deployment complete!"
else
    echo "❌ Deployment cancelled"
    rm dev.tfplan
fi