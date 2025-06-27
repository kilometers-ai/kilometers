# Private DNS Zone for PostgreSQL
resource "azurerm_private_dns_zone" "postgres" {
  name                = "privatelink.postgres.database.azure.com"
  resource_group_name = var.resource_group_name
  tags                = var.tags
}

# Link DNS zone to VNet
resource "azurerm_private_dns_zone_virtual_network_link" "postgres" {
  name                  = "${var.server_name}-dns-link"
  resource_group_name   = var.resource_group_name
  private_dns_zone_name = azurerm_private_dns_zone.postgres.name
  virtual_network_id    = var.virtual_network_id
  tags                  = var.tags
}

# PostgreSQL Flexible Server
resource "azurerm_postgresql_flexible_server" "main" {
  name                = var.server_name
  resource_group_name = var.resource_group_name
  location            = var.location
  zone                = "1"

  # Authentication
  administrator_login    = var.admin_username
  administrator_password = var.admin_password

  # Networking - Private access only
  delegated_subnet_id = var.db_subnet_id
  private_dns_zone_id = azurerm_private_dns_zone.postgres.id

  # Server configuration
  sku_name   = var.sku_name
  storage_mb = var.storage_mb
  version    = var.postgres_version

  # Backup configuration
  backup_retention_days        = var.backup_retention_days
  geo_redundant_backup_enabled = var.geo_redundant_backup_enabled

  # Security
  public_network_access_enabled = false

  # Maintenance window (optional)
  maintenance_window {
    day_of_week  = 0 # Sunday
    start_hour   = 2
    start_minute = 0
  }

  tags = var.tags

  depends_on = [azurerm_private_dns_zone_virtual_network_link.postgres]

  # Add timeouts for slow operations
  timeouts {
    create = "60m"
    update = "60m"
    delete = "60m"
  }
}

# Create application database
resource "azurerm_postgresql_flexible_server_database" "app_db" {
  name      = var.database_name
  server_id = azurerm_postgresql_flexible_server.main.id
  collation = "en_US.utf8"
  charset   = "utf8"
}

# Firewall rule to allow access from app subnet
resource "azurerm_postgresql_flexible_server_firewall_rule" "app_subnet" {
  name             = "AllowAppSubnet"
  server_id        = azurerm_postgresql_flexible_server.main.id
  start_ip_address = var.app_subnet_start_ip
  end_ip_address   = var.app_subnet_end_ip
}

# Firewall rule to allow access from Container Apps infrastructure subnet  
resource "azurerm_postgresql_flexible_server_firewall_rule" "container_apps_subnet" {
  name             = "AllowContainerAppsSubnet"
  server_id        = azurerm_postgresql_flexible_server.main.id
  start_ip_address = var.container_apps_subnet_start_ip
  end_ip_address   = var.container_apps_subnet_end_ip
}

# SSL Configuration - Require SSL connections
resource "azurerm_postgresql_flexible_server_configuration" "require_secure_transport" {
  name      = "require_secure_transport"
  server_id = azurerm_postgresql_flexible_server.main.id
  value     = "on"
}

# SSL Configuration - Set minimum TLS version
resource "azurerm_postgresql_flexible_server_configuration" "ssl_min_protocol_version" {
  name      = "ssl_min_protocol_version"
  server_id = azurerm_postgresql_flexible_server.main.id
  value     = "TLSv1.2"
}

# Logging configuration for monitoring
resource "azurerm_postgresql_flexible_server_configuration" "log_statement" {
  name      = "log_statement"
  server_id = azurerm_postgresql_flexible_server.main.id
  value     = "all"
}

resource "azurerm_postgresql_flexible_server_configuration" "log_min_duration_statement" {
  name      = "log_min_duration_statement"
  server_id = azurerm_postgresql_flexible_server.main.id
  value     = "1000" # Log statements taking longer than 1 second
}
