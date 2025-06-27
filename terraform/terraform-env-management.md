# Terraform Environment Management Guide
# TODO:
 - clean up unused scripts. environments/{dev,prod} seem obsolete now as we are using config/{dev,prod}.tfvars approach now. 
## Quick Reference Commands

## Initial Setup (One Time)

### 1. Create Backend Configuration Files

Create `terraform/config/backend-dev.hcl`:
```hcl
resource_group_name  = "rg-kilometers-terraform"
storage_account_name = "stkilometerstfstate"
container_name       = "tfstate"
key                  = "kilometers-dev.tfstate"
```

Create `terraform/config/backend-prod.hcl`:
```hcl
resource_group_name  = "rg-kilometers-terraform"
storage_account_name = "stkilometerstfstate"
container_name       = "tfstate"
key                  = "kilometers-prod.tfstate"
```

### 2. Create Environment Variable Files

Create `terraform/config/dev.tfvars`:
```hcl
subscription_id = "the_subscription_id"
environment = "dev"
location    = "East US"

# Database
db_admin_username = "pgadmin"
db_admin_password = "DevPassword123!"  # Change this

# Network Security
allowed_ip_ranges = ["YOUR_HOME_IP/32"]

# GitHub
github_organization = "your-github-org"
github_repository   = "kilometers"
github_token        = "ghp_your_dev_token"
```

Create `terraform/config/prod.tfvars`:
```hcl
subscription_id = "the_subscription_id"
environment = "prod"
location    = "East US"

# Database
db_admin_username = "pgadmin"
db_admin_password = "ProdSecurePassword456!"  # Use strong password

# Network Security  
allowed_ip_ranges = []  # No direct access in prod

# GitHub
github_organization = "your-github-org"
github_repository   = "kilometers"
github_token        = "ghp_your_prod_token"
```

### Initialize Environment
```bash
# Development
terraform init -backend-config=config/backend-dev.hcl

# Production  
terraform init -backend-config=config/backend-prod.hcl
```

### Deploy to Environment
```bash
# Development
terraform plan -var-file=config/dev.tfvars
terraform apply -var-file=config/dev.tfvars

# Production
terraform plan -var-file=config/prod.tfvars
terraform apply -var-file=config/prod.tfvars
```



### 3. Create Helper Scripts

Create `terraform/deploy-dev.sh`:
```bash
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
```

Create `terraform/deploy-prod.sh`:
```bash
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
```

Make scripts executable:
```bash
chmod +x deploy-dev.sh deploy-prod.sh
```

## Daily Usage

### Working on Development
```bash
cd terraform
./deploy-dev.sh
```

### Deploying to Production
```bash
cd terraform
./deploy-prod.sh
```

### Checking Current Environment
```bash
# See which environment you're connected to
terraform workspace show

# List all state files in storage
az storage blob list \
  --account-name stkilometerstfstate \
  --container-name tfstate \
  --query "[].name" \
  --output table
```

### Switching Between Environments
```bash
# Always re-initialize when switching
terraform init -backend-config=config/backend-dev.hcl -reconfigure
# or
terraform init -backend-config=config/backend-prod.hcl -reconfigure
```

## Important Notes

1. **Never commit `.tfvars` files** with real passwords
2. **Always use `-reconfigure`** when switching environments
3. **Keep separate GitHub tokens** for dev/prod
4. **Review plans carefully** before applying to production

## Troubleshooting

### "Backend configuration changed" error
```bash
# Force reconfigure
terraform init -backend-config=config/backend-dev.hcl -reconfigure
```

### Wrong environment state
```bash
# Check current state file
terraform state list | head -5
# If wrong, re-init with correct backend
```

### State lock issues
```bash
# List locks
az storage blob list \
  --account-name stkilometerstfstate \
  --container-name tfstate \
  --prefix ".terraform.lock"

# Force unlock (use carefully!)
terraform force-unlock <lock-id>
```

## Common Issues & Troubleshooting

This section covers common errors encountered during deployment and how to resolve them.

### Issue 1: State Lock Error

-   **Symptom**: You see an error message `Error: Error acquiring the state lock`.
-   **Cause**: This typically happens when a previous Terraform command (like `plan` or `apply`) was interrupted, leaving the state file locked to prevent corruption.
-   **Solution**: You need to manually unlock the state using the Lock ID provided in the error message.
    ```bash
    # Get the LOCK_ID from the error message
    terraform force-unlock <LOCK_ID>
    ```

### Issue 2: Resource Already Exists

-   **Symptom**: You see an error message like `Error: A resource with the ID "..." already exists`.
-   **Cause**: A previous `terraform apply` command successfully created the resource in Azure, but failed before it could save that resource to the `tfstate` file. Terraform now sees a resource that exists in the real world but is not tracked in its state.
-   **Solution**: You need to "import" the existing resource into Terraform's state. The error message gives you the exact resource type and information needed.
    1.  Get the **Terraform Resource Address** from the error message (e.g., `'module.networking.azurerm_subnet_network_security_group_association.app_nsg_association'`).
    2.  Get the **Azure Resource ID** from the error message (e.g., `'/subscriptions/b902.../subnets/app-subnet'`).
    3.  Run the import command:
        ```bash
        terraform import -var-file=config/dev.tfvars <Terraform Resource Address> <Azure Resource ID>
        ```
    4.  Re-run `terraform apply`.

### Issue 3: "Resource Not Found" / Timing Errors

-   **Symptom**: You see an error like `unexpected status 404 (404 Not Found) with error: ResourceNotFound`.
-   **Cause**: This is a race condition due to Azure API propagation delays. A resource was just created, but the next resource that depends on it can't find it yet because the Azure API hasn't fully registered its existence across all endpoints.
-   **Solution**:
    1.  **Wait and Retry**: The simplest solution is to wait 30-60 seconds and run `terraform apply` again. Our recent fixes with `depends_on` and `timeouts` should make this rare.
    2.  **Check Dependencies**: If this happens repeatedly for the same resource, it means a `depends_on` block is likely missing in the Terraform code, and we should add one to enforce the correct creation order.

### Issue 4: "SKU does not support Virtual Network Integration"

-   **Symptom**: You see an error `SKU '' does not support Virtual Network Integration`.
-   **Cause**: The App Service Plan's pricing tier (SKU) is too low to support being connected to a Virtual Network. The Free (`F1`) tier does not support VNet integration.
-   **Solution**: Upgrade the SKU in `main.tf`. The lowest-cost SKU that supports VNet integration is `B1` (Basic).
    ```hcl
    # in main.tf
    resource "azurerm_service_plan" "api" {
      # ...
      sku_name = var.environment == "dev" ? "B1" : "P1v2" # B1 for dev, P1v2 for prod
      # ...
    }
    ```
    Then, re-run `terraform apply`.