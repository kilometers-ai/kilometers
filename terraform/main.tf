terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
    azuread = {
      source  = "hashicorp/azuread"
      version = "~> 3.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
    github = {
      source  = "integrations/github"
      version = "~> 6.0"
    }
  }
}

#TODO: Add storage account for terraform state?

# Configure the Microsoft Azure Provider
provider "azurerm" {
  subscription_id = var.subscription_id
  features {
    key_vault {
      purge_soft_delete_on_destroy = false
    }
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
  }
}

provider "azuread" {}

provider "github" {
  owner = var.github_organization
  token = var.github_token
}

# Generate random suffix for unique resource names
resource "random_id" "suffix" {
  byte_length = 4
}

locals {
  resource_suffix = random_id.suffix.hex
  location        = var.location
  environment     = var.environment
  project_name    = "kilometers"

  # Common tags
  tags = {
    Environment = local.environment
    Project     = local.project_name
    ManagedBy   = "Terraform"
    CreatedBy   = "GitHub Actions"
  }
}

resource "azurerm_resource_group" "main" {
  name     = "rg-${local.project_name}-${local.environment}"
  location = local.location
  tags = merge(local.tags, {
    CICD_Validated = "true"
  })
}

# Networking Module
module "networking" {
  source = "./modules/networking"

  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  vnet_name           = "${local.project_name}-${local.environment}-vnet"

  tags = local.tags
}

# PostgreSQL Database Module
module "database" {
  source = "./modules/database"

  server_name         = "${local.project_name}-${local.environment}-psql-${local.resource_suffix}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location

  admin_username = var.db_admin_username
  admin_password = var.db_admin_password
  database_name  = "kilometers"

  db_subnet_id       = module.networking.db_subnet_id
  virtual_network_id = module.networking.vnet_id

  # Production environment settings
  sku_name                     = var.environment == "prod" ? "B_Standard_B2ms" : "B_Standard_B1ms"
  storage_mb                   = var.environment == "prod" ? 65536 : 32768 # 64GB for prod, 32GB for dev
  backup_retention_days        = var.environment == "prod" ? 30 : 7
  geo_redundant_backup_enabled = var.environment == "prod" ? true : false
  postgres_version             = "15"

  tags = local.tags

  depends_on = [module.networking]
}

# Key Vault Module
module "key_vault" {
  source = "./modules/key_vault"

  key_vault_name      = "${local.project_name}${local.environment}kv${local.resource_suffix}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location

  # Security configuration
  public_network_access_enabled = var.environment == "dev" ? true : false
  create_private_endpoint       = var.environment == "prod" ? true : false
  create_private_dns_zone       = var.environment == "prod" ? true : false
  private_endpoint_subnet_id    = module.networking.private_endpoint_subnet_id
  virtual_network_id            = module.networking.vnet_id
  allowed_subnet_ids            = [module.networking.app_subnet_id]
  allowed_ip_ranges             = var.allowed_ip_ranges

  # Secrets to store
  database_connection_string = module.database.connection_string

  # Additional secrets for Kilometers
  additional_secrets = {
    #TODO: whats this for??
    "kilometers-api-key"       = random_password.api_key.result
    "app-environment"          = var.environment
    "api-version"              = var.api_version
    "application-insights-key" = azurerm_application_insights.main.instrumentation_key
  }

  tags = local.tags

  depends_on = [module.database]
}

# Application Insights
resource "azurerm_application_insights" "main" {
  name                = "ai-${local.project_name}-${local.environment}-${local.resource_suffix}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  application_type    = "web"

  tags = local.tags
}

# Storage Account for CLI binaries and logs
resource "azurerm_storage_account" "main" {
  name                     = "st${local.project_name}${local.environment}${local.resource_suffix}"
  resource_group_name      = azurerm_resource_group.main.name
  location                 = azurerm_resource_group.main.location
  account_tier             = "Standard"
  account_replication_type = var.environment == "prod" ? "GRS" : "LRS"

  tags = local.tags

  # Add timeouts for slow operations
  timeouts {
    create = "30m"
    update = "30m"
    delete = "30m"
  }
}

# App Service Plan for API
resource "azurerm_service_plan" "api" {
  name                = "asp-${local.project_name}-${local.environment}-${local.resource_suffix}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  os_type             = "Linux"
  sku_name            = var.environment == "dev" ? "B1" : (var.environment == "staging" ? "S1" : "P1v2")

  tags = local.tags
}

