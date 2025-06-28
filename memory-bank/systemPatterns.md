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

### 1. Azure CDN Complex Deployment Pattern (ADVANCED) ⭐ NEW
**The most sophisticated infrastructure deployment pattern for handling Azure provider limitations.**

**Problem**: Azure CDN origin changes force complete resource replacement, creating complex dependency deadlocks with DNS and custom domains.

**Challenge Scenario**:
```bash
# This simple change forces complete resource replacement
resource "azurerm_cdn_endpoint" "get" {
  origin {
-   host_name = azurerm_storage_account.cli.primary_blob_host
+   host_name = azurerm_storage_account.cli.primary_web_host
  }
}

# Results in forced replacement chain:
# 1. azurerm_cdn_endpoint.get must be replaced
# 2. azurerm_cdn_endpoint_custom_domain.get must be replaced  
# 3. DNS CNAME validation lock prevents deletion
```

**Advanced Solution Pattern**:
```bash
# Multi-stage deployment to break dependency deadlock

# STAGE 1: Remove DNS lock
terraform apply -target=-azurerm_dns_cname_record.get
# Temporarily removes CNAME record, breaking Azure's validation lock

# STAGE 2: Replace CDN infrastructure
terraform apply 
# Now Azure can delete old endpoint and create new one

# STAGE 3: Restore DNS configuration
terraform apply
# Restores CNAME record pointing to new endpoint

# STAGE 4: Verify and optimize
az cdn endpoint purge --content-paths "/*"
# Clear CDN cache to ensure immediate availability
```

**Critical Implementation Details**:
```terraform
# Comment/uncomment pattern for stage management
# resource "azurerm_dns_cname_record" "get" {
#   name                = "get"
#   zone_name           = azurerm_dns_zone.main.name
#   resource_group_name = azurerm_resource_group.main.name
#   ttl                 = 300
#   record              = module.cli_distribution.cdn_endpoint_hostname
# }

# Use this for STAGE 1, then uncomment for STAGE 3
```

**When to Use This Pattern**:
- Azure CDN endpoint origin changes
- Any forced replacement with complex dependencies
- DNS validation locks preventing resource deletion
- Custom domain SSL certificate dependencies

### 2. Hybrid CLI Distribution Pattern (INDUSTRY STANDARD) ⭐ NEW
**Professional CLI distribution architecture matching Docker, Kubernetes, AWS CLI standards.**

**Architecture**:
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Client   │    │  Branded CDN    │    │ GitHub Releases │
│                 │    │ get.product.com │    │  (Binaries)     │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          │ curl install.sh      │                      │
          │◄─────────────────────┤                      │
          │                      │                      │
          │ download binary      │                      │
          │◄─────────────────────┼──────────────────────┤
          │                      │                      │
```

**Install Script Pattern**:
```bash
#!/bin/sh
# Professional install script template

set -e

# Configuration
BINARY_NAME="km"
GITHUB_REPO="org/repo"
INSTALL_DIR="/usr/local/bin"

# Professional UX
info() { printf "\033[0;32m[INFO]\033[0m %s\n" "$1"; }
warn() { printf "\033[1;33m[WARN]\033[0m %s\n" "$1"; }
error() { printf "\033[0;31m[ERROR]\033[0m %s\n" "$1" >&2; exit 1; }
success() { printf "\033[0;34m[SUCCESS]\033[0m %s\n" "$1"; }

# Automatic platform detection
detect_platform() {
    OS=$(uname -s | tr '[:upper:]' '[:lower:]')
    ARCH=$(uname -m)
    
    case $OS in
        linux*)
            case $ARCH in
                x86_64) PLATFORM="linux-amd64" ;;
                aarch64|arm64) PLATFORM="linux-arm64" ;;
                *) error "Unsupported architecture: $ARCH" ;;
            esac
            ;;
        darwin*)
            case $ARCH in
                x86_64) PLATFORM="darwin-amd64" ;;
                arm64) PLATFORM="darwin-arm64" ;;
                *) error "Unsupported architecture: $ARCH" ;;
            esac
            ;;
        mingw*|cygwin*|msys*)
            PLATFORM="windows-amd64.exe"
            INSTALL_DIR="$HOME/bin"
            ;;
        *)
            error "Unsupported operating system: $OS"
            ;;
    esac
}

