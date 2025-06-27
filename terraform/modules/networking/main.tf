# Virtual Network
resource "azurerm_virtual_network" "vnet" {
  name                = var.vnet_name
  resource_group_name = var.resource_group_name
  location            = var.location
  address_space       = var.vnet_address_space
  tags                = var.tags
}

# Subnets
resource "azurerm_subnet" "subnets" {
  for_each = var.subnets

  name                 = each.value.name
  resource_group_name  = var.resource_group_name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = each.value.address_prefixes
  service_endpoints    = each.value.service_endpoints

  # Explicit dependency on VNet to prevent timing issues
  depends_on = [azurerm_virtual_network.vnet]

  # Private endpoint network policies removed for provider compatibility
  # Private endpoints will work without explicit policy configuration

  # Add delegation for PostgreSQL Flexible Server on db subnet ONLY
  # Container Apps Environment handles its own delegation automatically
  dynamic "delegation" {
    for_each = each.key == "db" ? [1] : []
    content {
      name = "postgresql_delegation"
      service_delegation {
        name    = "Microsoft.DBforPostgreSQL/flexibleServers"
        actions = ["Microsoft.Network/virtualNetworks/subnets/join/action"]
      }
    }
  }

  dynamic "delegation" {
    for_each = each.key == "app" ? [1] : []
    content {
      name = "app_service_delegation"
      service_delegation {
        name    = "Microsoft.Web/serverFarms"
        actions = ["Microsoft.Network/virtualNetworks/subnets/join/action"]
      }
    }
  }
}

# Network Security Group for App Subnet
resource "azurerm_network_security_group" "app_nsg" {
  name                = "app-nsg"
  location            = var.location
  resource_group_name = var.resource_group_name
  tags                = var.tags

  security_rule {
    name                       = "AllowHTTP"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "80"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  security_rule {
    name                       = "AllowHTTPS"
    priority                   = 110
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "443"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }
}

# Network Security Group for DB Subnet
resource "azurerm_network_security_group" "db_nsg" {
  name                = "db-nsg"
  location            = var.location
  resource_group_name = var.resource_group_name
  tags                = var.tags

  security_rule {
    name                       = "AllowPostgres"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "5432"
    source_address_prefix      = "10.0.1.0/24" # App subnet
    destination_address_prefix = "*"
  }
}

# Associate NSGs with subnets
resource "azurerm_subnet_network_security_group_association" "app_nsg_association" {
  subnet_id                 = azurerm_subnet.subnets["app"].id
  network_security_group_id = azurerm_network_security_group.app_nsg.id

  # Explicit dependencies to prevent timing issues
  depends_on = [
    azurerm_virtual_network.vnet,
    azurerm_subnet.subnets,
    azurerm_network_security_group.app_nsg
  ]

  timeouts {
    create = "10m"
    delete = "10m"
  }
}

resource "azurerm_subnet_network_security_group_association" "db_nsg_association" {
  subnet_id                 = azurerm_subnet.subnets["db"].id
  network_security_group_id = azurerm_network_security_group.db_nsg.id

  # Explicit dependencies to prevent timing issues
  depends_on = [
    azurerm_virtual_network.vnet,
    azurerm_subnet.subnets,
    azurerm_network_security_group.db_nsg
  ]

  timeouts {
    create = "10m"
    delete = "10m"
  }
}
