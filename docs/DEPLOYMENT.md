# Kilometers.ai Azure Deployment Guide

This guide walks you through deploying Kilometers.ai to Azure for production use.

## Overview

The deployment creates a complete Azure infrastructure stack including:

- **Azure App Service**: Hosts the .NET 9 API
- **PostgreSQL Flexible Server**: Stores event data
- **Azure Key Vault**: Manages secrets and connection strings
- **Application Insights**: Provides monitoring and telemetry
- **Storage Account**: For logs and future file storage
- **Resource Group**: Contains all resources with proper tagging

## Prerequisites

Before starting the deployment, ensure you have:

1. **Azure CLI** (latest version)
   ```bash
   # Install on macOS
   brew install azure-cli
   
   # Install on Windows
   winget install Microsoft.AzureCLI
   
   # Install on Linux
   curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
   ```

2. **Terraform** (>= 1.0)
   ```bash
   # Install on macOS
   brew install terraform
   
   # Install on Windows
   winget install HashiCorp.Terraform
   
   # Install on Linux
   wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
   sudo apt update && sudo apt install terraform
   ```

3. **.NET 9 SDK**
   ```bash
   # Download from https://dotnet.microsoft.com/download/dotnet/9.0
   dotnet --version  # Should show 9.x.x
   ```

4. **Go** (for CLI building)
   ```bash
   # Download from https://golang.org/dl/
   go version  # Should show go1.21+ 
   ```

5. **Azure Subscription** with Contributor access

## Deployment Steps

### 1. Prepare Configuration

1. **Login to Azure**:
   ```bash
   az login
   az account set --subscription "Your Subscription Name"
   ```

2. **Configure Terraform Variables**:
   ```bash
   # Copy the example file
   cp terraform/terraform.tfvars.example terraform/terraform.tfvars
   
   # Edit the variables (especially the database password)
   nano terraform/terraform.tfvars
   ```

   **Important**: Set a strong database password with:
   - At least 12 characters
   - Mix of uppercase, lowercase, numbers, and special characters

### 2. Run Automated Deployment

The easiest way to deploy is using our automated script:

```bash
# Make the script executable
chmod +x scripts/deploy.sh

# Run the deployment
./scripts/deploy.sh
```

The script will:
1. Check all prerequisites
2. Verify Azure login
3. Deploy infrastructure with Terraform
4. Build and deploy the API
5. Build CLI binaries for all platforms
6. Create production CLI configuration
7. Test the deployment

### 3. Manual Deployment (Alternative)

If you prefer manual control, follow these steps:

#### Deploy Infrastructure
```bash
cd terraform

# Initialize Terraform
terraform init

# Plan the deployment
terraform plan -out=tfplan

# Apply the deployment
terraform apply tfplan

# Note the outputs
terraform output
```

#### Deploy API
```bash
cd api/Kilometers.Api

# Restore and build
dotnet restore
dotnet build --configuration Release
dotnet publish --configuration Release --output ./publish

# Create deployment package
cd publish
zip -r ../deployment.zip .
cd ..

# Deploy to App Service
APP_SERVICE_NAME="your-app-service-name"  # From Terraform output
RESOURCE_GROUP="your-resource-group"      # From Terraform output

az webapp deployment source config-zip \
    --resource-group "$RESOURCE_GROUP" \
    --name "$APP_SERVICE_NAME" \
    --src deployment.zip
```

#### Build CLI
```bash
cd cli

# Create distribution directory
mkdir -p dist

# Build for all platforms
GOOS=linux GOARCH=amd64 go build -o dist/km-linux-amd64
GOOS=darwin GOARCH=amd64 go build -o dist/km-darwin-amd64
GOOS=darwin GOARCH=arm64 go build -o dist/km-darwin-arm64
GOOS=windows GOARCH=amd64 go build -o dist/km-windows-amd64.exe
```

## Configuration

### CLI Configuration

Create a production configuration file:

```bash
mkdir -p ~/.config/kilometers

cat > ~/.config/kilometers/config.json << EOF
{
    "api_url": "https://your-api-url.azurewebsites.net",
    "api_key": "",
    "batch_size": 10,
    "debug": false
}
EOF
```

### Environment Variables

The API supports these environment variables in production:

- `ASPNETCORE_ENVIRONMENT`: Set to "Production"
- `ConnectionStrings__Default`: Database connection (automatically set via Key Vault)
- `APPLICATIONINSIGHTS_CONNECTION_STRING`: Application Insights (automatically set)
- `KeyVault__VaultUri`: Key Vault URI (automatically set)

## Testing Deployment

### API Health Check
```bash
API_URL="https://your-api-url.azurewebsites.net"

# Test health endpoint
curl "$API_URL/health"

# Test root endpoint
curl "$API_URL/"
```