# Robust download with fallback
download_binary() {
    DOWNLOAD_URL="https://github.com/$GITHUB_REPO/releases/latest/download/$BINARY_NAME-$PLATFORM"
    
    info "Downloading $BINARY_NAME for $PLATFORM..."
    
    if command -v curl >/dev/null 2>&1; then
        curl -fsSL "$DOWNLOAD_URL" -o "$BINARY_PATH"
    elif command -v wget >/dev/null 2>&1; then
        wget -q "$DOWNLOAD_URL" -O "$BINARY_PATH"
    else
        error "Neither curl nor wget found. Please install one of them."
    fi
    
    # Verify download
    if [ ! -f "$BINARY_PATH" ]; then
        error "Download failed: binary not found"
    fi
    
    # Make executable
    chmod +x "$BINARY_PATH"
}

# Professional installation flow
main() {
    info "Installing $BINARY_NAME..."
    
    detect_platform
    create_install_dir
    download_binary
    verify_installation
    
    success "✅ $BINARY_NAME installed successfully!"
    info "🚀 Get started: $BINARY_NAME --help"
    info "📚 Documentation: https://product.com/docs"
}

main "$@"
```

**GitHub Release Automation**:
```yaml
name: Release CLI
on:
  push:
    tags: ['v*']

jobs:
  build:
    strategy:
      matrix:
        include:
          - os: ubuntu-latest
            goos: linux
            goarch: amd64
          - os: ubuntu-latest  
            goos: linux
            goarch: arm64
          - os: macos-latest
            goos: darwin
            goarch: amd64
          - os: macos-latest
            goos: darwin  
            goarch: arm64
          - os: windows-latest
            goos: windows
            goarch: amd64
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v4
        with:
          go-version: '1.24'
      
      - name: Build binary
        env:
          GOOS: ${{ matrix.goos }}
          GOARCH: ${{ matrix.goarch }}
        run: |
          BINARY_NAME="km"
          if [ "$GOOS" = "windows" ]; then
            BINARY_NAME="$BINARY_NAME.exe"
          fi
          go build -o "$BINARY_NAME-$GOOS-$GOARCH" ./cmd/km
      
      - name: Upload to release
        uses: softprops/action-gh-release@v1
        with:
          files: km-*
          generate_release_notes: true
```

**Infrastructure Configuration**:
```terraform
# CDN serves only install script (simple, reliable)
resource "azurerm_cdn_endpoint" "get" {
  name                = "cdne-${var.product}-get-${var.environment}"
  profile_name        = azurerm_cdn_profile.main.name
  resource_group_name = var.resource_group_name
  location            = "global"
  origin_host_header  = azurerm_storage_account.main.primary_web_host

  origin {
    name      = "storage-web"
    host_name = azurerm_storage_account.main.primary_web_host
  }

  # Simple caching - just for install script
  delivery_rule {
    name  = "CacheInstallScript"
    order = 1

    request_uri_condition {
      operator     = "Equal"
      match_values = ["/install.sh"]
    }

    cache_expiration_action {
      behavior = "Override"
      duration = "1.00:00:00"  # 1 hour cache
    }
  }

  tags = var.tags
}
```

**Benefits of Hybrid Pattern**:
- **Reliability**: GitHub Releases has 99.99% uptime vs custom infrastructure
- **Performance**: GitHub's global CDN optimized for binary distribution  
- **Cost**: Eliminates expensive binary storage and complex caching
- **Maintenance**: Zero operational overhead for binary distribution
- **Professional**: Installation UX matches industry leaders
- **Fallback**: Multiple distribution channels (CDN → GitHub → direct)

### 3. Terraform State Consistency Pattern (CRITICAL)
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

### 4. Azure Static Web Apps DNS Configuration Pattern (PRODUCTION PROVEN)

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

### 5. Orphaned Resource Cleanup Pattern (COST OPTIMIZATION)

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

### 6. Azure Static Web Apps Deployment Pattern

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

### 7. Clean Dependency Management Pattern

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

### 8. Transparent Proxy Pattern
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

### 9. Event Sourcing Pattern
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

### 10. Split OAuth Authentication Pattern
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

### 11. Feature Flag-Driven Architecture Pattern
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

### 12. Resource Suffix Management Pattern
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

### 13. Infrastructure Health Verification Pattern
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