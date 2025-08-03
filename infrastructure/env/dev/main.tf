terraform {
  backend "azurerm" {}
}

module "farm_animal_tracker" {
  source = "../../modules/farm_animal_tracker"

  project               = var.project
  environment           = var.environment
  location              = var.location
  app_service_sku       = var.app_service_sku
  https_only            = var.https_only
  sql_allowed_ip_ranges = var.sql_allowed_ip_ranges
  key_vault             = var.key_vault
  storage               = var.storage
  storage_container     = var.storage_container
  github_username       = var.github_username
  github_token          = var.github_token

  allowed_origins = [
    "http://localhost:3000",
    "https://app-${var.project}-${var.environment}.azurewebsites.net"
  ]
}
