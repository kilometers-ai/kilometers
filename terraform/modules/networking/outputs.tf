output "vnet_id" {
  description = "ID of the virtual network"
  value       = azurerm_virtual_network.vnet.id
}

output "vnet_name" {
  description = "Name of the virtual network"
  value       = azurerm_virtual_network.vnet.name
}

output "subnet_ids" {
  description = "Map of subnet names to their IDs"
  value       = { for k, v in azurerm_subnet.subnets : k => v.id }
}

output "app_subnet_id" {
  description = "ID of the app subnet"
  value       = azurerm_subnet.subnets["app"].id
}

output "db_subnet_id" {
  description = "ID of the database subnet"
  value       = azurerm_subnet.subnets["db"].id
}

output "container_apps_subnet_id" {
  description = "ID of the Container Apps infrastructure subnet"
  value       = azurerm_subnet.subnets["container_apps"].id
}

output "private_endpoint_subnet_id" {
  description = "ID of the private endpoint subnet"
  value       = azurerm_subnet.subnets["private_endpoints"].id
}
