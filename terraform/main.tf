terraform {
  required_version = ">= 1.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

# Generate random suffix for unique resource names
resource "random_id" "suffix" {
  byte_length = 4
}

locals {
  resource_suffix = random_id.suffix.hex
  location        = "East US"
  environment     = "prod"

  # Common tags
  tags = {
    Environment = local.environment
    Project     = "Kilometers"
    CreatedBy   = "Terraform"
  }
}

# Resource Group
resource "azurerm_resource_group" "main" {
  name     = "rg-kilometers-${local.environment}"
  location = local.location
  tags     = local.tags
}

# App Service Plan for hosting the API
resource "azurerm_service_plan" "main" {
  name                = "asp-kilometers-${local.environment}-${local.resource_suffix}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  os_type             = "Linux"
  sku_name            = "F1" # Free tier for development/MVP, can scale later
  tags                = local.tags
}

# PostgreSQL Flexible Server
resource "azurerm_postgresql_flexible_server" "main" {
  name                = "psql-kilometers-${local.environment}-${local.resource_suffix}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  version             = "15"

  administrator_login    = "kilometersdba"
  administrator_password = var.db_password

  storage_mb = 32768             # 32GB storage
  sku_name   = "B_Standard_B1ms" # Burstable tier for MVP

  backup_retention_days = 7

  tags = local.tags
}

# PostgreSQL Database
resource "azurerm_postgresql_flexible_server_database" "main" {
  name      = "kilometers"
  server_id = azurerm_postgresql_flexible_server.main.id
  collation = "en_US.utf8"
  charset   = "utf8"
}

# PostgreSQL Firewall Rule - Allow Azure Services
resource "azurerm_postgresql_flexible_server_firewall_rule" "azure_services" {
  name             = "AllowAllAzureServicesAndResourcesWithinAzureIps"
  server_id        = azurerm_postgresql_flexible_server.main.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

# Storage Account for logs, static files, etc.
resource "azurerm_storage_account" "main" {
  name                     = "stkilometers${local.resource_suffix}"
  resource_group_name      = azurerm_resource_group.main.name
  location                 = azurerm_resource_group.main.location
  account_tier             = "Standard"
  account_replication_type = "LRS"

  tags = local.tags
}

# Application Insights for monitoring
resource "azurerm_application_insights" "main" {
  name                = "ai-kilometers-${local.environment}-${local.resource_suffix}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  application_type    = "web"

  tags = local.tags
}

# Key Vault for storing secrets
resource "azurerm_key_vault" "main" {
  name                = "kv-kilometers-${local.resource_suffix}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  tenant_id           = data.azurerm_client_config.current.tenant_id
  sku_name            = "standard"

  access_policy {
    tenant_id = data.azurerm_client_config.current.tenant_id
    object_id = data.azurerm_client_config.current.object_id

    secret_permissions = [
      "Get",
      "List",
      "Set",
      "Delete",
      "Recover",
      "Backup",
      "Restore"
    ]
  }

  tags = local.tags
}

# Store database connection string in Key Vault
resource "azurerm_key_vault_secret" "db_connection_string" {
  name         = "DatabaseConnectionString"
  value        = "Host=${azurerm_postgresql_flexible_server.main.fqdn};Database=${azurerm_postgresql_flexible_server_database.main.name};Username=${azurerm_postgresql_flexible_server.main.administrator_login};Password=${var.db_password};SSL Mode=Require"
  key_vault_id = azurerm_key_vault.main.id
}

# App Service for the API
resource "azurerm_linux_web_app" "api" {
  name                = "app-kilometers-api-${local.resource_suffix}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  service_plan_id     = azurerm_service_plan.main.id

  site_config {
    application_stack {
      dotnet_version = "8.0"
    }

    always_on = false # Required for Free tier

    # Health check configuration
    health_check_path = "/health"

    # CORS configuration for frontend
    cors {
      allowed_origins = ["https://*.kilometers.ai", "https://localhost:3000"]
    }
  }

  app_settings = {
    "ASPNETCORE_ENVIRONMENT"                  = "Production"
    "APPLICATIONINSIGHTS_CONNECTION_STRING"   = azurerm_application_insights.main.connection_string
    "ConnectionStrings__Default"              = "@Microsoft.KeyVault(VaultName=${azurerm_key_vault.main.name};SecretName=${azurerm_key_vault_secret.db_connection_string.name})"
    "KeyVault__VaultUri"                      = azurerm_key_vault.main.vault_uri
    "Logging__LogLevel__Default"              = "Information"
    "Logging__LogLevel__Microsoft.AspNetCore" = "Warning"
  }

  identity {
    type = "SystemAssigned"
  }

  tags = local.tags
}

# Give the App Service access to Key Vault
resource "azurerm_key_vault_access_policy" "app_service" {
  key_vault_id = azurerm_key_vault.main.id
  tenant_id    = azurerm_linux_web_app.api.identity[0].tenant_id
  object_id    = azurerm_linux_web_app.api.identity[0].principal_id

  secret_permissions = [
    "Get",
    "List"
  ]
}

# Data source for current Azure client config
data "azurerm_client_config" "current" {}

# Variables
variable "db_password" {
  description = "Password for the PostgreSQL database administrator"
  type        = string
  sensitive   = true
}

# Outputs
output "api_url" {
  description = "URL of the deployed API"
  value       = "https://${azurerm_linux_web_app.api.default_hostname}"
}

output "database_fqdn" {
  description = "Fully qualified domain name of the PostgreSQL server"
  value       = azurerm_postgresql_flexible_server.main.fqdn
}

output "storage_account_name" {
  description = "Name of the storage account"
  value       = azurerm_storage_account.main.name
}

output "application_insights_key" {
  description = "Application Insights instrumentation key"
  value       = azurerm_application_insights.main.instrumentation_key
  sensitive   = true
}

output "resource_group_name" {
  description = "Name of the resource group"
  value       = azurerm_resource_group.main.name
}
