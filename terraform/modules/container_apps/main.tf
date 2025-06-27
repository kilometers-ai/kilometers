resource "azurerm_user_assigned_identity" "container_app" {
  name                = "${var.app_name}-identity"
  location            = var.location
  resource_group_name = var.resource_group_name
  tags                = var.tags
}

resource "azurerm_role_assignment" "acr_pull" {
  scope                = var.acr_id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_user_assigned_identity.container_app.principal_id
}

# Log Analytics Workspace for Container Apps
resource "azurerm_log_analytics_workspace" "main" {
  name                = "${var.environment_name}-logs"
  location            = var.location
  resource_group_name = var.resource_group_name
  sku                 = "PerGB2018"
  retention_in_days   = 30

  tags = var.tags
}

resource "azurerm_container_app_environment" "main" {
  name                       = var.environment_name
  location                   = var.location
  resource_group_name        = var.resource_group_name
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id

  # Connect to VNet for private networking (database access)
  infrastructure_subnet_id = var.vnet_subnet_id != "" ? var.vnet_subnet_id : null

  # 🔧 FIXED: Keep public access even with VNet integration
  # Set to false to allow external/public access to ingress endpoints
  internal_load_balancer_enabled = false # Changed from conditional to false

  tags = var.tags
}

# Container App with public ingress
resource "azurerm_container_app" "api" {
  name                         = var.app_name
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = var.resource_group_name
  revision_mode                = "Single"
  tags                         = var.tags

  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.container_app.id]
  }

  registry {
    server   = var.acr_login_server
    identity = azurerm_user_assigned_identity.container_app.id
  }

  # 🌐 PUBLIC INGRESS CONFIGURATION
  ingress {
    allow_insecure_connections = false # Force HTTPS
    external_enabled           = true  # Enable external access
    target_port                = 80    # Your app listens on port 80

    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }

  template {
    min_replicas = var.min_replicas
    max_replicas = var.max_replicas

    container {
      name   = "api"
      image  = var.image_exists ? "${var.acr_login_server}/${var.image_name}:latest" : "mcr.microsoft.com/azuredocs/containerapps-helloworld:latest"
      cpu    = var.cpu_limit
      memory = var.memory_limit

      env {
        name  = "ASPNETCORE_ENVIRONMENT"
        value = var.environment
      }

      env {
        name  = "ASPNETCORE_URLS"
        value = "http://+:80"
      }

      # Add database connection string if provided
      dynamic "env" {
        for_each = var.database_connection_string != "" ? [1] : []
        content {
          name  = "DATABASE_CONNECTION_STRING"
          value = var.database_connection_string
        }
      }

      # Add Key Vault name if provided
      dynamic "env" {
        for_each = var.key_vault_name != "" ? [1] : []
        content {
          name  = "KeyVault__Name"
          value = var.key_vault_name
        }
      }

      # Add Service Bus namespace if provided
      # dynamic "env" {
      #   for_each = var.service_bus_namespace != "" ? [1] : []
      #   content {
      #     name  = "ServiceBus__Namespace"
      #     value = var.service_bus_namespace
      #   }
      # }

      # Add Azure Client ID for managed identity
      env {
        name  = "AZURE_CLIENT_ID"
        value = azurerm_user_assigned_identity.container_app.client_id
      }
    }
  }
}
