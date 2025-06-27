# Azure Static Web Apps Deployment Guide

## Overview
This guide covers deploying the Kilometers landing page to Azure Static Web Apps using the pre-configured setup.

## Prerequisites
- Azure subscription with Static Web App already provisioned via Terraform
- GitHub repository connected to Azure Static Web Apps
- Required secrets configured in GitHub repository

## Configuration Files Created

### 1. `next.config.mjs`
Updated with static export configuration:
```javascript
output: 'export',
trailingSlash: true,
skipTrailingSlashRedirect: true,
distDir: 'out',
```

### 2. `staticwebapp.config.json`
Azure Static Web Apps routing and security configuration:
- Navigation fallback for SPA routing
- Security headers (X-Content-Type-Options, X-Frame-Options, etc.)
- 404 error handling
- Static asset exclusions

### 3. `.github/workflows/azure-static-web-apps.yml`
GitHub Actions CI/CD pipeline:
- Builds on Node.js 18
- Uses `npm ci --legacy-peer-deps` for dependencies
- Deploys to Azure using `Azure/static-web-apps-deploy@v1`
- Handles both main branch and PR deployments

## Required GitHub Secrets

Configure these secrets in your GitHub repository settings:

### Azure Configuration
- `AZURE_STATIC_WEB_APPS_API_TOKEN` - API token from your Azure Static Web App

### Environment Variables
- `NEXT_PUBLIC_USE_EXTERNAL_APP` - `false` for internal routing, `true` for external redirect
- `NEXT_PUBLIC_EXTERNAL_APP_URL` - `https://app.kilometers.ai` (or your app URL)
- `NEXT_PUBLIC_ENABLE_ANALYTICS` - `true` to enable analytics tracking
- `NEXT_PUBLIC_SHOW_COOKIE_BANNER` - `true` to show cookie consent banner

#### Connection Verification Feature Flags
- `NEXT_PUBLIC_ENABLE_REAL_CONNECTION_CHECK` - `false` for mock verification, `true` for real API checking
- `NEXT_PUBLIC_CONNECTION_CHECK_METHOD` - `polling` | `websocket` | `sse` (connection check method)
- `NEXT_PUBLIC_CONNECTION_TIMEOUT_MS` - `120000` (connection timeout in milliseconds, default 2 minutes)
- `NEXT_PUBLIC_ENABLE_CONNECTION_TROUBLESHOOTING` - `false` to disable, `true` to show troubleshooting wizard
- `NEXT_PUBLIC_ENABLE_MANUAL_VERIFICATION_SKIP` - `true` to allow users to skip verification (recommended)
- `NEXT_PUBLIC_ENABLE_CONFIG_VALIDATION` - `false` to disable, `true` to validate tool configurations
- `NEXT_PUBLIC_CONNECTION_CHECK_POLL_INTERVAL_MS` - `2000` (polling interval in milliseconds, default 2 seconds)
- `NEXT_PUBLIC_ENABLE_CONNECTION_ANALYTICS` - `false` to disable, `true` to track connection verification analytics

## Deployment Process

### Automatic Deployment
1. Push changes to `main` branch
2. GitHub Actions workflow triggers automatically
3. Builds the static site using `npm run build:azure`
4. Deploys to Azure Static Web Apps
5. Site is available at your Azure Static Web App URL

### Manual Deployment
```bash
# Build for Azure Static Web Apps
npm run build:azure

# Output will be in the 'out' directory
# Upload contents to Azure Static Web Apps manually if needed
```

## Build Scripts

### Available Scripts
- `npm run build` - Standard Next.js build
- `npm run build:azure` - Static export build for Azure deployment
- `npm run dev` - Development server
- `npm run start` - Production server (not used in static deployment)

## Verification Steps

### 1. Local Testing
```bash
# Test static export locally
npm run build:azure
npx serve out
```

### 2. Production Verification
- Check deployment logs in GitHub Actions
- Verify all pages load correctly
- Test feature flags functionality
- Confirm analytics and cookie banner work
- Test mobile responsiveness

## Connection Verification

### Feature Flag Configuration

The connection verification system is fully controlled by feature flags, allowing for progressive rollout and easy rollback:

