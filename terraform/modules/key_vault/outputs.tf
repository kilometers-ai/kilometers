# /modules/key_vault/outputs.tf

output "key_vault_id" {
  description = "The ID of the Key Vault"
  value       = azurerm_key_vault.main.id
}

output "key_vault_name" {
  description = "The name of the Key Vault"
  value       = azurerm_key_vault.main.name
}

output "key_vault_uri" {
  description = "The URI of the Key Vault"
  value       = azurerm_key_vault.main.vault_uri
}

output "key_vault_tenant_id" {
  description = "The tenant ID of the Key Vault"
  value       = azurerm_key_vault.main.tenant_id
}

output "private_endpoint_id" {
  description = "The ID of the private endpoint (if created)"
  value       = var.create_private_endpoint ? azurerm_private_endpoint.key_vault[0].id : null
}

output "private_endpoint_ip" {
  description = "The private IP address of the private endpoint (if created)"
  value       = var.create_private_endpoint ? azurerm_private_endpoint.key_vault[0].private_service_connection[0].private_ip_address : null
}

output "private_dns_zone_id" {
  description = "The ID of the private DNS zone (if created)"
  value       = var.create_private_dns_zone ? azurerm_private_dns_zone.key_vault[0].id : null
}

output "private_dns_zone_name" {
  description = "The name of the private DNS zone (if created)"
  value       = var.create_private_dns_zone ? azurerm_private_dns_zone.key_vault[0].name : null
}

# Output secret names (not values for security)
output "database_secret_name" {
  description = "Name of the database connection string secret"
  value       = azurerm_key_vault_secret.database_connection.name
}

# output "servicebus_secret_name" {
#   description = "Name of the Service Bus connection string secret"
#   value       = azurerm_key_vault_secret.servicebus_connection.name
# }

output "additional_secret_names" {
  description = "Names of additional secrets stored in Key Vault"
  value       = keys(var.additional_secrets)
}
