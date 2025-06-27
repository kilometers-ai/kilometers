variable "acr_name" {
  description = "The name of the Azure Container Registry"
  type        = string
}

variable "resource_group_name" {
  description = "The name of the resource group"
  type        = string
}

variable "location" {
  description = "The location/region where the ACR will be created"
  type        = string
}

variable "sku" {
  description = "The SKU of the ACR (Basic, Standard, or Premium)"
  type        = string
  default     = "Basic"
}

variable "admin_enabled" {
  description = "Enable admin user for the ACR"
  type        = bool
  default     = true
}

variable "zone_redundancy_enabled" {
  description = "Enable zone redundancy for the ACR"
  type        = bool
  default     = false
}

variable "public_network_access_enabled" {
  description = "Enable public network access for the ACR"
  type        = bool
  default     = false
}

variable "allowed_ip_range" {
  description = "The IP range to allow access to the ACR"
  type        = string
  default     = "0.0.0.0/0" # Note: In production, this should be restricted
}

variable "retention_days" {
  description = "Number of days to retain untagged manifests"
  type        = number
  default     = 30
}

variable "tags" {
  description = "Tags to apply to the ACR"
  type        = map(string)
  default     = {}
} 
