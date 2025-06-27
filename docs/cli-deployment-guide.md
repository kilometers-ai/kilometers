# Kilometers CLI Deployment Guide

## Architecture Overview

The Kilometers CLI deployment uses a **Native Binary** approach with global CDN distribution:

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Repository                         │
│  - Source code (Go CLI)                                     │
│  - GitHub Actions workflows                                 │
│  - Version tags trigger releases                           │
└────────────────────┬───────────────────────────────────────┘
                     │ GitHub Actions
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  Build Pipeline                              │
│  - Multi-platform builds (Linux, macOS, Windows)           │
│  - ARM64 and AMD64 support                                 │
│  - Version injection and optimization                      │
└────────────────────┬───────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Azure Infrastructure                            │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │          Azure Storage Account                       │  │
│  │  - /releases/latest/ (current binaries)             │  │
│  │  - /releases/v1.0.0/ (versioned binaries)          │  │
│  │  - /install/ (install scripts)                      │  │
│  └─────────────────────────────────────────────────────┘  │
│                           │                                 │
│                           │                                 │
│  ┌─────────────────────────────────────────────────────┐  │
│  │            Azure CDN (Global)                        │  │
│  │  - get.kilometers.ai → Storage                      │  │
│  │  - Worldwide edge locations                         │  │
│  │  - Intelligent caching                              │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    End Users                                 │
│  - curl -sSL https://get.kilometers.ai | sh                │
│  - Direct binary downloads                                  │
│  - Package manager integration (future)                     │
└─────────────────────────────────────────────────────────────┘
```

## Deployment Steps

### 1. Initial Infrastructure Setup

```bash
# Navigate to terraform directory
cd terraform

# Initialize Terraform
terraform init

# Plan infrastructure changes
terraform plan -out=tfplan

# Apply infrastructure
terraform apply tfplan
```

### 2. Configure DNS

After infrastructure deployment, configure DNS records:

- `get.kilometers.ai` → CDN endpoint hostname
- `api.kilometers.ai` → API App Service hostname
- `app.kilometers.ai` → Dashboard hostname (when ready)

### 3. Deploy Install Scripts

```bash
# Upload install scripts to storage
az storage blob upload \
  --account-name <storage-account> \
  --container-name install \
  --name install.sh \
  --file scripts/install.sh

az storage blob upload \
  --account-name <storage-account> \
  --container-name install \
  --name install.ps1 \
  --file scripts/install.ps1
```

### 4. Release Process

#### Automated Release (Recommended)

```bash
# Create and push a version tag
git tag v1.0.0
git push origin v1.0.0

# This triggers the GitHub Actions workflow
```

#### Manual Release

```bash
# Trigger workflow manually from GitHub UI
# Actions → Release CLI → Run workflow
# Enter version: v1.0.0
```

### 5. Verify Deployment

```bash
# Test install script
curl -sSL https://get.kilometers.ai | sh

# Verify binary works
km --version

# Test with an MCP server
km npx @modelcontextprotocol/server-github
```

## CI/CD Pipeline Details

### Build Matrix

The pipeline builds for multiple platforms:

| OS      | Architecture | Binary Name           |
|---------|-------------|-----------------------|
| Linux   | AMD64       | km-linux-amd64        |
| Linux   | ARM64       | km-linux-arm64        |
| macOS   | AMD64       | km-darwin-amd64       |
| macOS   | ARM64       | km-darwin-arm64       |
| Windows | AMD64       | km-windows-amd64.exe  |

### Version Management

- Version is injected at build time: `-ldflags="-X main.Version=v1.0.0"`
- Binaries are stored in both `/releases/latest/` and `/releases/v1.0.0/`
- Old versions are retained for rollback capability

### CDN Configuration

- **Cache Duration**:
  - Install scripts: 10 minutes
  - Binaries: 24 hours
  - Version manifest: 5 minutes

- **Global Distribution**:
  - Azure CDN Standard tier
  - 100+ edge locations worldwide
  - Automatic failover

## Monitoring & Maintenance

### Health Checks

```bash
# Check CDN health
curl -I https://get.kilometers.ai/health

# Verify latest version
curl https://get.kilometers.ai/version

# Test install script
curl -sSL https://get.kilometers.ai | sh -s -- --help
```

### Metrics to Monitor

1. **Download Metrics**:
   - Total downloads per platform
   - Geographic distribution
   - Download failures

2. **Performance Metrics**:
   - CDN hit ratio
   - Download speeds by region
   - Storage bandwidth usage

3. **Error Tracking**:
   - Failed installations
   - Platform-specific issues
   - Version compatibility

### Update Process

1. **CLI Updates**:
   ```bash
   # Built-in update command (future)
   km update
   
   # Manual update
   curl -sSL https://get.kilometers.ai | sh
   ```

2. **Infrastructure Updates**:
   ```bash
   cd terraform
   terraform plan
   terraform apply
   ```

## Security Considerations

### Binary Signing (Future)

- Code signing for Windows binaries
- Notarization for macOS binaries
- GPG signatures for Linux binaries

### Checksum Verification

All binaries include SHA256 checksums:

```bash
# Download and verify
curl -LO https://get.kilometers.ai/releases/latest/km-linux-amd64
curl -LO https://get.kilometers.ai/releases/latest/km-linux-amd64.sha256
sha256sum -c km-linux-amd64.sha256
```

### API Key Security

- Never embed API keys in binaries
- Use environment variables or config files
- Implement key rotation mechanism

## Rollback Procedures

### Binary Rollback

```bash
# Install specific version
curl -sSL https://get.kilometers.ai | sh -s -- --version v1.0.0

# Or download directly
curl -LO https://get.kilometers.ai/releases/v1.0.0/km-linux-amd64
```

### Infrastructure Rollback

```bash
# Terraform state rollback
cd terraform
terraform state pull > backup.tfstate
# Modify and apply previous configuration
```

## Cost Optimization

### Estimated Monthly Costs

- **Storage Account**: ~$5 (minimal storage needs)
- **CDN**: ~$10-50 (depending on bandwidth)
- **Total**: ~$15-55/month

### Cost Saving Tips

1. Use CDN caching effectively
2. Compress binaries (already done with `-s -w` flags)
3. Monitor and optimize based on usage patterns
4. Consider regional restrictions if needed

## Future Enhancements

### Package Managers

```bash
# Homebrew (macOS/Linux)
brew install kilometers-ai/tap/km

# Scoop (Windows)
scoop install km

# APT (Debian/Ubuntu)
apt install kilometers-cli
```

### Auto-Update Feature

```go
// Built into CLI
km update --check
km update --auto
```

### Telemetry & Analytics

- Anonymous usage statistics
- Crash reporting
- Performance metrics
- Opt-in basis only

## Troubleshooting

### Common Issues

1. **Permission Denied**
   ```bash
   # Use sudo for system-wide install
   curl -sSL https://get.kilometers.ai | sudo sh
   ```

2. **CDN Errors**
   ```bash
   # Bypass CDN, use GitHub directly
   export KM_INSTALL_SOURCE=github
   curl -sSL https://get.kilometers.ai | sh
   ```

3. **Platform Detection Failed**
   ```bash
   # Manual download
   curl -LO https://get.kilometers.ai/releases/latest/km-[platform]
   chmod +x km-[platform]
   sudo mv km-[platform] /usr/local/bin/km
   ```

## Support

- **Issues**: GitHub Issues
- **Email**: support@kilometers.ai
- **Documentation**: https://docs.kilometers.ai
- **Status Page**: https://status.kilometers.ai