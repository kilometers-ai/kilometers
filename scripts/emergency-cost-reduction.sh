#!/bin/bash
# Emergency script to immediately reduce Azure costs

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${RED}=== EMERGENCY COST REDUCTION SCRIPT ===${NC}"
echo -e "${YELLOW}This will temporarily shut down or minimize resources!${NC}"
echo ""

# Get resource group
RG_NAME=${1:-$(terraform output -raw resource_group_name 2>/dev/null || echo "rg-kilometers-dev")}

echo "Resource Group: $RG_NAME"
echo ""
echo "This script will:"
echo "  - Scale App Service to FREE tier (F1)"
echo "  - Stop PostgreSQL server"
echo "  - Reduce all replicas to 0"
echo "  - Pause non-essential services"
echo ""
read -p "Continue? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi

echo ""
echo -e "${YELLOW}Starting cost reduction...${NC}"

# 1. Scale down App Service Plan
echo "1. Scaling App Service to FREE tier..."
APP_PLAN=$(az appservice plan list --resource-group $RG_NAME --query "[0].name" -o tsv 2>/dev/null || echo "")
if [ ! -z "$APP_PLAN" ]; then
    az appservice plan update \
        --name "$APP_PLAN" \
        --resource-group $RG_NAME \
        --sku F1 \
        --number-of-workers 1 \
        2>/dev/null || echo "  Failed to scale App Service"
    echo -e "${GREEN}  ✓ App Service scaled to FREE tier${NC}"
else
    echo "  No App Service Plan found"
fi

# 2. Stop Web Apps
echo "2. Stopping Web Apps..."
APPS=$(az webapp list --resource-group $RG_NAME --query "[].name" -o tsv 2>/dev/null || echo "")
for app in $APPS; do
    echo "  Stopping $app..."
    az webapp stop --name "$app" --resource-group $RG_NAME 2>/dev/null || echo "  Failed to stop $app"
done
echo -e "${GREEN}  ✓ Web Apps stopped${NC}"

# 3. Stop PostgreSQL
echo "3. Stopping PostgreSQL servers..."
POSTGRES=$(az postgres flexible-server list --resource-group $RG_NAME --query "[].name" -o tsv 2>/dev/null || echo "")
for server in $POSTGRES; do
    echo "  Stopping $server..."
    az postgres flexible-server stop \
        --name "$server" \
        --resource-group $RG_NAME \
        --no-wait \
        2>/dev/null || echo "  Failed to stop $server"
done
echo -e "${GREEN}  ✓ PostgreSQL servers stopped${NC}"

# 4. Disable Application Insights
echo "4. Minimizing Application Insights..."
AI=$(az monitor app-insights component list --resource-group $RG_NAME --query "[].name" -o tsv 2>/dev/null || echo "")
for component in $AI; do
    echo "  Setting sampling to 1% for $component..."
    az monitor app-insights component update \
        --app "$component" \
        --resource-group $RG_NAME \
        --sampling-percentage 1 \
        2>/dev/null || echo "  Failed to update $component"
done
echo -e "${GREEN}  ✓ Application Insights minimized${NC}"

# 5. Set auto-scaling to 0
echo "5. Setting auto-scaling to 0..."
SCALE_SETTINGS=$(az monitor autoscale list --resource-group $RG_NAME --query "[].name" -o tsv 2>/dev/null || echo "")
for setting in $SCALE_SETTINGS; do
    echo "  Updating $setting..."
    az monitor autoscale update \
        --name "$setting" \
        --resource-group $RG_NAME \
        --min-count 0 \
        --max-count 1 \
        --count 0 \
        2>/dev/null || echo "  Failed to update $setting"
done
echo -e "${GREEN}  ✓ Auto-scaling minimized${NC}"

echo ""
echo -e "${GREEN}=== COST REDUCTION COMPLETE ===${NC}"
echo ""
echo "Estimated savings:"
echo "  - App Service: ~\$50/month → \$0/month"
echo "  - PostgreSQL: ~\$25/month → \$0/month"
echo "  - App Insights: ~\$5/month → ~\$0.50/month"
echo "  - Total: ~75/month saved"
echo ""
echo -e "${YELLOW}⚠ IMPORTANT: Services are now STOPPED!${NC}"
echo ""
echo "To restore services, run:"
echo "  ./scripts/restore-services.sh $RG_NAME"
echo ""

# Create restore script
cat > ./scripts/restore-services.sh << EOF
#!/bin/bash
# Restore services after emergency shutdown

RG_NAME=\${1:-$RG_NAME}

echo "Restoring services for \$RG_NAME..."

# Start Web Apps
az webapp list --resource-group \$RG_NAME --query "[].name" -o tsv | while read app; do
    echo "Starting \$app..."
    az webapp start --name "\$app" --resource-group \$RG_NAME
done

# Start PostgreSQL
az postgres flexible-server list --resource-group \$RG_NAME --query "[].name" -o tsv | while read server; do
    echo "Starting \$server..."
    az postgres flexible-server start --name "\$server" --resource-group \$RG_NAME
done

# Restore App Service Plan
az appservice plan list --resource-group \$RG_NAME --query "[0].name" -o tsv | while read plan; do
    echo "Restoring \$plan to B1..."
    az appservice plan update --name "\$plan" --resource-group \$RG_NAME --sku B1
done

# Restore auto-scaling
az monitor autoscale list --resource-group \$RG_NAME --query "[].name" -o tsv | while read setting; do
    echo "Restoring auto-scaling for \$setting..."
    az monitor autoscale update --name "\$setting" --resource-group \$RG_NAME --min-count 1 --max-count 2 --count 1
done

echo "✓ Services restored!"
EOF

chmod +x ./scripts/restore-services.sh

echo -e "${GREEN}Restore script created at: ./scripts/restore-services.sh${NC}"