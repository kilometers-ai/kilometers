variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
}

variable "location" {
  description = "Azure region where resources will be created"
  type        = string
}

variable "vnet_name" {
  description = "Name of the virtual network"
  type        = string
}

variable "vnet_address_space" {
  description = "Address space for the virtual network"
  type        = list(string)
  default     = ["10.0.0.0/16"]
}

variable "subnets" {
  description = "Map of subnet configurations"
  type = map(object({
    name              = string
    address_prefixes  = list(string)
    service_endpoints = list(string)
  }))
  default = {
    app = {
      name              = "app-subnet"
      address_prefixes  = ["10.0.1.0/24"]
      service_endpoints = ["Microsoft.KeyVault", "Microsoft.Sql"]
    }
    db = {
      name              = "db-subnet"
      address_prefixes  = ["10.0.2.0/24"]
      service_endpoints = ["Microsoft.KeyVault", "Microsoft.Sql"]
    }
    private_endpoints = {
      name              = "private-endpoints-subnet"
      address_prefixes  = ["10.0.3.0/24"]
      service_endpoints = []
    }
    container_apps = {
      name              = "container-apps-infra-subnet"
      address_prefixes  = ["10.0.4.0/23"]
      service_endpoints = ["Microsoft.KeyVault"]
    }
  }
}

variable "tags" {
  description = "Tags to be applied to all resources"
  type        = map(string)
  default     = {}
}
