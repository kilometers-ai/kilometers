terraform {
  backend "azurerm" {
    #TODO: should we use a different resource group?
    #TODO: does this need to be environment specific?
    resource_group_name  = "rg-kilometers-terraform"
    storage_account_name = "stkilometerstfstate"
    container_name       = "tfstate"
    key                  = "kilometers.tfstate"
  }
}
