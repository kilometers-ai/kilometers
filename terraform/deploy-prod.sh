#!/bin/bash
set -e

echo "🚀 Deploying to PRODUCTION environment"
echo "======================================"
echo "⚠️  WARNING: This will affect production!"
echo

# Initialize with prod backend
terraform init -backend-config=config/backend-prod.hcl -reconfigure

# Plan with prod variables
echo "📋 Planning changes..."
terraform plan -var-file=config/prod.tfvars -out=prod.tfplan

# Show summary and ask for confirmation
echo
echo "Please review the plan above carefully!"
read -p "Type 'deploy production' to continue: " confirmation

if [[ "$confirmation" == "deploy production" ]]; then
    terraform apply prod.tfplan
    rm prod.tfplan
    echo "✅ Production deployment complete!"
else
    echo "❌ Deployment cancelled"
    rm prod.tfplan
fi 