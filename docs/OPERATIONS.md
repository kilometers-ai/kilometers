# Production Operations Guide - Kilometers.ai

## Overview

This guide covers day-to-day operations, monitoring, and troubleshooting for the Kilometers.ai production environment on Azure.

## Architecture Overview

### Azure Resources
- **Resource Group**: `rg-kilometers-prod`
- **App Service**: `app-kilometers-api-{suffix}`
- **PostgreSQL**: `psql-kilometers-prod-{suffix}`
- **Key Vault**: `kv-kilometers-{suffix}`
- **Application Insights**: `ai-kilometers-prod-{suffix}`
- **Storage Account**: `stkilometers{suffix}`

### Network Configuration
- **API Endpoint**: `https://app-kilometers-api-{suffix}.azurewebsites.net`
- **Database**: Private endpoint within Azure VNet
- **Health Check**: `/health` endpoint for monitoring

## Monitoring & Alerting

### Application Insights Dashboards

#### Key Metrics to Monitor
- **Request Rate**: Requests per minute to API endpoints
- **Response Time**: P95 latency for all endpoints
- **Error Rate**: 4xx and 5xx response percentages
- **Database Performance**: Query execution times
- **Health Check Status**: `/health` endpoint availability

#### Critical Alerts
1. **API Downtime**: Health check fails for >2 minutes
2. **High Error Rate**: >5% 5xx errors in 5-minute window
3. **High Latency**: P95 >1000ms for 5 minutes
4. **Database Issues**: Connection failures or timeout errors

### Database Monitoring

#### PostgreSQL Metrics
- **Connection Count**: Active connections vs max limit
- **Query Performance**: Slow query detection (>1s)
- **Storage Usage**: Disk space utilization
- **Backup Status**: Daily backup completion

#### Common Queries
```sql
-- Check current connections
SELECT count(*) as connection_count 
FROM pg_stat_activity 
WHERE state = 'active';

-- Check database size
SELECT pg_size_pretty(pg_database_size('kilometers'));

-- Check recent events count
SELECT COUNT(*) as recent_events 
FROM events 
WHERE timestamp > NOW() - INTERVAL '1 hour';
```

## Deployment Procedures

### Standard Deployment
1. **Code Changes**: Push to `main` branch triggers CI/CD
2. **Infrastructure**: Terraform applies changes automatically
3. **API Deployment**: Zero-downtime deployment via App Service slots
4. **CLI Distribution**: Built automatically and uploaded as artifacts

### Rollback Procedure
```bash
# Emergency rollback using Azure CLI
az webapp deployment slot swap \
  --resource-group rg-kilometers-prod \
  --name app-kilometers-api-{suffix} \
  --slot staging \
  --action swap
```

### Manual Deployment
```bash
# If CI/CD fails, manual deployment steps:

# 1. Deploy infrastructure
cd terraform
terraform plan -out=tfplan
terraform apply tfplan

# 2. Deploy API
cd ../api/Kilometers.Api
dotnet publish -c Release -o publish
cd publish
zip -r ../deployment.zip .
cd ..

az webapp deployment source config-zip \
  --resource-group rg-kilometers-prod \
  --name app-kilometers-api-{suffix} \
  --src deployment.zip
```

## Troubleshooting

### Common Issues

#### API Not Responding
1. **Check App Service Status**:
   ```bash
   az webapp show \
     --resource-group rg-kilometers-prod \
     --name app-kilometers-api-{suffix} \
     --query "state"
   ```

2. **Check Application Logs**:
   ```bash
   az webapp log download \
     --resource-group rg-kilometers-prod \
     --name app-kilometers-api-{suffix}
   ```

3. **Restart App Service**:
   ```bash
   az webapp restart \
     --resource-group rg-kilometers-prod \
     --name app-kilometers-api-{suffix}
   ```

#### Database Connection Issues
1. **Check PostgreSQL Status**:
   ```bash
   az postgres flexible-server show \
     --resource-group rg-kilometers-prod \
     --name psql-kilometers-prod-{suffix}
   ```

