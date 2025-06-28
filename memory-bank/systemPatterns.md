# System Patterns: Kilometers.ai

## Overall Architecture

### Multi-App System Design
```
┌─────────────────┐                      ┌─────────────────┐
│  Marketing Site │    GitHub OAuth      │   Main App      │
│ (Next.js/Azure) │◄────initiate─────────│ (React/Azure)   │
│ kilometers.ai   │                      │app.kilometers.ai│
└─────────────────┘                      └─────────┬───────┘
                                                   │
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│   AI Client     │    │  km CLI      │    │  MCP Server     │
│ (Cursor/Claude) │◄──►│   Wrapper    │◄──►│ (GitHub/Slack)  │
└─────────────────┘    └──────┬───────┘    └─────────────────┘
                              │
                              ▼ HTTPS
                    ┌─────────────────┐
                    │  Azure API      │
                    │  (.NET 9)       │
                    └─────────┬───────┘
                              │
                              ▼
                    ┌─────────────────┐    ┌─────────────────┐
                    │   PostgreSQL    │    │  React Dashboard│
                    │  Event Store    │    │   (Static SPA)  │
                    └─────────────────┘    └─────────────────┘
```

## Infrastructure Patterns

### 1. Terraform State Consistency Pattern (CRITICAL)
**The most important pattern for reliable infrastructure management.**

```hcl
# Problem: State drift causes infrastructure chaos
# Solution: Consistent state management workflow

# ALWAYS verify state before major changes
terraform refresh -var-file=config/dev.tfvars

# Use targeted applies for new resources
terraform apply -target=module.new_resource -var-file=config/dev.tfvars

# Import existing resources when state is out of sync
terraform import -var-file=config/dev.tfvars azurerm_resource_group.main /subscriptions/.../resourceGroups/rg-name

# Check for resource naming mismatches
az resource list --resource-group rg-name --query "[].{Name:name, Type:type}"
```

**State Drift Detection Pattern:**
```bash
# Compare Terraform expectations vs Azure reality
terraform plan -var-file=config/dev.tfvars | grep "will be created"
# If seeing recreation of existing resources → STATE DRIFT DETECTED

# Fix with refresh and targeted import
terraform refresh -var-file=config/dev.tfvars
terraform import -var-file=config/dev.tfvars resource.name resource_id
```

### 2. Azure Static Web Apps DNS Configuration Pattern (PRODUCTION PROVEN)

**Critical Discovery**: Azure Static Web Apps requires different validation methods for different domain types.

```terraform
# Domain Classification Logic
locals {
  all_custom_domains = var.custom_domains
  
  # Apex domain: has exactly one dot (e.g., "kilometers.ai")  
  # Subdomain: has more than one dot (e.g., "www.kilometers.ai")
  apex_domains = [for domain in local.all_custom_domains : domain if length(split(".", domain)) == 2]
  subdomain_domains = [for domain in local.all_custom_domains : domain if length(split(".", domain)) > 2]
}

# Apex domains MUST use dns-txt-token validation
resource "azurerm_static_web_app_custom_domain" "apex_domains" {
  for_each          = toset(local.apex_domains)
  static_web_app_id = azurerm_static_web_app.marketing.id
  domain_name       = each.value
  validation_type   = "dns-txt-token"  # Required - CNAME conflicts with NS/SOA/MX records
}

# Subdomains can use cname-delegation validation  
resource "azurerm_static_web_app_custom_domain" "subdomain_domains" {
  for_each          = toset(local.subdomain_domains)
  static_web_app_id = azurerm_static_web_app.marketing.id
  domain_name       = each.value
  validation_type   = "cname-delegation"  # Works for subdomains
}
```

**DNS Record Configuration:**
```terraform
# Apex domain uses A record (not CNAME) - Azure alias record
resource "azurerm_dns_a_record" "apex" {
  name                = "@"
  zone_name           = azurerm_dns_zone.main.name
  resource_group_name = azurerm_resource_group.main.name
  ttl                 = 300
  target_resource_id  = azurerm_static_web_app.marketing.id  # Azure alias record
}

# Subdomains use CNAME records
resource "azurerm_dns_cname_record" "www" {
  name                = "www"
  zone_name           = azurerm_dns_zone.main.name
  resource_group_name = azurerm_resource_group.main.name
  ttl                 = 300
  record              = azurerm_static_web_app.marketing.default_host_name
}
```

