# Cost Optimization Module
# This module creates cost monitoring and optimization resources

terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }
}

# Budget for the resource group
resource "azurerm_consumption_budget_resource_group" "main" {
  name              = "budget-${var.project_name}-${var.environment}"
  resource_group_id = var.resource_group_id

  amount     = var.monthly_budget
  time_grain = "Monthly"

  time_period {
    start_date = formatdate("YYYY-MM-01'T'00:00:00'Z'", timestamp())
  }

  # 80% warning
  notification {
    enabled   = true
    threshold = 80
    operator  = "GreaterThan"

    contact_emails = var.alert_emails
  }

  # 100% alert
  notification {
    enabled   = true
    threshold = 100
    operator  = "GreaterThan"

    contact_emails = var.alert_emails
  }

  # 120% critical alert
  notification {
    enabled   = true
    threshold = 120
    operator  = "GreaterThan"

    contact_emails = var.alert_emails
  }
}

# Action Group for Alerts
resource "azurerm_monitor_action_group" "cost_alerts" {
  name                = "ag-${var.project_name}-cost"
  resource_group_name = var.resource_group_name
  short_name          = "cost"

  dynamic "email_receiver" {
    for_each = toset(var.alert_emails)
    content {
      name          = "email-${index(var.alert_emails, email_receiver.value)}"
      email_address = email_receiver.value
    }
  }

  # Optional: Add webhook for Slack/Teams notifications
  dynamic "webhook_receiver" {
    for_each = var.webhook_url != "" ? [1] : []
    content {
      name        = "webhook"
      service_uri = var.webhook_url
    }
  }
}

# Cost Anomaly Detection
resource "azurerm_monitor_scheduled_query_rules_alert_v2" "cost_anomaly" {
  name                = "cost-anomaly-${var.project_name}"
  resource_group_name = var.resource_group_name
  location            = var.location

  evaluation_frequency = "PT1H" # Check every hour
  window_duration      = "PT1H"
  scopes               = [var.resource_group_id]
  severity             = 2

  criteria {
    query                   = <<-QUERY
      AzureActivity
      | where TimeGenerated > ago(1h)
      | where ActivityStatus == "Succeeded"
      | where ResourceProvider == "Microsoft.Compute" or ResourceProvider == "Microsoft.Web"
      | summarize Count = count() by ResourceProvider, bin(TimeGenerated, 1h)
      | where Count > 50  // Unusual activity threshold
    QUERY
    time_aggregation_method = "Count"
    threshold               = 1
    operator                = "GreaterThan"
  }

  action {
    action_groups = [azurerm_monitor_action_group.cost_alerts.id]
  }

  display_name = "Unusual Resource Activity"
  description  = "Alert when there's unusual resource creation activity that might incur costs"
  enabled      = true
}

# Auto-shutdown schedule for VMs (if any)
resource "azurerm_dev_test_global_vm_shutdown_schedule" "main" {
  for_each = var.vm_resource_ids

  virtual_machine_id = each.value
  location           = var.location
  enabled            = var.enable_auto_shutdown

  daily_recurrence_time = "1900" # 7 PM
  timezone              = var.timezone

  notification_settings {
    enabled         = true
    time_in_minutes = 30
    email           = join(";", var.alert_emails)
  }

  tags = var.tags
}

# Diagnostic settings to reduce log costs
resource "azurerm_monitor_diagnostic_setting" "cost_optimized" {
  for_each = var.resources_to_monitor

  name               = "diag-cost-optimized"
  target_resource_id = each.value

  # Only send to Log Analytics if it's critical
  dynamic "log_analytics_workspace_id" {
    for_each = var.environment == "prod" ? [var.log_analytics_workspace_id] : []
    content {
      workspace_id = log_analytics_workspace_id.value
    }
  }

  # For non-prod, only store in cheaper storage
  storage_account_id = var.environment != "prod" ? var.storage_account_id : null

  # Only log errors and critical events
  dynamic "enabled_log" {
    for_each = var.environment == "prod" ? ["Error", "Critical"] : ["Critical"]
    content {
      category = enabled_log.value
    }
  }

  # Minimal metrics
  dynamic "metric" {
    for_each = ["AllMetrics"]
    content {
      category = metric.value
      enabled  = var.environment == "prod"
    }
  }
}

# Outputs
output "budget_id" {
  value = azurerm_consumption_budget_resource_group.main.id
}

output "action_group_id" {
  value = azurerm_monitor_action_group.cost_alerts.id
}

output "cost_anomaly_alert_id" {
  value = azurerm_monitor_scheduled_query_rules_alert_v2.cost_anomaly.id
}
