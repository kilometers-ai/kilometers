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

# Custom domain configuration (prepared for future use)
resource "azurerm_static_web_app_custom_domain" "marketing" {
  count             = var.custom_domain != "" ? 1 : 0
  static_web_app_id = azurerm_static_web_app.marketing.id
  domain_name       = var.custom_domain
  validation_type   = "cname-delegation"

  depends_on = [azurerm_static_web_app.marketing]
}
