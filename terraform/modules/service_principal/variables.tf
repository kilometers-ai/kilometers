variable "acr_id" {
  description = "The ID of the Azure Container Registry"
  type        = string
}

variable "resource_group_id" {
  description = "The ID of the resource group for Container Apps deployment"
  type        = string
}

variable "display_name" {
  description = "The display name for the service principal"
  type        = string
  default     = "github-actions-acr"
}

variable "github_org" {
  description = "The GitHub organization/username"
  type        = string
  default     = null
}

variable "github_repo" {
  description = "The GitHub repository in the format 'owner/repo'. If not provided, will use organization-wide access."
  type        = string
  default     = null
}

variable "github_branch" {
  description = "The GitHub branch to allow. Defaults to 'main'"
  type        = string
  default     = "main"
}

variable "environment" {
  description = "The environment name (e.g., dev, prod) for the GitHub Actions workflow"
  type        = string
  default     = "dev"
}
