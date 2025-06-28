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

### 3. Alternative: Use Environment Variables
For sensitive values, you can use environment variables instead:
```bash
export TF_VAR_db_admin_password="your_secure_password"
export TF_VAR_github_token="your_github_token"
export TF_VAR_subscription_id="your_subscription_id"
export TF_VAR_arm_client_id="your_client_id"
```

### 4. Run Terraform Commands
Always specify the variable file:
```bash
terraform plan -var-file=config/dev.tfvars
terraform apply -var-file=config/dev.tfvars
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