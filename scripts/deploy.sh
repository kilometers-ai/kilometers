#!/bin/bash

# Kilometers.ai Azure Deployment Script
# This script deploys the complete infrastructure and application to Azure

set -e # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Azure CLI is installed
    if ! command -v az &> /dev/null; then
        log_error "Azure CLI is not installed. Please install it from https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
        exit 1
    fi
    
    # Check if Terraform is installed
    if ! command -v terraform &> /dev/null; then
        log_error "Terraform is not installed. Please install it from https://www.terraform.io/downloads.html"
        exit 1
    fi
    
    # Check if .NET is installed
    if ! command -v dotnet &> /dev/null; then
        log_error ".NET SDK is not installed. Please install it from https://dotnet.microsoft.com/download"
        exit 1
    fi
    
    # Check if Go is installed (for CLI)
    if ! command -v go &> /dev/null; then
        log_error "Go is not installed. Please install it from https://golang.org/dl/"
        exit 1
    fi
    
    log_success "All prerequisites are installed"
}

# Azure login check
check_azure_login() {
    log_info "Checking Azure login status..."
    
    if ! az account show &> /dev/null; then
        log_warning "Not logged into Azure. Please log in..."
        az login
    fi
    
    # Show current subscription
    SUBSCRIPTION=$(az account show --query name -o tsv)
    log_info "Using Azure subscription: $SUBSCRIPTION"
    
    # Confirm subscription
    read -p "Continue with this subscription? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Please switch to the correct subscription using: az account set --subscription <subscription-id>"
        exit 1
    fi
}

# Check terraform.tfvars exists
setup_terraform_vars() {
    log_info "Checking Terraform variables..."
    
    if [ ! -f "terraform/terraform.tfvars" ]; then
        log_error "terraform/terraform.tfvars not found!"
        log_info "Please create terraform/terraform.tfvars with required variables:"
        log_info "  db_password = \"YourSecurePassword123!\""
        log_info ""
        log_info "Requirements for db_password:"
        log_info "  - At least 12 characters long"
        log_info "  - Mix of uppercase, lowercase, numbers, and special characters"
        exit 1
    fi
    
    log_success "Terraform variables found"
}

# Deploy infrastructure with Terraform
deploy_infrastructure() {
    log_info "Deploying Azure infrastructure with Terraform..."
    
    cd terraform
    
    # Check if terraform.tfvars exists
    if [ ! -f "terraform.tfvars" ]; then
        log_error "terraform.tfvars file not found!"
        log_info "Please create terraform.tfvars with the following required variables:"
        log_info ""
        log_info "# Example terraform.tfvars"
        log_info "db_password = \"YourSecurePassword123!\""
        log_info ""
        log_info "Requirements for db_password:"
        log_info "  - At least 12 characters long"
        log_info "  - Mix of uppercase, lowercase, numbers, and special characters"
        log_info "  - No quotes or spaces that could cause shell issues"
        log_info ""
        log_info "You can copy terraform.tfvars.example as a starting point:"
        log_info "  cp terraform.tfvars.example terraform.tfvars"
        log_info ""
        cd ..
        exit 1
    fi
    
    # Initialize Terraform
    log_info "Initializing Terraform..."
    terraform init
    
    # Plan deployment
    log_info "Creating deployment plan..."
    terraform plan -var-file="terraform.tfvars" -out=tfplan
    
    # Confirm deployment
    read -p "Deploy the infrastructure? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_warning "Infrastructure deployment cancelled"
        cd ..
        return 1
    fi
    
    # Apply deployment
    log_info "Applying infrastructure deployment..."
    terraform apply -var-file="terraform.tfvars" --auto-approve tfplan
    
    # Get outputs
    API_URL=$(terraform output -raw api_url)
    RESOURCE_GROUP=$(terraform output -raw resource_group_name)
    
    log_success "Infrastructure deployed successfully"
    log_info "API URL: $API_URL"
    log_info "Resource Group: $RESOURCE_GROUP"
    
    cd ..
    
    # Export for later use
    export API_URL
    export RESOURCE_GROUP
}

