
output "container_app_url" {
  description = "URL of the deployed Container App"
  value       = "Check Azure Portal for Container App URL: ${azurerm_container_app.api.name}"
}

output "container_app_name" {
  description = "Name of the Container App"
  value       = azurerm_container_app.api.name
}

output "container_app_identity_id" {
  description = "ID of the Container App managed identity"
  value       = azurerm_user_assigned_identity.container_app.id
}

output "container_app_identity_principal_id" {
  description = "Principal ID of the Container App managed identity"
  value       = azurerm_user_assigned_identity.container_app.principal_id
}

output "container_app_identity_client_id" {
  description = "Client ID of the Container App managed identity"
  value       = azurerm_user_assigned_identity.container_app.client_id
}
