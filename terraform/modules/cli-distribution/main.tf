# Storage Account for CLI binaries
resource "azurerm_storage_account" "cli_distribution" {
  name                     = "stkmcli${substr(md5(var.resource_group_name), 0, 8)}"
  resource_group_name      = var.resource_group_name
  location                 = var.location
  account_tier             = "Standard"
  account_replication_type = "GRS" # Geo-redundant for global distribution

  # Enable versioning for binary history
  blob_properties {
    versioning_enabled = true

    cors_rule {
      allowed_headers    = ["*"]
      allowed_methods    = ["GET", "HEAD"]
      allowed_origins    = ["*"]
      exposed_headers    = ["*"]
      max_age_in_seconds = 3600
    }
  }

  tags = var.tags

  # Add timeouts for slow operations
  timeouts {
    create = "30m"
    update = "30m"
    delete = "30m"
  }
}

# Static website hosting (replaces deprecated static_website block)
resource "azurerm_storage_account_static_website" "cli_distribution" {
  storage_account_id = azurerm_storage_account.cli_distribution.id
  index_document     = "index.html"
  error_404_document = "404.html"
}

# Container for install scripts
resource "azurerm_storage_container" "install" {
  name                  = "install"
  storage_account_id    = azurerm_storage_account.cli_distribution.id
  container_access_type = "blob" # Public read access
}

# Container for CLI binary releases
resource "azurerm_storage_container" "releases" {
  name                  = "releases"
  storage_account_id    = azurerm_storage_account.cli_distribution.id
  container_access_type = "blob" # Public read access
}

# CDN Profile for global distribution
resource "azurerm_cdn_profile" "cli_distribution" {
  name                = "cdnp-kilometers-cli-${var.environment}"
  resource_group_name = var.resource_group_name
  location            = "global"
  sku                 = "Standard_Microsoft"
  tags                = var.tags
}

# CDN Endpoint for get.kilometers.ai
resource "azurerm_cdn_endpoint" "get" {
  name                = "cdne-kilometers-get-${var.environment}"
  profile_name        = azurerm_cdn_profile.cli_distribution.name
  resource_group_name = var.resource_group_name
  location            = "global"
  origin_host_header  = azurerm_storage_account.cli_distribution.primary_web_host

  origin {
    name      = "storage"
    host_name = azurerm_storage_account.cli_distribution.primary_web_host
  }

  # Caching rules for efficient distribution - simplified for install script only
  global_delivery_rule {
    cache_expiration_action {
      behavior = "Override"
      duration = "00:10:00" # 10 minutes cache for install scripts
    }
  }

  tags = var.tags
}

# Custom domain for get.kilometers.ai
resource "azurerm_cdn_endpoint_custom_domain" "get_kilometers_ai" {
  name            = "get-kilometers-ai"
  cdn_endpoint_id = azurerm_cdn_endpoint.get.id
  host_name       = "get.kilometers.ai"

  # Temporarily disable HTTPS due to 8-hour Azure CDN cooldown
  # Will re-enable after cooldown period expires
  # cdn_managed_https {
  #   certificate_type = "Dedicated"
  #   protocol_type    = "ServerNameIndication"
  # }
}
