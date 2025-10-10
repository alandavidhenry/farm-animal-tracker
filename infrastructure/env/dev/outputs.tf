output "resource_group_name" {
  description = "The name of the resource group"
  value       = module.farm_animal_tracker.resource_group_name
}

output "app_service_name" {
  description = "The name of the App Service"
  value       = module.farm_animal_tracker.app_service_name
}

output "app_service_url" {
  description = "The URL of the App Service"
  value       = module.farm_animal_tracker.app_service_url
}

output "storage_connection_string" {
  description = "Storage account connection string"
  value       = module.farm_animal_tracker.storage_connection_string
  sensitive   = true
}

output "storage_container_name" {
  description = "Storage container name"
  value       = module.farm_animal_tracker.storage_container_name
}

output "nextauth_secret" {
  description = "NextAuth secret"
  value       = module.farm_animal_tracker.nextauth_secret
  sensitive   = true
}

output "key_vault_name" {
  description = "The name of the Key Vault"
  value       = module.farm_animal_tracker.key_vault_name
}

output "admin_password" {
  description = "NextAuth admin password"
  value       = module.farm_animal_tracker.admin_password
  sensitive   = true
}

output "sql_admin_login" {
  description = "SQL Server administrator login"
  value       = module.farm_animal_tracker.sql_admin_login
}

output "sql_admin_password" {
  description = "SQL Server administrator password"
  value       = module.farm_animal_tracker.sql_admin_password
  sensitive   = true
}

output "database_connection_string" {
  description = "Database connection string"
  value       = module.farm_animal_tracker.database_connection_string
  sensitive   = true
}
