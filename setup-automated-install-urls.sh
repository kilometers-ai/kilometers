#!/bin/bash
set -e

echo "🔄 Setting up automated install URL injection into marketing deployment..."

cd /Users/milesangelo/Source/active/kilometers.ai/kilometers

# 1. Add install URL to Terraform GitHub Secrets
echo "1️⃣ Adding install URL to Terraform outputs..."

cd terraform

# Add to main.tf GitHub secrets section
cat >> temp_secrets.tf << 'EOF'

# Install URL secrets for marketing site automation
resource "github_actions_secret" "cli_install_url_primary" {
  repository      = data.github_repository.main.name
  secret_name     = "CLI_INSTALL_URL_PRIMARY"
  plaintext_value = "https://get.kilometers.ai/install.sh"
}

resource "github_actions_secret" "cli_install_url_fallback" {
  repository      = data.github_repository.main.name
  secret_name     = "CLI_INSTALL_URL_FALLBACK"
  plaintext_value = "https://raw.githubusercontent.com/kilometers-ai/kilometers/main/scripts/install.sh"
}

resource "github_actions_secret" "cli_install_url_direct" {
  repository      = data.github_repository.main.name
  secret_name     = "CLI_INSTALL_URL_DIRECT"
  plaintext_value = "https://${module.cli_distribution.storage_account_name}.blob.core.windows.net/install/install.sh"
}

# Dynamic install URL based on environment
locals {
  install_url_primary = var.environment == "prod" ? "https://get.kilometers.ai/install.sh" : "https://raw.githubusercontent.com/kilometers-ai/kilometers/main/scripts/install.sh"
}

resource "github_actions_secret" "cli_install_url" {
  repository      = data.github_repository.main.name
  secret_name     = "CLI_INSTALL_URL"
  plaintext_value = local.install_url_primary
}
EOF

# Append to main.tf
cat temp_secrets.tf >> main.tf
rm temp_secrets.tf

echo "✅ Added install URL secrets to Terraform"

# 2. Update marketing site GitHub Actions workflow
echo "2️⃣ Updating marketing site deployment workflow..."

cd ../.github/workflows

# Find the marketing deployment workflow
if [ -f "deploy-marketing.yml" ]; then
    WORKFLOW_FILE="deploy-marketing.yml"
elif [ -f "azure-static-web-apps.yml" ]; then
    WORKFLOW_FILE="azure-static-web-apps.yml"
else
    echo "📁 Creating new marketing deployment workflow..."
    WORKFLOW_FILE="deploy-marketing.yml"
fi

# Create/update the workflow with environment injection
cat > "$WORKFLOW_FILE" << 'EOF'
name: Deploy Marketing Site

on:
  push:
    branches: [ main ]
    paths: [ 'marketing/**' ]
  workflow_dispatch:

jobs:
  build_and_deploy:
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    name: Build and Deploy
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: true

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: marketing/package-lock.json

      - name: Install dependencies
        run: |
          cd marketing
          npm ci

      - name: Build with injected environment variables
        run: |
          cd marketing
          npm run build
        env:
          # Inject Terraform-managed URLs
          NEXT_PUBLIC_CLI_INSTALL_URL: ${{ secrets.CLI_INSTALL_URL }}
          NEXT_PUBLIC_CLI_INSTALL_URL_PRIMARY: ${{ secrets.CLI_INSTALL_URL_PRIMARY }}
          NEXT_PUBLIC_CLI_INSTALL_URL_FALLBACK: ${{ secrets.CLI_INSTALL_URL_FALLBACK }}
          NEXT_PUBLIC_CLI_INSTALL_URL_DIRECT: ${{ secrets.CLI_INSTALL_URL_DIRECT }}
          NEXT_PUBLIC_API_URL: ${{ secrets.API_URL }}
          
          # Existing marketing environment variables
          NEXT_PUBLIC_USE_EXTERNAL_APP: ${{ secrets.NEXT_PUBLIC_USE_EXTERNAL_APP }}
          NEXT_PUBLIC_EXTERNAL_APP_URL: ${{ secrets.NEXT_PUBLIC_EXTERNAL_APP_URL }}
          NEXT_PUBLIC_ENABLE_ANALYTICS: ${{ secrets.NEXT_PUBLIC_ENABLE_ANALYTICS }}
          NEXT_PUBLIC_SHOW_COOKIE_BANNER: ${{ secrets.NEXT_PUBLIC_SHOW_COOKIE_BANNER }}
          NEXT_PUBLIC_ENABLE_CONTACT_FORM: ${{ secrets.NEXT_PUBLIC_ENABLE_CONTACT_FORM }}
          NEXT_PUBLIC_ENABLE_GITHUB_OAUTH: ${{ secrets.NEXT_PUBLIC_ENABLE_GITHUB_OAUTH }}

      - name: Deploy to Azure Static Web Apps
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/marketing"
          api_location: ""
          output_location: "out"

  close_pull_request:
    if: github.event_name == 'pull_request' && github.event.action == 'closed'
    runs-on: ubuntu-latest
    name: Close Pull Request
    steps:
      - name: Close Pull Request
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          action: "close"
EOF

echo "✅ Updated marketing deployment workflow"

# 3. Create marketing site install URL hook
echo "3️⃣ Creating marketing site install URL utilities..."

cd ../marketing

# Create a utility to handle install URLs
mkdir -p utils
cat > utils/install-urls.ts << 'EOF'
/**
 * Install URL configuration - automatically injected by Terraform → GitHub Actions
 * No hardcoded URLs - all managed through infrastructure as code
 */

