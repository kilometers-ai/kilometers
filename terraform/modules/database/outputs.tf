output "server_id" {
  description = "ID of the PostgreSQL flexible server"
  value       = azurerm_postgresql_flexible_server.main.id
}

output "server_name" {
  description = "Name of the PostgreSQL flexible server"
  value       = azurerm_postgresql_flexible_server.main.name
}

output "server_fqdn" {
  description = "Fully qualified domain name of the PostgreSQL server"
  value       = azurerm_postgresql_flexible_server.main.fqdn
}

output "database_name" {
  description = "Name of the application database"
  value       = azurerm_postgresql_flexible_server_database.app_db.name
}

output "admin_username" {
  description = "Administrator username for the PostgreSQL server"
  value       = azurerm_postgresql_flexible_server.main.administrator_login
  sensitive   = true
}

output "connection_string" {
  description = "Connection string for the PostgreSQL database"
  value       = "Host=${azurerm_postgresql_flexible_server.main.fqdn};Database=${azurerm_postgresql_flexible_server_database.app_db.name};Username=${azurerm_postgresql_flexible_server.main.administrator_login};Password=${var.admin_password};SSL Mode=Require;"
  sensitive   = true
}

output "connection_string_no_password" {
  description = "Connection string template without password (for reference)"
  value       = "Host=${azurerm_postgresql_flexible_server.main.fqdn};Database=${azurerm_postgresql_flexible_server_database.app_db.name};Username=${azurerm_postgresql_flexible_server.main.administrator_login};SSL Mode=Require;"
}

output "private_dns_zone_id" {
  description = "ID of the private DNS zone for PostgreSQL"
  value       = azurerm_private_dns_zone.postgres.id
}

output "postgres_version" {
  description = "PostgreSQL version"
  value       = azurerm_postgresql_flexible_server.main.version
}

output "server_sku" {
  description = "SKU of the PostgreSQL server"
  value       = azurerm_postgresql_flexible_server.main.sku_name
}

output "storage_mb" {
  description = "Storage size in MB"
  value       = azurerm_postgresql_flexible_server.main.storage_mb
}

output "ssl_enforcement" {
  description = "SSL enforcement status"
  value       = "Enabled (require_secure_transport=on, min_tls=TLSv1.2)"
}

output "network_access" {
  description = "Network access configuration"
  value       = "Private only (public_network_access_enabled=false)"
}
