variable "subscription_id" {
  description = "Azure subscription ID"
  type        = string
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod"
  }
}

variable "location" {
  description = "Azure region for resources"
  type        = string
  default     = "East US"
}

variable "db_admin_username" {
  description = "PostgreSQL administrator username"
  type        = string
  default     = "pgadmin"
}

variable "db_admin_password" {
  description = "PostgreSQL administrator password"
  type        = string
  sensitive   = true

  validation {
    condition     = length(var.db_admin_password) >= 8
    error_message = "Database password must be at least 8 characters long"
  }
}

variable "allowed_ip_ranges" {
  description = "List of IP ranges allowed to access Key Vault"
  type        = list(string)
  default     = []
}

variable "api_version" {
  description = "Version of the Kilometers API"
  type        = string
  default     = "1.0.0"
}

# GitHub Integration Variables
variable "github_organization" {
  description = "GitHub organization or username"
  type        = string
}

variable "github_repository" {
  description = "GitHub repository name"
  type        = string
  default     = "kilometers"
}

variable "github_token" {
  description = "GitHub personal access token with repo and admin:org permissions"
  type        = string
  sensitive   = true
}

# Additional configuration for different environments
locals {
  environment_config = {
    dev = {
      api_sku               = "B1"
      db_sku                = "B_Standard_B1ms"
      storage_replication   = "LRS"
      backup_retention_days = 7
      enable_monitoring     = false
    }
    staging = {
      api_sku               = "B2"
      db_sku                = "B_Standard_B2ms"
      storage_replication   = "GRS"
      backup_retention_days = 14
      enable_monitoring     = true
    }
    prod = {
      api_sku               = "P1v2"
      db_sku                = "B_Standard_B4ms"
      storage_replication   = "GRS"
      backup_retention_days = 30
      enable_monitoring     = true
    }
  }
}
