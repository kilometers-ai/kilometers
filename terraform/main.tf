# Azure/Terraform Configuration for Kilometers.ai
# CI/CD Pipeline Validation: This comment added to test manual secrets integration

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
        var.environment == "dev" ? [
          "https://localhost:3000",
          "http://localhost:3000",
          "https://app.dev.kilometers.ai"
        ] : []
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

# TODO: Add custom domain binding for API (api.dev.kilometers.ai)
# Manual configuration required until terraform resource type is resolved

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

# Static Web App Module for Marketing Site
module "static_web_app" {
  source = "./modules/static_web_app"

  static_web_app_name = "stapp-${local.project_name}-marketing-${local.environment}-${local.resource_suffix}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku_tier            = var.environment == "prod" ? "Standard" : "Free"
  sku_size            = var.environment == "prod" ? "Standard" : "Free"

  app_settings = {
    # Future: Add any required app settings here
  }

  # Custom domains - both apex and www for all environments (for testing)
  custom_domains = ["www.kilometers.ai", "kilometers.ai"]

  tags = local.tags
}

# Dashboard Static Web App Module
module "dashboard_static_web_app" {
  source = "./modules/static_web_app"

  static_web_app_name = "stapp-${local.project_name}-dashboard-${local.environment}-${local.resource_suffix}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku_tier            = var.environment == "prod" ? "Standard" : "Free"
  sku_size            = var.environment == "prod" ? "Standard" : "Free"

  app_settings = {
    # Dashboard-specific settings will be added here as needed
  }

  # Dashboard will be hosted at app.kilometers.ai in production, app.dev.kilometers.ai in dev
  custom_domains = var.environment == "prod" ? ["app.kilometers.ai"] : ["app.dev.kilometers.ai"]

  tags = local.tags
}

# --- GitHub Service Principal for CI/CD ---
# Use a data source to look up the existing service principal used by the pipeline
data "azuread_service_principal" "github_actions" {
  client_id = var.arm_client_id
}

variable "arm_client_id" {
  description = "The Client ID of the existing Service Principal for GitHub Actions."
  type        = string
}

# Assign roles to the existing GitHub Actions service principal
resource "azurerm_role_assignment" "github_actions_contributor" {
  scope                = azurerm_resource_group.main.id
  role_definition_name = "Contributor"
  principal_id         = data.azuread_service_principal.github_actions.object_id
}

resource "azurerm_role_assignment" "github_actions_keyvault" {
  scope                = module.key_vault.key_vault_id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = data.azuread_service_principal.github_actions.object_id
}

# Grant GitHub Actions service principal access to the Terraform state backend
data "azurerm_storage_account" "terraform_state" {
  name                = "stkilometerstfstate"
  resource_group_name = "rg-kilometers-terraform"
}

resource "azurerm_role_assignment" "github_actions_storage" {
  scope                = data.azurerm_storage_account.terraform_state.id
  role_definition_name = "Storage Account Contributor"
  principal_id         = data.azuread_service_principal.github_actions.object_id
}