#### Phase 1: Mock Verification (Default - Safe)
```env
NEXT_PUBLIC_ENABLE_REAL_CONNECTION_CHECK=false
NEXT_PUBLIC_ENABLE_MANUAL_VERIFICATION_SKIP=true
NEXT_PUBLIC_ENABLE_CONNECTION_TROUBLESHOOTING=false
```

#### Phase 2: Real Connection Checking (Testing)
```env
NEXT_PUBLIC_ENABLE_REAL_CONNECTION_CHECK=true
NEXT_PUBLIC_CONNECTION_CHECK_METHOD=polling
NEXT_PUBLIC_CONNECTION_TIMEOUT_MS=120000
NEXT_PUBLIC_CONNECTION_CHECK_POLL_INTERVAL_MS=2000
```

#### Phase 3: Full Features (Production)
```env
NEXT_PUBLIC_ENABLE_CONNECTION_TROUBLESHOOTING=true
NEXT_PUBLIC_ENABLE_CONFIG_VALIDATION=true
NEXT_PUBLIC_ENABLE_CONNECTION_ANALYTICS=true
```

### Connection Verification Methods

1. **Mock Simulation** (Default): 3-second delay with success
2. **API Polling**: Regular API calls to check for first MCP request
3. **WebSocket**: Real-time connection updates (future)
4. **Server-Sent Events**: Real-time stream (future)

### API Requirements

When `ENABLE_REAL_CONNECTION_CHECK=true`, the following API endpoint is required:

```
POST /api/check-connection
{
  "toolType": "cursor" | "claude" | "vscode",
  "userId": "user-id"
}

Response:
{
  "connected": boolean,
  "firstRequest": {
    "timestamp": "ISO-8601",
    "source": "Tool Name",
    "destination": "API Endpoint",
    "distance": number,
    "cost": number,
    "requestType": "completion"
  }
}
```

## Troubleshooting

### Common Issues

#### Build Failures
- **Dependency conflicts**: Use `npm ci --legacy-peer-deps`
- **TypeScript errors**: Currently ignored in build config
- **Missing environment variables**: Check GitHub secrets configuration

#### Routing Issues
- **404 on refresh**: Ensure `staticwebapp.config.json` has correct navigationFallback
- **Trailing slashes**: Configured in `next.config.mjs` for consistency

#### Performance Issues
- **Large bundle**: Review dependencies and use code splitting
- **Slow loading**: Verify Azure CDN configuration
- **Image optimization**: Already configured with `unoptimized: true`

#### Connection Verification Issues
- **API endpoint missing**: Ensure `/api/check-connection` endpoint exists when real checking enabled
- **Timeout too short**: Increase `CONNECTION_TIMEOUT_MS` for slow networks
- **Polling too frequent**: Increase `CONNECTION_CHECK_POLL_INTERVAL_MS` to reduce server load
- **Users stuck**: Enable `ENABLE_MANUAL_VERIFICATION_SKIP=true` for fallback option
- **No troubleshooting help**: Enable `ENABLE_CONNECTION_TROUBLESHOOTING=true` for user assistance

### Log Access
- GitHub Actions logs: Repository → Actions tab
- Azure Static Web Apps logs: Azure Portal → Your Static Web App → Functions/API

## Security Considerations

### Headers Configured
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`

### Environment Variables
- All public variables use `NEXT_PUBLIC_` prefix
- Sensitive tokens stored as GitHub secrets only
- No sensitive data in client-side code

## Monitoring

### Available Metrics
- Azure Static Web Apps provides built-in analytics
- Monitor through Azure Portal
- GitHub Actions provides deployment status
- Configure custom analytics if `NEXT_PUBLIC_ENABLE_ANALYTICS=true`

## Custom Domain Setup

When ready to configure a custom domain:
1. Add domain in Azure Static Web Apps portal
2. Configure DNS CNAME record
3. Azure handles SSL certificate automatically
4. Update environment variables if needed

## Performance Optimization

### Current Optimizations
- Static site generation
- Unoptimized images for compatibility
- Tailwind CSS purging
- Bundle splitting via Next.js

### Additional Optimizations
- Configure Azure CDN for global distribution
- Enable compression in Azure
- Monitor Core Web Vitals
- Implement service worker if needed

## Support

### Resources
- [Azure Static Web Apps Documentation](https://docs.microsoft.com/en-us/azure/static-web-apps/)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [GitHub Actions for Azure](https://github.com/Azure/static-web-apps-deploy) 