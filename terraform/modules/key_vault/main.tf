# /modules/key_vault/main.tf

data "azurerm_client_config" "current" {}

# Azure Key Vault for secrets management
resource "azurerm_key_vault" "main" {
  name                = var.key_vault_name
  location            = var.location
  resource_group_name = var.resource_group_name
  tenant_id           = data.azurerm_client_config.current.tenant_id
  sku_name            = var.sku_name

  # Public network access control
  public_network_access_enabled = var.public_network_access_enabled

  # Network access configuration
  network_acls {
    default_action = var.default_network_action
    bypass         = "AzureServices"

    # Allow specific subnets (Container Apps)
    virtual_network_subnet_ids = var.allowed_subnet_ids

    # Allow specific IP ranges if needed
    ip_rules = var.allowed_ip_ranges
  }

  # Use RBAC instead of access policies for better security
  enable_rbac_authorization = true

  # Soft delete and purge protection for production
  soft_delete_retention_days = var.soft_delete_retention_days
  purge_protection_enabled   = var.purge_protection_enabled

  tags = var.tags
}

# Private endpoint for Key Vault (if using private networking)
resource "azurerm_private_endpoint" "key_vault" {
  count               = var.create_private_endpoint ? 1 : 0
  name                = "${var.key_vault_name}-pe"
  location            = var.location
  resource_group_name = var.resource_group_name
  subnet_id           = var.private_endpoint_subnet_id

  private_service_connection {
    name                           = "${var.key_vault_name}-psc"
    private_connection_resource_id = azurerm_key_vault.main.id
    subresource_names              = ["vault"]
    is_manual_connection           = false
  }

  private_dns_zone_group {
    name                 = "default"
    private_dns_zone_ids = var.private_dns_zone_ids
  }

  tags = var.tags
}

# Private DNS zone for Key Vault (if needed)
resource "azurerm_private_dns_zone" "key_vault" {
  count               = var.create_private_dns_zone ? 1 : 0
  name                = "privatelink.vaultcore.azure.net"
  resource_group_name = var.resource_group_name
  tags                = var.tags
}

# Link DNS zone to VNet
resource "azurerm_private_dns_zone_virtual_network_link" "key_vault" {
  count                 = var.create_private_dns_zone ? 1 : 0
  name                  = "${var.key_vault_name}-dns-link"
  resource_group_name   = var.resource_group_name
  private_dns_zone_name = azurerm_private_dns_zone.key_vault[0].name
  virtual_network_id    = var.virtual_network_id
  tags                  = var.tags
}

# Store database connection string
resource "azurerm_key_vault_secret" "database_connection" {
  name         = "database-connection-string"
  value        = var.database_connection_string
  key_vault_id = azurerm_key_vault.main.id

  depends_on = [azurerm_role_assignment.terraform_admin]
}

# Additional secrets from variable map
resource "azurerm_key_vault_secret" "additional_secrets" {
  for_each     = nonsensitive(var.additional_secrets)
  name         = each.key
  value        = each.value
  key_vault_id = azurerm_key_vault.main.id

  depends_on = [azurerm_role_assignment.terraform_admin]
}

# Grant Terraform service principal admin access to manage secrets
resource "azurerm_role_assignment" "terraform_admin" {
  scope                = azurerm_key_vault.main.id
  role_definition_name = "Key Vault Administrator"
  principal_id         = data.azurerm_client_config.current.object_id
}

# NOTE: Container Apps and GitHub Actions role assignments moved to main.tf to avoid circular dependencies
