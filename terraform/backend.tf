# Backend configuration for Terraform state
# This stores the state in Azure Storage for team collaboration and security
# NOTE: Backend storage account has been deleted - uncomment and recreate if needed

# terraform {
#   backend "azurerm" {
#     resource_group_name  = "rg-terraform-state"
#     storage_account_name = "tfkmbb1380"
#     container_name       = "tfstate"
#     key                  = "kilometers.tfstate"
#   }
# }
