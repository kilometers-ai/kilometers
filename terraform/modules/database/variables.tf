variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
}

variable "location" {
  description = "Azure region where the PostgreSQL server will be created"
  type        = string
}

variable "server_name" {
  description = "Name of the PostgreSQL flexible server"
  type        = string
}

variable "admin_username" {
  description = "Administrator username for PostgreSQL server"
  type        = string
  default     = "pgadmin"
}

variable "admin_password" {
  description = "Administrator password for PostgreSQL server"
  type        = string
  sensitive   = true
}

variable "database_name" {
  description = "Name of the application database"
  type        = string
  default     = "api_db"
}

variable "db_subnet_id" {
  description = "ID of the subnet where PostgreSQL will be deployed"
  type        = string
}

variable "virtual_network_id" {
  description = "ID of the virtual network for DNS zone linking"
  type        = string
}

variable "app_subnet_start_ip" {
  description = "Start IP address of the app subnet for firewall rule"
  type        = string
  default     = "10.0.1.1"
}

variable "app_subnet_end_ip" {
  description = "End IP address of the app subnet for firewall rule"
  type        = string
  default     = "10.0.1.254"
}

variable "container_apps_subnet_start_ip" {
  description = "Start IP address of the Container Apps infrastructure subnet for firewall rule"
  type        = string
  default     = "10.0.4.1"
}

variable "container_apps_subnet_end_ip" {
  description = "End IP address of the Container Apps infrastructure subnet for firewall rule"
  type        = string
  default     = "10.0.5.254"
}

variable "sku_name" {
  description = "The SKU name for the PostgreSQL server"
  type        = string
  default     = "B_Standard_B1ms"  # Basic tier, suitable for development
}

variable "storage_mb" {
  description = "Storage size in MB for PostgreSQL server"
  type        = number
  default     = 32768  # 32 GB
}

variable "postgres_version" {
  description = "PostgreSQL version"
  type        = string
  default     = "14"
}

variable "backup_retention_days" {
  description = "Number of days to retain backups"
  type        = number
  default     = 7
}

variable "geo_redundant_backup_enabled" {
  description = "Enable geo-redundant backups"
  type        = bool
  default     = false  # Disabled for dev environment
}

variable "tags" {
  description = "Tags to be applied to all resources"
  type        = map(string)
  default     = {}
}
