output "client_id" {
  description = "The client ID (application ID) of the service principal"
  value       = azuread_application.github_actions.client_id
}

output "client_secret" {
  description = "The client secret of the service principal"
  value       = azuread_service_principal_password.github_actions.value
  sensitive   = true
}

output "principal_id" {
  description = "The object ID of the service principal (for role assignments)"
  value       = azuread_service_principal.github_actions.object_id
}


