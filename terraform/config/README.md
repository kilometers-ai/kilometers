# Terraform Configuration Setup

## Security Notice
**NEVER commit `.tfvars` files containing real passwords, tokens, or sensitive data to git!**

## Setup Instructions

### 1. Create Development Configuration
```bash
cp dev.tfvars.example dev.tfvars
```

### 2. Edit dev.tfvars with Your Values
Replace all placeholder values with your actual configuration:
- `YOUR_AZURE_SUBSCRIPTION_ID` - Your Azure subscription ID
- `YOUR_SERVICE_PRINCIPAL_CLIENT_ID` - Your service principal client ID  
- `YOUR_SECURE_DATABASE_PASSWORD` - A strong database password
- `YOUR_IP_ADDRESS` - Your current IP address (get with `curl -4 -s ifconfig.me`)
- `YOUR_GITHUB_ORG` - Your GitHub organization name
- `YOUR_GITHUB_REPO` - Your GitHub repository name
- `YOUR_GITHUB_TOKEN` - Your GitHub personal access token

### 3. RECOMMENDED: Use Environment Variables (More Secure)
For maximum security, use environment variables for sensitive values:

#### One-time setup (add to `~/.zshrc` or `~/.bashrc`):
```bash
export TF_VAR_subscription_id="your_subscription_id"
export TF_VAR_arm_client_id="your_client_id"  
export TF_VAR_db_admin_password="your_secure_password"
export TF_VAR_github_token="your_github_token"
```

#### Create minimal dev.tfvars with only non-sensitive values:
```bash
# Only put non-sensitive configuration in dev.tfvars
environment = "dev"
location = "Central US"
db_admin_username = "pgadmin"
allowed_ip_ranges = ["YOUR_IP/32"]
github_organization = "kilometers-ai"
github_repository = "kilometers"
api_version = "1.0.0"
```

#### Benefits of environment variables:
- ✅ Secrets never touch the filesystem
- ✅ Works seamlessly with CI/CD
- ✅ Prevents accidental commits
- ✅ Easy to rotate credentials
- ✅ Supports different environments

### 4. Run Terraform Commands
Always specify the variable file:
```bash
terraform plan -var-file=config/dev.tfvars
terraform apply -var-file=config/dev.tfvars
```

## Common Setup Patterns

### Pattern A: Environment Variables Only (Most Secure)
```bash
# 1. Set environment variables
export TF_VAR_subscription_id="b902128f-2e17-43c6-8ba5-49bf19e3f82b"
export TF_VAR_arm_client_id="df6270a5-7c97-4c9a-ac19-a1da3d52223e"
export TF_VAR_db_admin_password="MySecurePassword123!"
export TF_VAR_github_token="ghp_your_token_here"

# 2. Create minimal dev.tfvars (no secrets)
cat > dev.tfvars << EOF
environment = "dev"
location = "Central US"
db_admin_username = "pgadmin"
allowed_ip_ranges = ["$(curl -4 -s ifconfig.me)/32"]
github_organization = "kilometers-ai"
github_repository = "kilometers"
api_version = "1.0.0"
EOF

# 3. Run terraform (env vars automatically used)
terraform plan -var-file=config/dev.tfvars
```

### Pattern B: Mixed Approach (Good for Development)
```bash
# 1. Put most values in dev.tfvars
cp dev.tfvars.example dev.tfvars
# Edit dev.tfvars with non-sensitive values

# 2. Override sensitive values with env vars
export TF_VAR_db_admin_password="MySecurePassword123!"
export TF_VAR_github_token="ghp_your_token_here"

# 3. Run terraform 
terraform plan -var-file=config/dev.tfvars
```

### Pattern C: Command Line Override (CI/CD Friendly)
```bash
# Useful for automation where you want explicit control
terraform plan \
  -var-file=config/dev.tfvars \
  -var="db_admin_password=$SECRET_PASSWORD" \
  -var="github_token=$GITHUB_TOKEN"
```

## Files in This Directory

| File | Purpose | Git Status |
|------|---------|------------|
| `dev.tfvars.example` | Template with placeholders | ✅ Committed |
| `dev.tfvars` | Your actual values | ❌ NEVER commit |
| `prod.tfvars.example` | Production template | ✅ Committed |
| `prod.tfvars` | Production values | ❌ NEVER commit |
| `backend-dev.hcl` | Backend config for dev | ✅ Committed |
| `backend-prod.hcl` | Backend config for prod | ✅ Committed |

## Security Best Practices

1. **Always use strong passwords** (minimum 12 characters, mixed case, numbers, symbols)
2. **Rotate secrets regularly** (passwords, tokens, API keys)
3. **Use least-privilege access** (only grant necessary permissions)
4. **Monitor for exposed secrets** (GitHub secret scanning, pre-commit hooks)
5. **Use environment variables** for CI/CD pipelines instead of storing secrets in files

## Getting Your Current IP Address
```bash
curl -4 -s ifconfig.me
```

Add `/32` to the end for a single IP, or use a CIDR range for multiple IPs. 