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

### 2. Azure Static Web Apps Deployment Pattern

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

### 3. Clean Dependency Management Pattern

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

### 4. Transparent Proxy Pattern
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

### 5. Event Sourcing Pattern
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

### 6. Split OAuth Authentication Pattern
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

### 7. Feature Flag-Driven Architecture Pattern
Environment variables control behavior across development and production environments.

```typescript
// Feature Flag System: 14 Environment Variables
const getFeatureFlags = (): FeatureFlags => {
  if (typeof window === "undefined") {
    // Server-side: use environment variables
    return {
      USE_EXTERNAL_APP: process.env.NEXT_PUBLIC_USE_EXTERNAL_APP === "true",
      EXTERNAL_APP_URL: process.env.NEXT_PUBLIC_EXTERNAL_APP_URL || "https://app.kilometers.ai",
      ENABLE_GITHUB_OAUTH: process.env.NEXT_PUBLIC_ENABLE_GITHUB_OAUTH === "true",
      ENABLE_REAL_CONNECTION_CHECK: process.env.NEXT_PUBLIC_ENABLE_REAL_CONNECTION_CHECK === "true",
      ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS !== "false",
      SHOW_COOKIE_BANNER: process.env.NEXT_PUBLIC_SHOW_COOKIE_BANNER !== "false",
      ENABLE_CONTACT_FORM: process.env.NEXT_PUBLIC_ENABLE_CONTACT_FORM === "true",
      // ... 7 more connection verification flags
    }
  }
  return defaultFlags
}
```

### 8. Static Export Optimization Pattern

```javascript
// next.config.mjs - Azure Static Web Apps Configuration
export default {
  output: "export",          // Static export for CDN hosting
  trailingSlash: true,       // Consistent URL structure
  skipTrailingSlashRedirect: true,
  distDir: "out",            // Output directory for Azure
  images: {
    unoptimized: true        // Static hosting compatibility
  }
}
```

### 9. Client-Side Suspense Pattern
Components using client-side hooks are wrapped in Suspense for proper SSR/hydration.

```typescript
// Suspense Wrapper Pattern
import { Suspense } from 'react'

function OnboardingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OnboardingClient />
    </Suspense>
  )
}

function OnboardingClient() {
  const searchParams = useSearchParams() // Client-side hook
  // Component logic using searchParams
}
```

## Deployment Patterns

### 10. Targeted Infrastructure Updates Pattern
For adding new infrastructure without disrupting existing systems.

```bash
# Pattern: Safe infrastructure expansion
# 1. Add new Terraform module/resource
# 2. Use targeted apply to avoid touching existing resources
terraform apply -target=module.static_web_app -var-file=config/dev.tfvars

# 3. Add related GitHub secrets
terraform apply -target=github_actions_secret.azure_static_web_apps_api_token -var-file=config/dev.tfvars

# 4. Verify state consistency
terraform refresh -var-file=config/dev.tfvars
terraform plan -var-file=config/dev.tfvars  # Should show minimal changes
```

### 11. Path-Based CI/CD Triggering Pattern

```yaml
# Selective deployment based on changed directories
on:
  push:
    paths:
      - 'marketing/**'    # Only trigger on marketing changes
      - 'api/**'          # Separate trigger for API changes
      - 'terraform/**'    # Separate trigger for infrastructure

# Benefits:
# - Faster builds (only relevant code)
# - Reduced deployment conflicts
# - Clear separation of concerns
```

### 12. Environment Variable Management Pattern

```hcl
# Terraform manages GitHub secrets for deployment
locals {
  marketing_environment_variables = {
    "NEXT_PUBLIC_USE_EXTERNAL_APP" = "false"
    "NEXT_PUBLIC_EXTERNAL_APP_URL" = "https://app.kilometers.ai"
    # ... 12 more variables
  }
}

resource "github_actions_secret" "marketing_env_vars" {
  for_each        = local.marketing_environment_variables
  repository      = data.github_repository.main.name
  secret_name     = each.key
  plaintext_value = each.value
}
```

## API Architecture Patterns

### Hexagonal Architecture Implementation