# Grant GitHub Actions service principal access to CLI distribution storage account
resource "azurerm_role_assignment" "github_actions_cli_storage_contributor" {
  scope                = module.cli_distribution.storage_account_id
  role_definition_name = "Storage Blob Data Contributor"
  principal_id         = data.azuread_service_principal.github_actions.object_id
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

# Store infrastructure outputs in GitHub
resource "github_actions_secret" "api_url" {
  repository      = data.github_repository.main.name
  secret_name     = "API_URL"
  plaintext_value = var.environment == "dev" ? "https://api.dev.kilometers.ai" : "https://${azurerm_linux_web_app.api.default_hostname}"
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

resource "github_actions_secret" "db_admin_password" {
  repository      = data.github_repository.main.name
  secret_name     = "DB_ADMIN_PASSWORD"
  plaintext_value = var.db_admin_password
}

resource "github_actions_secret" "gh_token" {
  repository      = data.github_repository.main.name
  secret_name     = "GH_TOKEN"
  plaintext_value = var.github_token
}

# Static Web App GitHub Secrets
resource "github_actions_secret" "azure_static_web_apps_api_token" {
  repository      = data.github_repository.main.name
  secret_name     = "AZURE_STATIC_WEB_APPS_API_TOKEN"
  plaintext_value = module.static_web_app.api_key

  depends_on = [module.static_web_app]
}

# Dashboard Static Web App GitHub Secret
resource "github_actions_secret" "azure_static_web_apps_dashboard_token" {
  repository      = data.github_repository.main.name
  secret_name     = "AZURE_STATIC_WEB_APPS_DASHBOARD_TOKEN"
  plaintext_value = module.dashboard_static_web_app.api_key

  depends_on = [module.dashboard_static_web_app]
}

# Marketing Site Environment Variables
locals {
  marketing_environment_variables = {
    # Core Application Settings
    "NEXT_PUBLIC_USE_EXTERNAL_APP"    = "false"
    "NEXT_PUBLIC_EXTERNAL_APP_URL"    = "https://app.kilometers.ai"
    "NEXT_PUBLIC_ENABLE_ANALYTICS"    = "true"
    "NEXT_PUBLIC_SHOW_COOKIE_BANNER"  = "true"
    "NEXT_PUBLIC_ENABLE_CONTACT_FORM" = "false"
    "NEXT_PUBLIC_ENABLE_GITHUB_OAUTH" = "false"

    # Connection Verification Features (Safe Defaults)
    "NEXT_PUBLIC_ENABLE_REAL_CONNECTION_CHECK"      = "false"
    "NEXT_PUBLIC_CONNECTION_CHECK_METHOD"           = "polling"
    "NEXT_PUBLIC_CONNECTION_TIMEOUT_MS"             = "120000"
    "NEXT_PUBLIC_ENABLE_CONNECTION_TROUBLESHOOTING" = "false"
    "NEXT_PUBLIC_ENABLE_MANUAL_VERIFICATION_SKIP"   = "true"
    "NEXT_PUBLIC_ENABLE_CONFIG_VALIDATION"          = "false"
    "NEXT_PUBLIC_CONNECTION_CHECK_POLL_INTERVAL_MS" = "2000"
    "NEXT_PUBLIC_ENABLE_CONNECTION_ANALYTICS"       = "false"
  }
}

# Store each marketing environment variable as GitHub secret
resource "github_actions_secret" "marketing_env_vars" {
  for_each        = local.marketing_environment_variables
  repository      = data.github_repository.main.name
  secret_name     = each.key
  plaintext_value = each.value
}

# Data source for current Azure config
data "azurerm_client_config" "current" {}

# DNS Zone for kilometers.ai domain
resource "azurerm_dns_zone" "kilometers_ai" {
  name                = "kilometers.ai"
  resource_group_name = azurerm_resource_group.main.name
  tags                = local.tags
}

# DNS CNAME records for subdomains
resource "azurerm_dns_cname_record" "www" {
  name                = "www"
  zone_name           = azurerm_dns_zone.kilometers_ai.name
  resource_group_name = azurerm_resource_group.main.name
  ttl                 = 300
  record              = azurerm_dns_zone.kilometers_ai.name
}

resource "azurerm_dns_cname_record" "get" {
  name                = "get"
  zone_name           = azurerm_dns_zone.kilometers_ai.name
  resource_group_name = azurerm_resource_group.main.name
  ttl                 = 300
  record              = module.cli_distribution.cdn_endpoint_hostname
}

resource "azurerm_dns_cname_record" "api_dev" {
  name                = "api.dev"
  zone_name           = azurerm_dns_zone.kilometers_ai.name
  resource_group_name = azurerm_resource_group.main.name
  ttl                 = 300
  record              = azurerm_linux_web_app.api.default_hostname
}

resource "azurerm_dns_cname_record" "app_dev" {
  name                = "app.dev"
  zone_name           = azurerm_dns_zone.kilometers_ai.name
  resource_group_name = azurerm_resource_group.main.name
  ttl                 = 300
  record              = module.dashboard_static_web_app.default_host_name
}

# DNS A record for apex domain (kilometers.ai) - points to static web app
# Note: Azure Static Web Apps requires A record or alias record for apex domains (not CNAME)
resource "azurerm_dns_a_record" "apex" {
  name                = "@"
  zone_name           = azurerm_dns_zone.kilometers_ai.name
  resource_group_name = azurerm_resource_group.main.name
  ttl                 = 300
  target_resource_id  = module.static_web_app.id
}

# DNS TXT record for apex domain validation (includes both Google verification and Azure Static Web App validation)
resource "azurerm_dns_txt_record" "apex_validation" {
  name                = "@"
  zone_name           = azurerm_dns_zone.kilometers_ai.name
  resource_group_name = azurerm_resource_group.main.name
  ttl                 = 300

  record {
    value = "google-site-verification=PopzhO77Rj1FgXroseyPyalSOsFbXnQeMLFwZ9jX_aY"
  }

  record {
    value = "_voe97n94ae4cdwy1zf9n9i5hp09vtqd"
  }

  tags = local.tags
}
