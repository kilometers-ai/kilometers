# Resource Group Outputs
output "resource_group_name" {
  description = "Name of the resource group"
  value       = azurerm_resource_group.main.name
}

output "resource_group_location" {
  description = "Location of the resource group"
  value       = azurerm_resource_group.main.location
}

# Api Outputs
output "api_url" {
  description = "URL of the deployed API"
  value       = var.environment == "dev" ? "https://api.dev.kilometers.ai" : "https://${azurerm_linux_web_app.api.default_hostname}"
}

output "api_app_service_name" {
  description = "Name of the API App Service"
  value       = azurerm_linux_web_app.api.name
}

output "api_app_service_id" {
  description = "ID of the API App Service"
  value       = azurerm_linux_web_app.api.id
}

output "api_identity_principal_id" {
  description = "Principal ID of the API managed identity"
  value       = azurerm_linux_web_app.api.identity[0].principal_id
}

# Database Outputs
output "database_server_name" {
  description = "Name of the PostgreSQL server"
  value       = module.database.server_name
}

output "database_server_fqdn" {
  description = "FQDN of the PostgreSQL server"
  value       = module.database.server_fqdn
}

output "database_name" {
  description = "Name of the application database"
  value       = module.database.database_name
}

output "database_connection_string" {
  description = "Connection string for the PostgreSQL database"
  value       = module.database.connection_string
  sensitive   = true
}

# Storage Account Outputs
output "storage_account_name" {
  description = "Name of the storage account"
  value       = azurerm_storage_account.main.name
}

output "storage_account_primary_endpoint" {
  description = "Primary endpoint of the storage account"
  value       = azurerm_storage_account.main.primary_blob_endpoint
}

# Key Vault Outputs
output "key_vault_name" {
  description = "Name of the Key Vault"
  value       = module.key_vault.key_vault_name
}

output "key_vault_uri" {
  description = "URI of the Key Vault"
  value       = module.key_vault.key_vault_uri
}

output "key_vault_id" {
  description = "ID of the Key Vault"
  value       = module.key_vault.key_vault_id
}

# Application Insights Outputs
output "application_insights_key" {
  description = "Instrumentation key for Application Insights"
  value       = azurerm_application_insights.main.instrumentation_key
  sensitive   = true
}

output "application_insights_connection_string" {
  description = "Connection string for Application Insights"
  value       = azurerm_application_insights.main.connection_string
  sensitive   = true
}

# CLI Distribution Outputs
output "cli_storage_account" {
  description = "Storage account name for CLI distribution"
  value       = module.cli_distribution.storage_account_name
}

output "cli_cdn_endpoint" {
  description = "CDN endpoint for CLI distribution"
  value       = module.cli_distribution.cdn_endpoint_hostname
}

output "cli_distribution_url" {
  description = "The URL for the CLI install script"
  value       = "https://get.kilometers.ai/install.sh"
}

# Static Web App Outputs
output "marketing_site_url" {
  description = "URL of the marketing site"
  value       = "https://${module.static_web_app.default_host_name}"
}

output "static_web_app_name" {
  description = "Name of the Azure Static Web App"
  value       = module.static_web_app.static_web_app_name
}

output "static_web_app_api_key" {
  description = "API key for Static Web App deployment"
  value       = module.static_web_app.api_key
  sensitive   = true
}

# Dashboard Static Web App Outputs
output "dashboard_site_url" {
  description = "URL of the dashboard site"
  value       = "https://${module.dashboard_static_web_app.default_host_name}"
}

output "dashboard_static_web_app_name" {
  description = "Name of the Dashboard Azure Static Web App"
  value       = module.dashboard_static_web_app.static_web_app_name
}

output "dashboard_static_web_app_api_key" {
  description = "API key for Dashboard Static Web App deployment"
  value       = module.dashboard_static_web_app.api_key
  sensitive   = true
}

output "dashboard_custom_url" {
  description = "Custom domain URL for the Dashboard application"
  value       = var.environment == "prod" ? "https://app.kilometers.ai" : "https://app.dev.kilometers.ai"
}

# GitHub Service Principal Outputs
output "github_actions_client_id" {
  description = "The Client ID of the GitHub Actions service principal."
  value       = data.azuread_service_principal.github_actions.client_id
}

output "github_actions_object_id" {
  description = "The Object ID of the GitHub Actions service principal."
  value       = data.azuread_service_principal.github_actions.object_id
}

# API Key Output (for initial setup)
output "kilometers_api_key" {
  description = "Generated API key for Kilometers"
  value       = random_password.api_key.result
  sensitive   = true
}

# Summary Information
output "deployment_summary" {
  description = "Summary of deployed resources"
  value = {
    environment   = var.environment
    api_url       = var.environment == "dev" ? "https://api.dev.kilometers.ai" : "https://${azurerm_linux_web_app.api.default_hostname}"
    health_check  = var.environment == "dev" ? "https://api.dev.kilometers.ai/health" : "https://${azurerm_linux_web_app.api.default_hostname}/health"
    swagger_ui    = var.environment == "dev" ? "https://api.dev.kilometers.ai/swagger" : "https://${azurerm_linux_web_app.api.default_hostname}/swagger"
    cli_install   = "curl -sSL https://get.kilometers.ai/install.sh | sh"
    dashboard_url = var.environment == "prod" ? "https://app.kilometers.ai" : "https://app.dev.kilometers.ai"
    marketing_url = "https://kilometers.ai"
  }
}