### 3. Orphaned Resource Cleanup Pattern (COST OPTIMIZATION)

**Problem**: When `random_id.suffix` changes, resources with old suffix become orphaned in Azure but not tracked in Terraform state.

```bash
# Detection Pattern
ORPHANED_SUFFIX="old_suffix_value"
az resource list --query "[?contains(name, '$ORPHANED_SUFFIX')]" --output table

# Safe Deletion Order (respecting Azure dependencies)
# 1. Static Web Apps (no dependencies)
# 2. Application Insights (no dependencies)  
# 3. App Service Plans (no web apps using them)
# 4. Storage Accounts (no services using them)
# 5. Log Analytics Workspaces (managed resources, delete last)

# Automated Cleanup Script Pattern
delete_resource() {
    local resource_id="$1"
    local resource_name="$2"
    
    echo "🗑️  Deleting: $resource_name"
    if az resource delete --ids "$resource_id" --output none; then
        echo "   ✅ Successfully deleted: $resource_name"
    else
        echo "   ❌ Failed to delete: $resource_name"
        return 1
    fi
}

# Get orphaned resources and delete in safe order
ORPHANED_RESOURCES=$(az resource list \
    --query "[?contains(name, '$ORPHANED_SUFFIX')].{id:id,name:name,type:type}" \
    --output json)
```

### 4. Azure Static Web Apps Deployment Pattern

```yaml
# GitHub Actions workflow for Azure Static Web Apps
name: Azure Static Web Apps CI/CD
on:
  push:
    branches: [main]
    paths: ['marketing/**']  # Path-based triggering

jobs:
  build_and_deploy:
    defaults:
      run:
        working-directory: ./marketing  # Scoped to marketing directory
    
    steps:
      - name: Build Application
        run: npm run build:azure  # Static export for Azure
        env:
          # All feature flags injected at build time
          NEXT_PUBLIC_USE_EXTERNAL_APP: ${{ secrets.NEXT_PUBLIC_USE_EXTERNAL_APP }}
          # ... 13 more environment variables
      
      - name: Deploy to Azure
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          app_location: "/marketing"
          output_location: "out"
```

### 5. Clean Dependency Management Pattern

```json
// Problem: Conflicting peer dependencies break builds
// Solution: Remove unused dependencies instead of workarounds

// ❌ BAD: Using workarounds
{
  "dependencies": {
    "date-fns": "4.1.0",
    "react-day-picker": "8.10.1"  // Requires date-fns@^2.28.0 || ^3.0.0
  }
}
// + .npmrc with legacy-peer-deps=true

// ✅ GOOD: Clean dependency tree
{
  "dependencies": {
    // Only packages actually being used
    "lucide-react": "^0.454.0",  // For Calendar icon
    "next": "15.2.4",
    "react": "^19"
    // date-fns and react-day-picker removed
  }
}
```

**Dependency Audit Pattern:**
```bash
# Before adding dependencies, verify usage
grep -r "import.*packagename" src/
grep -r "from.*packagename" src/

# Remove if no matches found
npm uninstall packagename
```

## Core Architecture Principles

### 6. Transparent Proxy Pattern
The CLI acts as a transparent proxy, intercepting and forwarding MCP communication without modification.

```go
// CLI Pattern: Transparent Monitoring
func main() {
    // Start wrapped MCP server
    cmd := exec.Command(os.Args[1], os.Args[2:]...)
    
    // Create monitored pipes
    stdinPipe, _ := cmd.StdinPipe()
    stdoutPipe, _ := cmd.StdoutPipe()
    
    // Monitor bidirectional communication
    go monitorInput(os.Stdin, stdinPipe)   // AI → MCP
    go monitorOutput(stdoutPipe, os.Stdout) // MCP → AI
    
    cmd.Wait()
}
```

