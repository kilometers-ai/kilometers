# Azure Static Web Apps module for marketing site hosting

# Azure Static Web Apps resource
resource "azurerm_static_web_app" "marketing" {
  name                = var.static_web_app_name
  resource_group_name = var.resource_group_name
  location            = var.location
  sku_tier            = var.sku_tier
  sku_size            = var.sku_size

  # Repository configuration for GitHub integration
  app_settings = var.app_settings

  tags = var.tags
}

# Prepare list of all custom domains (backward compatibility + new multi-domain support)
locals {
  all_custom_domains = var.custom_domain != "" ? concat([var.custom_domain], var.custom_domains) : var.custom_domains

  # Separate apex domains from subdomains for different validation methods
  # Apex domain: has exactly one dot (e.g., "kilometers.ai")
  # Subdomain: has more than one dot (e.g., "www.kilometers.ai", "api.dev.kilometers.ai")
  apex_domains      = [for domain in local.all_custom_domains : domain if length(split(".", domain)) == 2]
  subdomain_domains = [for domain in local.all_custom_domains : domain if length(split(".", domain)) > 2]
}

# Custom domain configuration for apex domains (use dns-txt-token validation)
resource "azurerm_static_web_app_custom_domain" "apex_domains" {
  for_each          = toset(local.apex_domains)
  static_web_app_id = azurerm_static_web_app.marketing.id
  domain_name       = each.value
  validation_type   = "dns-txt-token"

  depends_on = [azurerm_static_web_app.marketing]
}

# Custom domain configuration for subdomains (use cname-delegation validation)
resource "azurerm_static_web_app_custom_domain" "subdomain_domains" {
  for_each          = toset(local.subdomain_domains)
  static_web_app_id = azurerm_static_web_app.marketing.id
  domain_name       = each.value
  validation_type   = "cname-delegation"

  depends_on = [azurerm_static_web_app.marketing]
}
