resource "azuread_application" "github_actions" {
  display_name = var.display_name
  description  = "Service principal for GitHub Actions to push to ACR"

  sign_in_audience = "AzureADMyOrg"
  owners           = [data.azurerm_client_config.current.object_id]
}

resource "azuread_service_principal" "github_actions" {
  client_id    = azuread_application.github_actions.client_id
  use_existing = false

  # Optional but recommended settings
  description = "Service principal for GitHub Actions to push to ACR"
  owners      = [data.azurerm_client_config.current.object_id]
}

resource "azuread_service_principal_password" "github_actions" {
  service_principal_id = azuread_service_principal.github_actions.id
}

resource "azurerm_role_assignment" "acr_push" {
  scope                = var.acr_id
  role_definition_name = "AcrPush"
  principal_id         = azuread_service_principal.github_actions.object_id
}

# Add Contributor role for Container Apps deployment
resource "azurerm_role_assignment" "container_apps_contributor" {
  scope                = var.resource_group_id
  role_definition_name = "Contributor"
  principal_id         = azuread_service_principal.github_actions.object_id
}

locals {
  # Updated to match actual GitHub Actions OIDC token format
  github_subject = var.github_repo != null ? "repo:${var.github_repo}:ref:refs/heads/${var.github_branch}" : "repo:${var.github_org}/*:ref:refs/heads/${var.github_branch}"
}

# OIDC configuration for GitHub Actions
resource "azuread_application_federated_identity_credential" "github_actions" {
  application_id = azuread_application.github_actions.id
  display_name   = "github-actions-oidc"
  description    = "OIDC configuration for GitHub Actions"
  audiences      = ["api://AzureADTokenExchange"]
  issuer         = "https://token.actions.githubusercontent.com"
  subject        = local.github_subject
}

# Get current client configuration
data "azurerm_client_config" "current" {}
