variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "resource_group_id" {
  description = "ID of the resource group to monitor"
  type        = string
}

variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
}

variable "location" {
  description = "Azure region"
  type        = string
}

variable "monthly_budget" {
  description = "Monthly budget amount in USD"
  type        = number
  default     = 50
}

variable "alert_emails" {
  description = "List of email addresses for alerts"
  type        = list(string)
}

variable "webhook_url" {
  description = "Optional webhook URL for notifications (Slack, Teams, etc)"
  type        = string
  default     = ""
}

variable "enable_auto_shutdown" {
  description = "Enable automatic shutdown of VMs"
  type        = bool
  default     = true
}

variable "timezone" {
  description = "Timezone for auto-shutdown"
  type        = string
  default     = "Eastern Standard Time"
}

variable "vm_resource_ids" {
  description = "Map of VM resource IDs to apply auto-shutdown"
  type        = map(string)
  default     = {}
}

variable "resources_to_monitor" {
  description = "Map of resource IDs to apply diagnostic settings"
  type        = map(string)
  default     = {}
}

variable "log_analytics_workspace_id" {
  description = "Log Analytics workspace ID for production logs"
  type        = string
  default     = ""
}

variable "storage_account_id" {
  description = "Storage account ID for diagnostic logs"
  type        = string
  default     = ""
}

variable "tags" {
  description = "Resource tags"
  type        = map(string)
  default     = {}
}
