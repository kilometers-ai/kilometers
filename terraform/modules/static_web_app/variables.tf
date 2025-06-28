variable "static_web_app_name" {
  description = "Name of the Azure Static Web App"
  type        = string
}

variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
}

variable "location" {
  description = "Azure region where the Static Web App will be created"
  type        = string
}

variable "sku_tier" {
  description = "SKU tier for the Static Web App (Free or Standard)"
  type        = string
  default     = "Free"

  validation {
    condition     = contains(["Free", "Standard"], var.sku_tier)
    error_message = "SKU tier must be either 'Free' or 'Standard'"
  }
}

variable "sku_size" {
  description = "SKU size for the Static Web App (Free or Standard)"
  type        = string
  default     = "Free"

  validation {
    condition     = contains(["Free", "Standard"], var.sku_size)
    error_message = "SKU size must be either 'Free' or 'Standard'"
  }
}

variable "app_settings" {
  description = "Application settings for the Static Web App"
  type        = map(string)
  default     = {}
}

variable "custom_domains" {
  description = "List of custom domains for the Static Web App (optional)"
  type        = list(string)
  default     = []
}

# Keep backward compatibility
variable "custom_domain" {
  description = "Single custom domain for the Static Web App (optional, use custom_domains instead)"
  type        = string
  default     = ""
}

variable "tags" {
  description = "Tags to be applied to the Static Web App"
  type        = map(string)
  default     = {}
}