### CLI Testing
```bash
# Download appropriate CLI binary
wget https://github.com/your-org/kilometers/releases/latest/download/km-linux-amd64
chmod +x km-linux-amd64

# Test basic functionality
echo '{"jsonrpc": "2.0", "id": 1, "method": "test", "params": {}}' | ./km-linux-amd64 cat

# Check API connectivity
./km-linux-amd64 --version
```

## Monitoring and Operations

### Application Insights

Monitor your deployment through Azure Application Insights:

1. Open the Azure portal
2. Navigate to your Application Insights resource
3. View telemetry, performance, and errors

### Database Monitoring

Monitor PostgreSQL performance:

1. Open the Azure portal
2. Navigate to your PostgreSQL Flexible Server
3. View metrics, query performance, and logs

### Log Streaming

Stream live logs from the App Service:

```bash
az webapp log tail --resource-group "$RESOURCE_GROUP" --name "$APP_SERVICE_NAME"
```

## Scaling

### Vertical Scaling (Compute)

Upgrade the App Service plan:

```bash
az appservice plan update \
    --resource-group "$RESOURCE_GROUP" \
    --name "your-app-service-plan" \
    --sku P1V3  # Premium tier
```

### Database Scaling

Upgrade the PostgreSQL server:

```bash
az postgres flexible-server update \
    --resource-group "$RESOURCE_GROUP" \
    --name "your-postgres-server" \
    --sku-name GP_Standard_D2s_v3  # General Purpose tier
```

## Security

### Key Vault Access

The API uses managed identity to access Key Vault. No connection strings are stored in app settings.

### Database Security

- SSL/TLS enforced for all connections
- Firewall rules restrict access to Azure services only
- Regular security updates applied automatically

### Network Security

Consider adding:
- Virtual Network integration
- Private endpoints for database
- Web Application Firewall (WAF)

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check Key Vault access
   az keyvault secret show --vault-name "your-key-vault" --name "DatabaseConnectionString"
   
   # Check managed identity
   az webapp identity show --resource-group "$RESOURCE_GROUP" --name "$APP_SERVICE_NAME"
   ```

2. **API Not Responding**
   ```bash
   # Check App Service status
   az webapp show --resource-group "$RESOURCE_GROUP" --name "$APP_SERVICE_NAME" --query state
   
   # View logs
   az webapp log tail --resource-group "$RESOURCE_GROUP" --name "$APP_SERVICE_NAME"
   ```

3. **CLI Connection Issues**
   ```bash
   # Test API connectivity
   curl -v "https://your-api-url.azurewebsites.net/health"
   
   # Check CLI configuration
   cat ~/.config/kilometers/config.json
   ```

### Debug Mode

Enable debug logging:

```bash
# Set environment variable
export KM_DEBUG=true

# Or update config file
{
    "api_url": "https://your-api-url.azurewebsites.net",
    "debug": true
}
```

## Cost Optimization

The default deployment uses cost-optimized tiers:

- **App Service**: B1 Basic ($~13/month)
- **PostgreSQL**: B1ms Burstable ($~15/month)
- **Storage**: Standard LRS ($~2/month)
- **Application Insights**: Pay-as-you-go

**Estimated monthly cost**: ~$30-40 for low-traffic usage

### Cost Reduction Tips

1. Use Azure Reserved Instances for long-term commitments
2. Set up auto-scaling to scale down during low usage
3. Use Azure Cost Management alerts
4. Consider Azure Free Tier offerings where applicable

## Maintenance

### Updates

1. **API Updates**:
   ```bash
   # Redeploy after code changes
   ./scripts/deploy.sh
   ```

2. **Infrastructure Updates**:
   ```bash
   cd terraform
   terraform plan
   terraform apply
   ```

3. **CLI Updates**:
   ```bash
   cd cli
   make build-all  # If using Makefile
   # Or use the deployment script
   ```

### Backup

- PostgreSQL automated backups: 7 days retention (configurable)
- Key Vault: Automatic soft-delete protection
- App Service: Use deployment slots for safe updates

## Support

For deployment issues:

1. Check the logs in Application Insights
2. Review Azure Resource Health
3. Consult the troubleshooting section above
4. Open an issue in the GitHub repository

## Next Steps

After successful deployment:

1. Set up CI/CD pipeline with GitHub Actions
2. Configure custom domain and SSL certificate
3. Implement authentication and API keys
4. Set up monitoring alerts
5. Create development/staging environments
6. Configure backup and disaster recovery

---

**Important**: This deployment creates Azure resources that incur costs. Monitor your Azure billing and set up cost alerts to avoid unexpected charges. 