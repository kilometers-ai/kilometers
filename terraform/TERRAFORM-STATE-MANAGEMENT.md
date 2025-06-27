# Terraform State Management Guide

## 🚨 Critical Lessons Learned (June 27, 2025)

This document captures critical operational knowledge for managing Terraform state safely and preventing infrastructure chaos.

## The Problem: State Drift Catastrophe

### What Happened
During deployment of Azure Static Web Apps infrastructure, Terraform planned to **recreate the entire infrastructure** (49 resources) instead of just adding the new Static Web Apps module.

### Root Cause Analysis
1. **Initial Deployment**: Terraform generated `random_id.suffix = "6e7c8c35"`
2. **Previous Session**: New deployment generated `random_id.suffix = "689ad020"` 
3. **State Inconsistency**: State file contained old suffix, but Azure resources had new suffix

```hcl
# The cascade effect - ALL resources use the random suffix
resource "azurerm_linux_web_app" "api" {
  name = "app-${local.project_name}-api-${local.environment}-${random_id.suffix.hex}"
  #      app-kilometers-api-dev-6e7c8c35 ❌ (in state, doesn't exist)
  #      app-kilometers-api-dev-689ad020 ✅ (in Azure, exists)
}
```

### Why This Was Catastrophic
- Terraform thought all existing resources were **deleted** (old names don't exist in Azure)
- Plan wanted to **recreate everything** with new names
- Running `apply` would have **destroyed production infrastructure**

## 🛡️ Prevention Strategies

### 1. MANDATORY: Always Use Variable Files

```bash
# ✅ ALWAYS do this
terraform plan -var-file=config/dev.tfvars
terraform apply -var-file=config/dev.tfvars  
terraform import -var-file=config/dev.tfvars

# ❌ NEVER do this (causes configuration drift)
terraform plan
terraform apply
terraform import
```

**Why**: Ensures consistent configuration across all operations.

### 2. State Verification Workflow (Before Major Changes)

```bash
# Step 1: Refresh state to sync with Azure reality
terraform refresh -var-file=config/dev.tfvars

# Step 2: Run plan to check for unexpected changes  
terraform plan -var-file=config/dev.tfvars

# Step 3: Verify plan makes sense
# 🚨 RED FLAG: If plan shows recreation of existing resources → STOP!
# This indicates state drift - investigate before proceeding
```

### 3. Safe Infrastructure Expansion Pattern

```bash
# For adding new resources/modules
terraform apply -target=module.new_resource -var-file=config/dev.tfvars
terraform apply -target=github_actions_secret.new_secret -var-file=config/dev.tfvars

# ✅ Benefits:
# - Only touches NEW resources
# - Doesn't regenerate random IDs  
# - Avoids touching existing infrastructure
```

### 4. Cross-Reference with Azure Reality

```bash
# Before applying major changes, verify what exists
az resource list --resource-group rg-kilometers-dev --query "[].{Name:name, Type:type}"

# Compare with Terraform state
terraform state list

# Look for mismatches in resource names (different suffixes)
```

## 🚑 Recovery Procedures

### When State Drift is Detected

```bash
# Symptoms: Plan wants to recreate existing resources
terraform plan -var-file=config/dev.tfvars | grep "will be created"
# If you see existing resource names → STATE DRIFT DETECTED

# Recovery Steps:
# 1. Refresh state first
terraform refresh -var-file=config/dev.tfvars

# 2. If refresh doesn't fix it, import the correct resources
terraform import -var-file=config/dev.tfvars azurerm_linux_web_app.api \
  /subscriptions/SUBSCRIPTION_ID/resourceGroups/rg-kilometers-dev/providers/Microsoft.Web/sites/app-kilometers-api-dev-ACTUAL_SUFFIX

# 3. Remove old/incorrect state entries if needed
terraform state rm resource.old_name

# 4. Verify fix
terraform plan -var-file=config/dev.tfvars
# Should now show minimal/expected changes only
```

### Finding Azure Resource IDs for Import

```bash
# Get resource IDs for import commands
az resource list --resource-group rg-kilometers-dev \
  --query "[].{Name:name, Type:type, Id:id}" \
  --output table

# For specific resource types
az webapp list --resource-group rg-kilometers-dev \
  --query "[].{Name:name, Id:id}" \
  --output table
```

## 📋 Daily Operations Checklist

### Before Making Infrastructure Changes
- [ ] `terraform refresh -var-file=config/dev.tfvars`
- [ ] `terraform plan -var-file=config/dev.tfvars`
- [ ] Verify plan shows only expected changes
- [ ] Check for random ID regeneration (causes mass recreation)

### When Adding New Resources
- [ ] Use targeted apply: `terraform apply -target=module.new_resource -var-file=config/dev.tfvars`
- [ ] Verify existing resources aren't affected
- [ ] Add related secrets/configurations in separate targeted applies

### When Troubleshooting
- [ ] Compare `terraform state list` with `az resource list`
- [ ] Look for resource name mismatches (different random suffixes)
- [ ] Check if resources exist in Azure but not in state (import needed)
- [ ] Check if resources exist in state but not in Azure (remove from state)

## 🎯 Best Practices

### Random ID Management
- **Never delete** `random_id.suffix` from state without a replacement plan
- **Check dependencies** before modifying random IDs (many resources reference them)
- **Use lifecycle rules** to prevent accidental random ID changes:

```hcl
resource "random_id" "suffix" {
  byte_length = 4
  
  lifecycle {
    ignore_changes = [byte_length]
    prevent_destroy = true
  }
}
```

### Environment Configuration
- **Always use environment-specific variable files** (`config/dev.tfvars`, `config/prod.tfvars`)
- **Never mix environments** (dev state with prod variables, etc.)
- **Verify correct backend configuration** before major operations

### State File Safety
- **Remote backend only** (never use local state for shared infrastructure)
- **State locking enabled** (prevents concurrent modifications)
- **Regular state backups** (Azure Storage versioning provides this)
- **Access control** (limit who can modify production state)

## 🔧 Common Issues & Solutions

### Issue: "Plan wants to recreate everything"
**Cause**: State drift, usually from random ID changes
**Solution**: Refresh state, cross-reference with Azure, import missing resources

### Issue: "Resource already exists" during apply
**Cause**: Resource exists in Azure but not in state  
**Solution**: Import the existing resource into state

### Issue: "Resource not found" during plan/apply
**Cause**: Resource exists in state but was deleted from Azure
**Solution**: Remove from state or recreate the resource

### Issue: Different resource names than expected
**Cause**: Random suffix mismatch between state and reality
**Solution**: Import resources with correct names, remove old state entries

## 📚 Reference Commands

```bash
# State management
terraform state list
terraform state show resource.name
terraform state rm resource.name
terraform import -var-file=config/dev.tfvars resource.name azure_resource_id

# Azure resource discovery  
az resource list --resource-group rg-name
az resource show --ids resource_id

# Troubleshooting
terraform refresh -var-file=config/dev.tfvars
terraform plan -var-file=config/dev.tfvars
terraform validate

# Safe operations
terraform apply -target=resource.name -var-file=config/dev.tfvars
terraform destroy -target=resource.name -var-file=config/dev.tfvars
```

---

## 🎯 Key Takeaway

**The #1 cause of infrastructure chaos is Terraform state inconsistency.**

Always verify state matches reality before making changes. When in doubt, use targeted applies and cross-reference with Azure.

*Document created: June 27, 2025*  
*Last incident: State drift during Static Web Apps deployment*  
*Next review: After next major infrastructure change* 