output "storage_account_name" {
  value = azurerm_storage_account.cli_distribution.name
}

output "storage_account_id" {
  value = azurerm_storage_account.cli_distribution.id
}

output "storage_primary_web_endpoint" {
  value = azurerm_storage_account.cli_distribution.primary_web_endpoint
}

output "storage_primary_blob_endpoint" {
  value = azurerm_storage_account.cli_distribution.primary_blob_endpoint
}

output "cdn_endpoint_hostname" {
  value = azurerm_cdn_endpoint.get.fqdn
}

output "releases_container_url" {
  value = "${azurerm_storage_account.cli_distribution.primary_blob_endpoint}${azurerm_storage_container.releases.name}"
}
