#!/bin/bash
# Quick script to check current Azure costs and optimization status

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}=== Kilometers Infrastructure Cost Status ===${NC}"
echo ""

# Get resource group from terraform output
RG_NAME=$(terraform output -raw resource_group_name 2>/dev/null || echo "rg-kilometers-dev")

# Check current month costs
echo -e "${YELLOW}Current Month Costs:${NC}"
CURRENT_COST=$(az consumption usage list \
  --start-date $(date +%Y-%m-01) \
  --end-date $(date +%Y-%m-%d) \
  --query "[?contains(resourceGroup, '$RG_NAME')] | [0].pretaxCost" \
  -o tsv 2>/dev/null || echo "0")

echo "Resource Group: $RG_NAME"
echo "Month-to-date cost: \$$CURRENT_COST"
echo ""

# Check auto-scaling status
echo -e "${YELLOW}Auto-Scaling Status:${NC}"
SCALE_SETTINGS=$(az monitor autoscale list \
  --resource-group $RG_NAME \
  --query "[0].{name:name, enabled:enabled, profiles:profiles[0].capacity}" \
  -o json 2>/dev/null || echo "{}")

if [ "$SCALE_SETTINGS" != "{}" ]; then
    echo "$SCALE_SETTINGS" | jq -r '"Enabled: \(.enabled)"'
    echo "$SCALE_SETTINGS" | jq -r '"Current capacity: \(.profiles.minimum)-\(.profiles.maximum)"'
else
    echo "No auto-scaling configured"
fi
echo ""

# Check App Service status
echo -e "${YELLOW}App Service Status:${NC}"
APP_STATUS=$(az webapp list \
  --resource-group $RG_NAME \
  --query "[0].{name:name, state:state, sku:sku.name}" \
  -o json 2>/dev/null || echo "{}")

if [ "$APP_STATUS" != "{}" ]; then
    echo "$APP_STATUS" | jq -r '"Name: \(.name)"'
    echo "$APP_STATUS" | jq -r '"State: \(.state)"'
    echo "$APP_STATUS" | jq -r '"SKU: \(.sku)"'
    
    # Calculate potential savings
    SKU=$(echo "$APP_STATUS" | jq -r '.sku')
    if [[ "$SKU" == "B1" ]]; then
        echo -e "${GREEN}✓ Using Basic tier (cost-optimized)${NC}"
    elif [[ "$SKU" == "F1" ]]; then
        echo -e "${GREEN}✓ Using Free tier (maximum savings)${NC}"
    else
        echo -e "${YELLOW}! Consider downgrading to B1 or F1 for cost savings${NC}"
    fi
else
    echo "No App Service found"
fi
echo ""

# Check Database status
echo -e "${YELLOW}PostgreSQL Status:${NC}"
DB_STATUS=$(az postgres flexible-server list \
  --resource-group $RG_NAME \
  --query "[0].{name:name, state:state, sku:sku.name, tier:sku.tier}" \
  -o json 2>/dev/null || echo "{}")

if [ "$DB_STATUS" != "{}" ]; then
    echo "$DB_STATUS" | jq -r '"Name: \(.name)"'
    echo "$DB_STATUS" | jq -r '"State: \(.state)"'
    echo "$DB_STATUS" | jq -r '"SKU: \(.sku)"'
    
    # Check if it's burstable
    if [[ $(echo "$DB_STATUS" | jq -r '.tier') == "Burstable" ]]; then
        echo -e "${GREEN}✓ Using Burstable tier (cost-optimized)${NC}"
    fi
else
    echo "No PostgreSQL server found"
fi
echo ""

# Check Application Insights
echo -e "${YELLOW}Application Insights:${NC}"
AI_SAMPLING=$(az monitor app-insights component show \
  --resource-group $RG_NAME \
  --query "[0].samplingPercentage" \
  -o tsv 2>/dev/null || echo "100")

echo "Sampling rate: ${AI_SAMPLING}%"
if [ "$AI_SAMPLING" -lt "100" ]; then
    SAVINGS=$((100 - AI_SAMPLING))
    echo -e "${GREEN}✓ Sampling enabled (${SAVINGS}% cost reduction)${NC}"
else
    echo -e "${YELLOW}! Consider enabling sampling to reduce costs${NC}"
fi
echo ""

# Budget status
echo -e "${YELLOW}Budget Alerts:${NC}"
BUDGETS=$(az consumption budget list \
  --resource-group $RG_NAME \
  --query "[0].{name:name, amount:amount, timeGrain:timeGrain, currentSpend:currentSpend.amount}" \
  -o json 2>/dev/null || echo "{}")

if [ "$BUDGETS" != "{}" ]; then
    echo "$BUDGETS" | jq -r '"Budget: $\(.amount) \(.timeGrain)"'
    CURRENT=$(echo "$BUDGETS" | jq -r '.currentSpend // 0')
    BUDGET=$(echo "$BUDGETS" | jq -r '.amount')
    PERCENT=$(awk "BEGIN {printf \"%.0f\", ($CURRENT/$BUDGET)*100}")
    echo "Current spend: \$$CURRENT ($PERCENT%)"
    
    if [ "$PERCENT" -gt "80" ]; then
        echo -e "${RED}⚠ Warning: Approaching budget limit!${NC}"
    else
        echo -e "${GREEN}✓ Within budget${NC}"
    fi
else
    echo -e "${YELLOW}! No budget configured${NC}"
fi
echo ""

# Cost recommendations
echo -e "${YELLOW}Cost Optimization Recommendations:${NC}"
RECOMMENDATIONS=$(az advisor recommendation list \
  --resource-group $RG_NAME \
  --category Cost \
  --query "[].{impact:impact, description:shortDescription.problem}" \
  -o json 2>/dev/null || echo "[]")

if [ "$RECOMMENDATIONS" != "[]" ]; then
    echo "$RECOMMENDATIONS" | jq -r '.[] | "- [\(.impact)] \(.description)"'
else
    echo -e "${GREEN}✓ No cost optimization recommendations${NC}"
fi

echo ""
echo -e "${GREEN}=== End of Cost Report ===${NC}"

# Summary
echo ""
echo "💡 Quick actions to reduce costs:"
echo "  1. Enable auto-scaling: az monitor autoscale create ..."
echo "  2. Use Free/Basic tiers: az appservice plan update --sku F1 ..."
echo "  3. Enable AI sampling: Update terraform variable"
echo "  4. Set up budgets: Use terraform cost optimization module"