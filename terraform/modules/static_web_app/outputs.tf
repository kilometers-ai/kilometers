output "static_web_app_id" {
  description = "ID of the Azure Static Web App"
  value       = azurerm_static_web_app.marketing.id
}

output "static_web_app_name" {
  description = "Name of the Azure Static Web App"
  value       = azurerm_static_web_app.marketing.name
}

output "default_host_name" {
  description = "Default hostname of the Azure Static Web App"
  value       = azurerm_static_web_app.marketing.default_host_name
}

output "api_key" {
  description = "API key for deployment to the Azure Static Web App"
  value       = azurerm_static_web_app.marketing.api_key
  sensitive   = true
}

# Alias for backward compatibility
output "id" {
  description = "ID of the Azure Static Web App (alias for static_web_app_id)"
  value       = azurerm_static_web_app.marketing.id
}
