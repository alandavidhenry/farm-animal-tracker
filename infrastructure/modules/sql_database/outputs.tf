output "sql_server_name" {
  description = "Name of the SQL Server"
  value       = azurerm_mssql_server.main.name
}

output "sql_server_fqdn" {
  description = "Fully qualified domain name of the SQL Server"
  value       = azurerm_mssql_server.main.fully_qualified_domain_name
}

output "sql_database_name" {
  description = "Name of the SQL Database"
  value       = azurerm_mssql_database.main.name
}

output "administrator_login" {
  description = "Administrator login for the SQL Server"
  value       = azurerm_mssql_server.main.administrator_login
}

output "administrator_password" {
  description = "Administrator password for the SQL Server"
  value       = random_password.sql_admin_password.result
  sensitive   = true
}

output "connection_string" {
  description = "Prisma-compatible connection string for the SQL Database"
  value       = "sqlserver://${azurerm_mssql_server.main.fully_qualified_domain_name}:1433;database=${azurerm_mssql_database.main.name};user=${azurerm_mssql_server.main.administrator_login};password=${random_password.sql_admin_password.result};encrypt=true;trustServerCertificate=false;connectionTimeout=30;"
  sensitive   = true
}