2. **Check Firewall Rules**:
   ```bash
   az postgres flexible-server firewall-rule list \
     --resource-group rg-kilometers-prod \
     --server-name psql-kilometers-prod-{suffix}
   ```

3. **Test Connection String**:
   ```bash
   # Get connection string from Key Vault
   az keyvault secret show \
     --vault-name kv-kilometers-{suffix} \
     --name DatabaseConnectionString \
     --query "value" -o tsv
   ```

#### High Memory Usage
1. **Scale Up App Service**:
   ```bash
   az appservice plan update \
     --resource-group rg-kilometers-prod \
     --name asp-kilometers-prod-{suffix} \
     --sku P1V2
   ```

2. **Scale Out (Add Instances)**:
   ```bash
   az appservice plan update \
     --resource-group rg-kilometers-prod \
     --name asp-kilometers-prod-{suffix} \
     --number-of-workers 2
   ```

### Performance Optimization

#### Database Optimization
```sql
-- Create indexes for common queries
CREATE INDEX CONCURRENTLY idx_events_customer_timestamp 
ON events (customer_id, timestamp DESC);

CREATE INDEX CONCURRENTLY idx_events_method_risk 
ON events (customer_id, mcp_method) 
WHERE risk_level > 7;

-- Analyze query performance
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;
```

#### API Performance
- **Enable Output Caching**: For dashboard endpoints
- **Database Connection Pooling**: Monitor connection counts
- **Async Operations**: Ensure all database operations are async

## Security Operations

### Secret Management
- **Key Vault Access**: All secrets stored in Azure Key Vault
- **Connection Strings**: Retrieved via Key Vault references
- **API Keys**: Rotated monthly (automated)

### Security Monitoring
- **Failed Authentication**: Monitor unauthorized API access
- **SQL Injection**: Database query pattern analysis
- **DDoS Protection**: Azure App Service built-in protection

### Backup & Recovery

#### Database Backups
- **Automated Backups**: Daily at 2 AM UTC (7-day retention)
- **Point-in-Time Recovery**: Available for last 7 days
- **Manual Backup**:
  ```bash
  az postgres flexible-server backup create \
    --resource-group rg-kilometers-prod \
    --server-name psql-kilometers-prod-{suffix} \
    --backup-name manual-backup-$(date +%Y%m%d)
  ```

#### Configuration Backups
- **Terraform State**: Stored in Azure Storage with versioning
- **Application Settings**: Exported weekly via automation

## Cost Management

### Cost Monitoring
- **Budget Alerts**: Set at $100/month with alerts at 80%
- **Resource Tagging**: All resources tagged for cost tracking
- **Usage Analytics**: Monthly cost breakdown by service

### Cost Optimization
- **App Service**: Use Basic tier for MVP, scale as needed
- **Database**: Burstable tier with auto-pause for development
- **Storage**: LRS replication sufficient for MVP

## Maintenance Windows

### Scheduled Maintenance
- **Database Updates**: First Sunday of month, 2-4 AM UTC
- **App Service Platform**: Automatic updates during low-usage hours
- **SSL Certificates**: Auto-renewal via Azure managed certificates

### Emergency Contacts
- **Primary**: Engineering team via PagerDuty
- **Secondary**: Azure Support (Standard tier)
- **Escalation**: Technical leadership team

## Disaster Recovery

### Recovery Time Objectives (RTO)
- **API Service**: 15 minutes (restart App Service)
- **Database**: 1 hour (restore from backup)
- **Full Environment**: 4 hours (complete rebuild via Terraform)

### Recovery Procedures
1. **Assess Impact**: Determine scope of outage
2. **Activate Incident Response**: Notify stakeholders
3. **Execute Recovery**: Follow documented procedures
4. **Post-Incident Review**: Document lessons learned

---

*Last Updated*: December 2024
*Review Frequency*: Monthly
*Owner*: Engineering Team 