```csharp
// Domain Layer (Core Business Logic)
namespace Kilometers.Domain
{
    public interface IEventStore
    {
        Task AppendAsync(MpcEvent evt);
        Task<List<MpcEvent>> GetRecentAsync(string customerId, int limit);
    }
    
    public interface IRiskAnalyzer
    {
        RiskLevel Analyze(MpcEvent evt);
    }
}

// Infrastructure Layer (External Concerns)
namespace Kilometers.Infrastructure
{
    public class PostgresEventStore : IEventStore
    {
        // PostgreSQL implementation
    }
    
    public class RiskAnalyzer : IRiskAnalyzer
    {
        // Risk analysis implementation
    }
}

// Application Layer (API Endpoints)
namespace Kilometers.Api
{
    // Minimal API endpoints connecting domain to infrastructure
    app.MapPost("/api/events", async (EventDto dto, IEventStore store) =>
    {
        var evt = Event.FromDto(dto);
        await store.AppendAsync(evt);
        return Results.Accepted();
    });
}
```

### Dependency Injection Pattern

```csharp
// DI Container Setup
var builder = WebApplication.CreateBuilder(args);

// Register domain services
builder.Services.AddSingleton<IEventStore, PostgresEventStore>();
builder.Services.AddSingleton<IRiskAnalyzer, RiskAnalyzer>();
builder.Services.AddSingleton<ICostCalculator, CostCalculator>();

// Register background services
builder.Services.AddHostedService<EventProcessorService>();

var app = builder.Build();
```

## Critical Operational Patterns

### 13. Terraform State Recovery Pattern

```bash
# When Terraform state is inconsistent with Azure reality:

# Step 1: Identify the problem
terraform plan -var-file=config/dev.tfvars
# Symptoms: Plans to recreate existing resources

# Step 2: Refresh state
terraform refresh -var-file=config/dev.tfvars

# Step 3: Import missing resources
terraform import -var-file=config/dev.tfvars azurerm_resource_group.main /subscriptions/xyz/resourceGroups/rg-name

# Step 4: Verify consistency
terraform plan -var-file=config/dev.tfvars
# Should show minimal/expected changes only
```

### 14. Dependency Conflict Resolution Pattern

```bash
# Pattern: Clean Resolution over Workarounds

# ❌ BAD: Paper over the problem
echo "legacy-peer-deps=true" > .npmrc

# ✅ GOOD: Find and remove root cause
# 1. Find conflicting packages
npm ls --depth=0 | grep -E "(WARN|ERROR)"

# 2. Check actual usage
grep -r "import.*problem-package" src/
grep -r "from.*problem-package" src/

# 3. Remove if unused
npm uninstall problem-package
rm unused-component-using-package.tsx

# 4. Verify clean build
npm run build
```

### 15. Infrastructure Consistency Validation Pattern

```bash
# Pattern: Verify infrastructure matches expectations

# 1. List Azure resources
az resource list --resource-group rg-kilometers-dev --query "[].{Name:name, Type:type}"

# 2. List Terraform state
terraform state list

# 3. Cross-reference and identify mismatches
# Look for:
# - Resources in Azure but not in state
# - Resources in state but not in Azure  
# - Name mismatches (different random suffixes)

# 4. Reconcile differences with imports/refreshes
terraform import -var-file=config/dev.tfvars resource.name azure_resource_id
```

## Component Interaction Patterns

### Request Flow Pattern

```
1. AI Client sends MCP request
   ↓
2. CLI intercepts and logs request
   ↓ 
3. CLI forwards to original MCP server
   ↓
4. MCP server processes and responds
   ↓
5. CLI intercepts and logs response
   ↓
6. CLI forwards response to AI client
   ↓
7. CLI batches events and sends to API
   ↓
8. API processes events asynchronously
   ↓
9. Dashboard queries processed data
```

### Error Handling Pattern

```csharp
// Resilient error handling with circuit breaker
public class ResilientApiClient
{
    private readonly CircuitBreaker _circuitBreaker;
    
    public async Task<Result> SendEventsAsync(IEnumerable<MpcEvent> events)
    {
        return await _circuitBreaker.ExecuteAsync(async () =>
        {
            try 
            {
                await _httpClient.PostAsJsonAsync("/api/events", events);
                return Result.Success();
            }
            catch (HttpRequestException ex)
            {
                // Log and return failure - circuit breaker handles retries
                return Result.Failure(ex.Message);
            }
        });
    }
}
``` 