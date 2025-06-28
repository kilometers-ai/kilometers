output "storage_account_name" {
  value = azurerm_storage_account.cli_distribution.name
}

output "storage_account_id" {
  value = azurerm_storage_account.cli_distribution.id
}

output "storage_primary_web_endpoint" {
  value = azurerm_storage_account.cli_distribution.primary_web_endpoint
}

output "storage_primary_web_hostname" {
  value = azurerm_storage_account.cli_distribution.primary_web_host
}

output "storage_primary_blob_endpoint" {
  value = azurerm_storage_account.cli_distribution.primary_blob_endpoint
}

output "install_container_name" {
  description = "Name of the install scripts container"
  value       = azurerm_storage_container.install.name
}

output "releases_container_name" {
  description = "Name of the CLI releases container"
  value       = azurerm_storage_container.releases.name
}

output "cdn_endpoint_hostname" {
  description = "The hostname of the CDN endpoint"
  value       = azurerm_cdn_endpoint.get.fqdn
}

output "cdn_custom_domain_name" {
  value = azurerm_cdn_endpoint_custom_domain.get_kilometers_ai.host_name
}