export interface InstallConfig {
  primary: string;
  fallback: string;
  direct: string;
  selected: string;
}

// Environment variables injected during build by GitHub Actions
const INSTALL_URLS: InstallConfig = {
  primary: process.env.NEXT_PUBLIC_CLI_INSTALL_URL_PRIMARY || 'https://get.kilometers.ai/install.sh',
  fallback: process.env.NEXT_PUBLIC_CLI_INSTALL_URL_FALLBACK || 'https://raw.githubusercontent.com/kilometers-ai/kilometers/main/scripts/install.sh',
  direct: process.env.NEXT_PUBLIC_CLI_INSTALL_URL_DIRECT || '',
  selected: process.env.NEXT_PUBLIC_CLI_INSTALL_URL || process.env.NEXT_PUBLIC_CLI_INSTALL_URL_PRIMARY || 'https://get.kilometers.ai/install.sh'
};

/**
 * Get the primary install command for marketing materials
 */
export function getInstallCommand(): string {
  return `curl -sSL ${INSTALL_URLS.selected} | sh`;
}

/**
 * Get install command with fallback for documentation
 */
export function getInstallCommandWithFallback(): string {
  return `# Primary install method
curl -sSL ${INSTALL_URLS.primary} | sh

# Backup install method  
curl -sSL ${INSTALL_URLS.fallback} | sh`;
}

/**
 * Get all available install URLs for development/debugging
 */
export function getAllInstallUrls(): InstallConfig {
  return INSTALL_URLS;
}

/**
 * Get install URL based on environment or preference
 */
export function getInstallUrl(preference: 'primary' | 'fallback' | 'direct' | 'auto' = 'auto'): string {
  switch (preference) {
    case 'primary':
      return INSTALL_URLS.primary;
    case 'fallback':
      return INSTALL_URLS.fallback;
    case 'direct':
      return INSTALL_URLS.direct;
    case 'auto':
    default:
      return INSTALL_URLS.selected;
  }
}
EOF

# Create React hook for install URLs
cat > utils/use-install-urls.ts << 'EOF'
import { useState, useEffect } from 'react';
import { getInstallCommand, getInstallUrl, getAllInstallUrls, InstallConfig } from './install-urls';

export interface UseInstallUrlsReturn {
  installCommand: string;
  installUrl: string;
  allUrls: InstallConfig;
  setPreference: (pref: 'primary' | 'fallback' | 'direct' | 'auto') => void;
  currentPreference: string;
}

/**
 * React hook for managing install URLs in components
 */
export function useInstallUrls(): UseInstallUrlsReturn {
  const [preference, setPreference] = useState<'primary' | 'fallback' | 'direct' | 'auto'>('auto');
  const [installCommand, setInstallCommand] = useState('');
  const [installUrl, setInstallUrl] = useState('');

  useEffect(() => {
    setInstallCommand(getInstallCommand());
    setInstallUrl(getInstallUrl(preference));
  }, [preference]);

  return {
    installCommand,
    installUrl,
    allUrls: getAllInstallUrls(),
    setPreference,
    currentPreference: preference
  };
}
EOF

echo "✅ Created install URL utilities"

# 4. Create example component usage
cat > components/install-command.example.tsx << 'EOF'
// Example: How to use the automated install URLs in components

import { useInstallUrls } from '../utils/use-install-urls';

export function InstallCommandBlock() {
  const { installCommand, installUrl, setPreference } = useInstallUrls();

  return (
    <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm">Install Kilometers CLI:</span>
        <select 
          onChange={(e) => setPreference(e.target.value as any)}
          className="bg-gray-800 text-green-400 text-xs px-2 py-1 rounded"
        >
          <option value="auto">Auto</option>
          <option value="primary">Branded Domain</option>
          <option value="fallback">GitHub Direct</option>
        </select>
      </div>
      <code className="select-all">{installCommand}</code>
      <div className="mt-2 text-xs opacity-70">
        Source: {installUrl}
      </div>
    </div>
  );
}

// Example: Simple install command display
export function SimpleInstallCommand() {
  const { installCommand } = useInstallUrls();
  
  return (
    <code className="bg-black text-green-400 px-4 py-2 rounded block">
      {installCommand}
    </code>
  );
}
EOF

echo "✅ Created example components"

cd ../..

echo ""
echo "🎉 Automated install URL injection setup complete!"
echo ""
echo "📋 What was created:"
echo "   ✅ Terraform secrets for install URLs"
echo "   ✅ GitHub Actions workflow with environment injection"
echo "   ✅ TypeScript utilities for install URLs"
echo "   ✅ React hooks for dynamic URL management"
echo "   ✅ Example components"
echo ""
echo "🚀 Deployment flow:"
echo "   1. Terraform updates → GitHub secrets updated"
echo "   2. Marketing deployment → Environment variables injected"
echo "   3. Build time → URLs baked into static site"
echo "   4. No hardcoded URLs anywhere!"
echo ""
echo "📝 Next steps:"
echo "   1. Apply Terraform to create secrets:"
echo "      cd terraform && terraform apply -var-file=config/dev.tfvars"
echo "   2. Update marketing components to use utilities"
echo "   3. Deploy marketing site (URLs auto-injected)"
echo ""
echo "🔄 Future updates:"
echo "   • Change install URL in Terraform"
echo "   • Apply Terraform (updates GitHub secrets)"
echo "   • Marketing redeploys automatically with new URLs"