# Build and deploy the API
deploy_api() {
    log_info "Building and deploying the API..."
    
    cd api/Kilometers.Api
    
    # Restore packages
    log_info "Restoring NuGet packages..."
    dotnet restore
    
    # Build the application
    log_info "Building the application..."
    dotnet build --configuration Release
    
    # Publish the application
    log_info "Publishing the application..."
    dotnet publish --configuration Release --output ./publish
    
    # Create deployment package
    log_info "Creating deployment package..."
    cd publish
    zip -r ../deployment.zip .
    cd ..
    
    # Get the App Service name from Terraform output
    cd ../../terraform
    APP_SERVICE_NAME=$(terraform output -raw api_url | sed 's|https://||' | sed 's|\.azurewebsites\.net||')
    cd ../api/Kilometers.Api
    
    # Deploy to Azure App Service
    log_info "Deploying to Azure App Service: $APP_SERVICE_NAME"
    az webapp deployment source config-zip \
        --resource-group "$RESOURCE_GROUP" \
        --name "$APP_SERVICE_NAME" \
        --src deployment.zip
    
    # Clean up
    rm deployment.zip
    rm -rf publish
    
    cd ../..
    
    log_success "API deployed successfully to: $API_URL"
}

# Build CLI for distribution
build_cli() {
    log_info "Building CLI for distribution..."
    
    cd cli
    
    # Build for multiple platforms
    log_info "Building CLI for Linux..."
    GOOS=linux GOARCH=amd64 go build -o dist/km-linux-amd64
    
    log_info "Building CLI for macOS..."
    GOOS=darwin GOARCH=amd64 go build -o dist/km-darwin-amd64
    GOOS=darwin GOARCH=arm64 go build -o dist/km-darwin-arm64
    
    log_info "Building CLI for Windows..."
    GOOS=windows GOARCH=amd64 go build -o dist/km-windows-amd64.exe
    
    cd ..
    
    log_success "CLI built for all platforms in cli/dist/"
}

# Create production CLI configuration
create_cli_config() {
    log_info "Creating production CLI configuration..."
    
    if [ -z "$API_URL" ]; then
        log_error "API_URL not set. Make sure infrastructure deployment completed successfully."
        return 1
    fi
    
    # Create config directory
    mkdir -p ~/.config/kilometers
    
    # Create production config
    cat > ~/.config/kilometers/config.json << EOF
{
    "api_url": "$API_URL",
    "api_key": "",
    "batch_size": 10,
    "debug": false
}
EOF
    
    log_success "CLI configuration created at ~/.config/kilometers/config.json"
    log_warning "Remember to set your API key when authentication is implemented"
}

# Test deployment
test_deployment() {
    log_info "Testing deployment..."
    
    if [ -z "$API_URL" ]; then
        log_error "API_URL not set. Cannot test deployment."
        return 1
    fi
    
    # Test API health endpoint
    log_info "Testing API health endpoint..."
    if curl -f -s "$API_URL/health" > /dev/null; then
        log_success "API health check passed"
    else
        log_error "API health check failed"
        return 1
    fi
    
    # Test API root endpoint
    log_info "Testing API root endpoint..."
    RESPONSE=$(curl -s "$API_URL/")
    if echo "$RESPONSE" | grep -q "Kilometers.Api"; then
        log_success "API root endpoint test passed"
    else
        log_error "API root endpoint test failed"
        return 1
    fi
    
    log_success "All deployment tests passed!"
}

# Main deployment flow
main() {
    echo "========================================"
    echo "   Kilometers.ai Azure Deployment"
    echo "========================================"
    echo
    
    check_prerequisites
    check_azure_login
    setup_terraform_vars
    
    echo
    log_info "Starting deployment process..."
    echo
    
    # Deploy infrastructure
    if deploy_infrastructure; then
        # Build and deploy API
        deploy_api
        
        # Build CLI
        build_cli
        
        # Create CLI config
        create_cli_config
        
        # Test deployment
        test_deployment
        
        echo
        echo "========================================"
        log_success "Deployment completed successfully!"
        echo "========================================"
        echo
        log_info "API URL: $API_URL"
        log_info "CLI binaries available in: cli/dist/"
        log_info "CLI config created at: ~/.config/kilometers/config.json"
        echo
        log_info "Next steps:"
        echo "  1. Test the CLI with: ./cli/dist/km-$(uname | tr '[:upper:]' '[:lower:]')-$(uname -m | sed 's/x86_64/amd64/') echo 'Hello World'"
        echo "  2. Update DNS settings if using a custom domain"
        echo "  3. Configure monitoring and alerting"
        echo "  4. Set up CI/CD pipeline for future deployments"
        echo
    else
        log_error "Infrastructure deployment failed. Aborting."
        exit 1
    fi
}

# Handle script interruption
trap 'log_error "Deployment interrupted"; exit 1' INT TERM

# Run main function
main "$@" 