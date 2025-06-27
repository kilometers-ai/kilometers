# Kilometers Infrastructure Cost Optimization Guide

## Overview

This guide details all cost optimization measures implemented in the Terraform configuration, helping you minimize Azure costs while maintaining functionality.

## Cost Optimization Features

### 1. **Automatic Scaling & Shutdown** 🌙

#### App Service Scaling
- **Dev/Staging**: Scales to 0 instances during nights and weekends
- **Production**: Maintains minimum 1 instance but scales down during off-hours
- **Schedule**: 
  - Active: 6 AM - 8 PM EST weekdays
  - Reduced: Nights and weekends

```hcl
# Automatically configured based on environment
capacity {
  default = var.environment == "dev" ? 0 : 1  # Scale to zero for dev
  minimum = var.environment == "dev" ? 0 : 1
  maximum = 1
}
```

### 2. **SKU Optimization** 💰

| Resource | Dev | Staging | Prod | Monthly Savings |
|----------|-----|---------|------|-----------------|
| App Service | F1 (Free)* | B1 | B2 | ~$13-50 |
| PostgreSQL | B_Standard_B1ms | B_Standard_B1ms | B_Standard_B2ms | ~$25-50 |
| Storage | LRS | LRS | GRS | ~$5-10 |

*Free tier limited to 60 minutes/day, falls back to B1

### 3. **Application Insights Sampling** 📊

Reduces telemetry ingestion costs:
- **Dev**: 10% sampling (90% reduction)
- **Staging**: 25% sampling (75% reduction)  
- **Production**: 50% sampling (50% reduction)

```hcl
sampling_percentage = local.env_config.app_insights_sampling
retention_in_days = var.environment == "prod" ? 90 : 30
```

### 4. **Storage Lifecycle Management** 🗄️

Automatically moves old data to cheaper tiers:

```hcl
actions {
  base_blob {
    tier_to_cool_after_days    = 7      # Move to cool tier
    tier_to_archive_after_days = 30     # Move to archive tier
    delete_after_days          = 90     # Delete old data
  }
}
```

### 5. **Budget Alerts** 🚨

Multi-level budget monitoring:
- **80% Warning**: Notification email
- **100% Alert**: Urgent notification
- **120% Critical**: Multiple notifications

```hcl
notification {
  enabled   = true
  threshold = 80
  operator  = "GreaterThan"
  contact_emails = var.alert_email_addresses
}
```

### 6. **Cost Anomaly Detection** 🔍

Monitors for unusual activity that might incur costs:
- Tracks resource creation patterns
- Alerts on spikes in activity
- Hourly evaluation

## Implementation Steps

### 1. Update Your Variables

Add these to your `terraform.tfvars`:

```hcl
# Cost Management
monthly_budget_amount = 50  # Your monthly budget in USD
daily_cost_threshold  = 5   # Alert if daily costs exceed this
alert_email_addresses = ["your-email@example.com"]
cost_center          = "personal"  # or your department

# Cost Features
enable_free_tier     = true   # Use free tiers where available
enable_auto_shutdown = true   # Auto-shutdown during off hours
enable_cost_alerts   = true   # Enable all cost monitoring
```

### 2. Apply the Configuration

```bash
# Review the changes
terraform plan

# Apply with cost optimizations
terraform apply
```

### 3. Verify Cost Controls

After deployment, verify:
- Budget alerts are configured in Azure Cost Management
- Auto-scaling rules are active
- Application Insights sampling is enabled

## Expected Monthly Costs

### Development Environment
```
App Service (F1/B1):     $0-13   (free tier + scaling to zero)
PostgreSQL (B1ms):       $15     (with shutdown savings)
Storage:                 $2
Application Insights:    $0      (under free tier with sampling)
Key Vault:              $0      (under free tier)
-------------------------------------------------
Total:                  ~$17-30/month
```

### Production Environment
```
App Service (B2):        $35     (with night scaling)
PostgreSQL (B2ms):       $30
Storage (GRS):          $5
Application Insights:    $5      (with 50% sampling)
Key Vault:              $0-1
-------------------------------------------------
Total:                  ~$75-80/month
```

## Cost Monitoring Dashboard

### Azure Portal Views

1. **Cost Analysis**
   - Navigate to: Resource Group → Cost Analysis
   - Set up saved views for daily/weekly/monthly

2. **Budget Alerts**
   - Navigate to: Cost Management → Budgets
   - Review alert history and forecast

3. **Advisor Recommendations**
   - Navigate to: Advisor → Cost
   - Implement recommended optimizations

### Custom Queries

Monitor specific costs with these KQL queries:

```kql
// Daily cost by resource type
AzureActivity
| where TimeGenerated > ago(24h)
| where ActivityStatus == "Succeeded"
| summarize Cost = sum(ResponseCode) by ResourceProvider
| order by Cost desc

// Unusual activity detection
AzureActivity
| where TimeGenerated > ago(1h)
| where ActivityStatus == "Succeeded"
| summarize Count = count() by bin(TimeGenerated, 1h), ResourceProvider
| where Count > 10
```

## Additional Cost-Saving Tips

### 1. **Use Spot Instances** (Future)
For non-critical workloads, consider Azure Spot VMs (up to 90% savings)

### 2. **Reserved Instances** (When Stable)
After 6 months of stable usage, consider 1-year reserved instances (up to 40% savings)

### 3. **Dev/Test Pricing** (If Eligible)
Apply for Azure Dev/Test pricing through Visual Studio subscription

### 4. **GitHub Actions Optimization**
- Use path filters to avoid unnecessary builds
- Cache dependencies
- Use matrix builds efficiently

### 5. **Database Optimization**
- Use connection pooling
- Implement query caching
- Regular index maintenance

## Troubleshooting Cost Issues

### High Costs Checklist

1. **Check Auto-Scaling**
   ```bash
   az monitor autoscale show --name autoscale-kilometers-dev --resource-group rg-kilometers-dev
   ```

2. **Review Storage Usage**
   ```bash
   az storage metrics show --account-name stkilometersdev
   ```

3. **Analyze Application Insights**
   - Check sampling percentage
   - Review data ingestion volume

4. **Database Connections**
   - Ensure connection pooling
   - Check for connection leaks

### Emergency Cost Reduction

If costs spike unexpectedly:

```bash
# 1. Scale down immediately
az appservice plan update --name asp-kilometers-dev --sku F1

# 2. Stop non-critical resources
az postgres server stop --name kilometers-dev-psql

# 3. Reduce replicas
az webapp update --name app-kilometers-api-dev --minimum-elastic-instance-count 0
```

## ROI Calculation

### Without Optimization
```
Standard Setup:         ~$150/month
Annual Cost:           $1,800
```

### With Optimization
```
Optimized Setup:       ~$45/month (70% reduction)
Annual Cost:           $540
Annual Savings:        $1,260
```

## Next Steps

1. **Monitor First Month**
   - Review actual vs projected costs
   - Adjust scaling schedules based on usage

2. **Optimize Further**
   - Analyze Application Insights data
   - Identify unused resources
   - Consider architectural improvements

3. **Plan for Growth**
   - Set up cost forecasting
   - Plan reserved instance purchases
   - Design for cost-efficient scaling

Remember: The best optimization is the one that balances cost with your actual needs. Start conservative and optimize based on real usage data! 📊💰