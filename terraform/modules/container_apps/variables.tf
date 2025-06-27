
variable "environment_name" {
  description = "Name of the Container App Environment"
  type        = string
}

variable "app_name" {
  description = "Name of the Container App"
  type        = string
}

variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
}

variable "location" {
  description = "Azure region where resources will be created"
  type        = string
}

variable "acr_login_server" {
  description = "Login server URL of the Azure Container Registry"
  type        = string
}

variable "acr_id" {
  description = "ID of the Azure Container Registry"
  type        = string
}

#TODO: can we reevaluate this configuration. Do I have to know the image name in advance?
variable "image_name" {
  description = "Name of the container image"
  type        = string
  default     = "sample-api"
}

variable "image_exists" {
  description = "Whether the custom image exists in ACR (if false, uses placeholder)"
  type        = bool
  default     = false
}
variable "environment" {
  description = "Environment name (Development, Production, etc.)"
  type        = string
  default     = "Development"
}

variable "cpu_limit" {
  description = "CPU limit for the container"
  type        = number
  default     = 0.5
}

variable "memory_limit" {
  description = "Memory limit for the container"
  type        = string
  default     = "1Gi"
}

variable "min_replicas" {
  description = "Minimum number of replicas"
  type        = number
  default     = 1
}

variable "max_replicas" {
  description = "Maximum number of replicas"
  type        = number
  default     = 3
}

variable "tags" {
  description = "Tags to be applied to all resources"
  type        = map(string)
  default     = {}
}

variable "database_connection_string" {
  description = "PostgreSQL database connection string"
  type        = string
  default     = ""
  sensitive   = true
}

variable "vnet_subnet_id" {
  description = "ID of the VNet subnet for Container Apps Environment"
  type        = string
  default     = ""
}

variable "key_vault_name" {
  description = "Name of the Azure Key Vault"
  type        = string
  default     = ""
}

# variable "service_bus_namespace" {
#   description = "Name of the Azure Service Bus namespace"
#   type        = string
#   default     = ""
# }