### 7. Event Sourcing Pattern
All interactions are captured as immutable events, enabling replay and analysis.

```csharp
// Event Sourcing: Immutable Events
public record MpcEvent
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public DateTime Timestamp { get; init; } = DateTime.UtcNow;
    public string Direction { get; init; } // "request" | "response"
    public JsonDocument Payload { get; init; }
    public string CustomerId { get; init; }
    public EventMetadata Metadata { get; init; }
}
```

## Marketing Site Architecture Patterns

### 8. Split OAuth Authentication Pattern
The marketing site initiates OAuth but the main application handles completion and token management.

```typescript
// Marketing Site: OAuth Initiation
export function middleware(request: NextRequest) {
  const useExternalApp = process.env.NEXT_PUBLIC_USE_EXTERNAL_APP === "true"
  const externalAppUrl = process.env.NEXT_PUBLIC_EXTERNAL_APP_URL
  
  // Routes that should redirect to external app when feature flag is enabled
  const appRoutes = ["/dashboard", "/onboarding", "/billing"]
  
  if (useExternalApp && appRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )) {
    const redirectUrl = new URL(
      request.nextUrl.pathname + request.nextUrl.search, 
      externalAppUrl
    )
    return NextResponse.redirect(redirectUrl)
  }
}
```

### 9. Feature Flag-Driven Architecture Pattern
Environment variables control behavior across development and production environments.

```bash
# Critical OAuth Configuration
NEXT_PUBLIC_USE_EXTERNAL_APP=true  # MUST be true for production OAuth flow
NEXT_PUBLIC_EXTERNAL_APP_URL=https://app.kilometers.ai

# UI Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_SHOW_COOKIE_BANNER=true
NEXT_PUBLIC_ENABLE_CONTACT_FORM=false

# Connection Verification System (14 flags total)
NEXT_PUBLIC_ENABLE_REAL_CONNECTION_CHECK=false
NEXT_PUBLIC_CONNECTION_CHECK_METHOD=polling
# ... additional connection flags
```

## Production Deployment Patterns

### 10. Resource Suffix Management Pattern
Use `random_id.suffix` for unique resource naming while managing lifecycle properly.

```terraform
# Generate unique suffix for resource names
resource "random_id" "suffix" {
  byte_length = 4
}

locals {
  resource_suffix = random_id.suffix.hex  # e.g., "80aa4338"
  # All resources use this suffix for unique naming
}

# Critical: When changing suffix, expect ALL dependent resources to be recreated
# Use targeted applies to manage deployment safely
```

### 11. Infrastructure Health Verification Pattern
Verify infrastructure deployment success with automated checks.

```bash
# Post-deployment verification checklist
# 1. API Health Check
curl -f https://app-myapp-api-dev-${SUFFIX}.azurewebsites.net/health

# 2. DNS Resolution Verification  
nslookup myapp.com
nslookup www.myapp.com
nslookup api.dev.myapp.com

# 3. SSL Certificate Validation
openssl s_client -connect myapp.com:443 -servername myapp.com < /dev/null

# 4. Database Connectivity
psql "$CONNECTION_STRING" -c "SELECT 1;"

# 5. Storage Account Accessibility
az storage blob list --account-name "storage${SUFFIX}" --container-name releases
```

---

## Production Lessons (June 27, 2025)

### DNS Configuration Debugging
**Issue**: Static Web App custom domain validation fails with cryptic error messages
**Root Cause**: Azure requires different validation methods for apex vs subdomain domains  
**Solution**: Implement domain classification logic and use appropriate validation types

### Resource Cleanup Automation
**Issue**: Manual resource cleanup is error-prone and misses dependencies
**Solution**: Automated cleanup script with proper dependency ordering and error handling
**Impact**: Recovered $18-28/month in wasted infrastructure costs

### Terraform State Synchronization
**Issue**: State file inconsistency causes Terraform to try recreating existing resources
**Solution**: Always run `terraform refresh` before major operations and use targeted applies
**Critical**: State drift is the #1 cause of infrastructure deployment failures

*Last Updated: June 27, 2025 - After production deployment and infrastructure optimization* 