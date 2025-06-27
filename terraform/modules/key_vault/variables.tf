# /modules/key_vault/variables.tf

variable "key_vault_name" {
  description = "Name of the Azure Key Vault"
  type        = string
  validation {
    condition     = length(var.key_vault_name) >= 3 && length(var.key_vault_name) <= 24
    error_message = "Key vault name must be between 3 and 24 characters."
  }
}

variable "location" {
  description = "Azure region where resources will be created"
  type        = string
}

variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
}

variable "sku_name" {
  description = "The SKU name of the key vault"
  type        = string
  default     = "standard"
  validation {
    condition     = contains(["standard", "premium"], var.sku_name)
    error_message = "SKU name must be either 'standard' or 'premium'."
  }
}

variable "public_network_access_enabled" {
  description = "Whether public network access is allowed for this Key Vault"
  type        = bool
  default     = false
}

variable "default_network_action" {
  description = "The default action to use when no rules match from ip_rules / virtual_network_subnet_ids"
  type        = string
  default     = "Deny"
  validation {
    condition     = contains(["Allow", "Deny"], var.default_network_action)
    error_message = "Default network action must be either 'Allow' or 'Deny'."
  }
}

variable "allowed_subnet_ids" {
  description = "List of subnet IDs that are allowed to access the Key Vault"
  type        = list(string)
  default     = []
}

variable "allowed_ip_ranges" {
  description = "List of IP ranges that are allowed to access the Key Vault"
  type        = list(string)
  default     = []
}

variable "soft_delete_retention_days" {
  description = "The number of days that items should be retained for once soft-deleted"
  type        = number
  default     = 7
  validation {
    condition     = var.soft_delete_retention_days >= 7 && var.soft_delete_retention_days <= 90
    error_message = "Soft delete retention days must be between 7 and 90."
  }
}

variable "purge_protection_enabled" {
  description = "Is Purge Protection enabled for this Key Vault?"
  type        = bool
  default     = false
}

variable "create_private_endpoint" {
  description = "Whether to create a private endpoint for the Key Vault"
  type        = bool
  default     = false
}

variable "private_endpoint_subnet_id" {
  description = "Subnet ID for the private endpoint"
  type        = string
  default     = ""
}

variable "private_dns_zone_ids" {
  description = "List of private DNS zone IDs to associate with the private endpoint"
  type        = list(string)
  default     = []
}

variable "create_private_dns_zone" {
  description = "Whether to create a private DNS zone for Key Vault"
  type        = bool
  default     = false
}

variable "virtual_network_id" {
  description = "Virtual Network ID for DNS zone linking"
  type        = string
  default     = ""
}

variable "database_connection_string" {
  description = "Database connection string to store in Key Vault"
  type        = string
  default     = ""
  sensitive   = true
}

# variable "servicebus_connection_string" {
#   description = "Service Bus connection string to store in Key Vault"
#   type        = string
#   default     = ""
#   sensitive   = true
# }

variable "additional_secrets" {
  description = "Map of additional secrets to store in Key Vault"
  type        = map(string)
  default     = {}
  sensitive   = true
}

variable "tags" {
  description = "A map of tags to assign to the resources"
  type        = map(string)
  default     = {}
}

# NOTE: Removed container_app_identity_principal_id and github_actions_principal_id
# to break circular dependencies. Role assignments are now created in main.tf