# App Service for API
#TODO: cost comparison with container apps.
resource "azurerm_linux_web_app" "api" {
  name                = "app-${local.project_name}-api-${local.environment}-${local.resource_suffix}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  service_plan_id     = azurerm_service_plan.api.id

  site_config {
    application_stack {
      dotnet_version = "9.0"
    }

    always_on = var.environment == "prod" ? true : false

    health_check_path                 = "/health"
    health_check_eviction_time_in_min = 2

    cors {
      allowed_origins = concat(
        ["https://app.kilometers.ai", "https://kilometers.ai"],
        var.environment == "dev" ? ["https://localhost:3000", "http://localhost:3000"] : []
      )
    }

    # VNet Integration
    vnet_route_all_enabled = true
  }

  app_settings = {
    "ASPNETCORE_ENVIRONMENT"                  = var.environment == "prod" ? "Production" : "Development"
    "APPLICATIONINSIGHTS_CONNECTION_STRING"   = azurerm_application_insights.main.connection_string
    "ConnectionStrings__Default"              = "@Microsoft.KeyVault(VaultName=${module.key_vault.key_vault_name};SecretName=database-connection-string)"
    "KeyVault__VaultUri"                      = module.key_vault.key_vault_uri
    "Logging__LogLevel__Default"              = var.environment == "prod" ? "Information" : "Debug"
    "Logging__LogLevel__Microsoft.AspNetCore" = "Warning"
  }

  identity {
    type = "SystemAssigned"
  }

  virtual_network_subnet_id     = module.networking.app_subnet_id
  public_network_access_enabled = true

  tags = local.tags

  depends_on = [module.key_vault, module.database]
}

# Grant API managed identity access to Key Vault
resource "azurerm_role_assignment" "api_keyvault_reader" {
  scope                = module.key_vault.key_vault_id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = azurerm_linux_web_app.api.identity[0].principal_id
}

# CLI Distribution Module
module "cli_distribution" {
  source = "./modules/cli-distribution"

  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  environment         = local.environment
  tags                = local.tags
}

# GitHub Service Principal for CI/CD
resource "azuread_application" "github_actions" {
  display_name = "${local.project_name}-github-actions-${local.environment}"
}

resource "azuread_service_principal" "github_actions" {
  client_id = azuread_application.github_actions.client_id
}

resource "azuread_service_principal_password" "github_actions" {
  service_principal_id = azuread_service_principal.github_actions.id
}

# Assign roles to GitHub Actions service principal
resource "azurerm_role_assignment" "github_actions_contributor" {
  scope                = azurerm_resource_group.main.id
  role_definition_name = "Contributor"
  principal_id         = azuread_service_principal.github_actions.object_id
}

resource "azurerm_role_assignment" "github_actions_keyvault" {
  scope                = module.key_vault.key_vault_id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = azuread_service_principal.github_actions.object_id
}

# Generate API Key
resource "random_password" "api_key" {
  length  = 32
  special = true
}

# GitHub Repository Secrets Management
data "github_repository" "main" {
  name = var.github_repository
}

# Store Azure credentials in GitHub
resource "github_actions_secret" "azure_credentials" {
  repository  = data.github_repository.main.name
  secret_name = "AZURE_CREDENTIALS"
  plaintext_value = jsonencode({
    clientId       = azuread_application.github_actions.client_id
    clientSecret   = azuread_service_principal_password.github_actions.value
    subscriptionId = data.azurerm_client_config.current.subscription_id
    tenantId       = data.azurerm_client_config.current.tenant_id
  })
}

# Store individual Azure credentials (some actions prefer these)
resource "github_actions_secret" "arm_client_id" {
  repository      = data.github_repository.main.name
  secret_name     = "ARM_CLIENT_ID"
  plaintext_value = azuread_application.github_actions.client_id
}

resource "github_actions_secret" "arm_client_secret" {
  repository      = data.github_repository.main.name
  secret_name     = "ARM_CLIENT_SECRET"
  plaintext_value = azuread_service_principal_password.github_actions.value
}

resource "github_actions_secret" "arm_subscription_id" {
  repository      = data.github_repository.main.name
  secret_name     = "ARM_SUBSCRIPTION_ID"
  plaintext_value = data.azurerm_client_config.current.subscription_id
}

resource "github_actions_secret" "arm_tenant_id" {
  repository      = data.github_repository.main.name
  secret_name     = "ARM_TENANT_ID"
  plaintext_value = data.azurerm_client_config.current.tenant_id
}

# Store infrastructure outputs in GitHub
resource "github_actions_secret" "api_url" {
  repository      = data.github_repository.main.name
  secret_name     = "API_URL"
  plaintext_value = "https://${azurerm_linux_web_app.api.default_hostname}"
}

resource "github_actions_secret" "api_app_service_name" {
  repository      = data.github_repository.main.name
  secret_name     = "API_APP_SERVICE_NAME"
  plaintext_value = azurerm_linux_web_app.api.name
}

resource "github_actions_secret" "database_connection_string" {
  repository      = data.github_repository.main.name
  secret_name     = "DATABASE_CONNECTION_STRING"
  plaintext_value = module.database.connection_string
}

resource "github_actions_secret" "cli_storage_account" {
  repository      = data.github_repository.main.name
  secret_name     = "CLI_STORAGE_ACCOUNT"
  plaintext_value = module.cli_distribution.storage_account_name
}

resource "github_actions_secret" "kilometers_api_key" {
  repository      = data.github_repository.main.name
  secret_name     = "KILOMETERS_API_KEY"
  plaintext_value = random_password.api_key.result
}

# Data source for current Azure config
data "azurerm_client_config" "current" {}
