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
}

# Custom domain configuration - supports multiple domains
resource "azurerm_static_web_app_custom_domain" "marketing" {
  for_each          = toset(local.all_custom_domains)
  static_web_app_id = azurerm_static_web_app.marketing.id
  domain_name       = each.value
  validation_type   = "cname-delegation"

  depends_on = [azurerm_static_web_app.marketing]
}
