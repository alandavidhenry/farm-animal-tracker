resource "azurecaf_name" "sql_server" {
  name          = var.project
  resource_type = "azurerm_mssql_server"
  suffixes      = [var.environment]
}

resource "azurecaf_name" "sql_database" {
  name          = var.project
  resource_type = "azurerm_mssql_database"
  suffixes      = [var.environment]
}

# Generate random password for SQL Server admin (no special characters to avoid connection string issues)
resource "random_password" "sql_admin_password" {
  length      = 20
  special     = false
  min_upper   = 3
  min_lower   = 3
  min_numeric = 3
  # Only create this on first run
  keepers = {
    first_run = "true"
  }
}

resource "azurerm_mssql_server" "main" {
  name                         = azurecaf_name.sql_server.result
  resource_group_name          = var.resource_group_name
  location                     = var.location
  version                      = "12.0"
  administrator_login          = var.administrator_login
  administrator_login_password = random_password.sql_admin_password.result
  minimum_tls_version          = "1.2"

  tags = var.tags
}

resource "azurerm_mssql_database" "main" {
  name                 = azurecaf_name.sql_database.result
  server_id            = azurerm_mssql_server.main.id
  collation            = "SQL_Latin1_General_CP1_CI_AS"
  license_type         = "LicenseIncluded"
  max_size_gb          = 2
  sku_name             = "Basic"
  zone_redundant       = false
  storage_account_type = "Local"

  tags = var.tags
}

# Allow Azure services to access the server
resource "azurerm_mssql_firewall_rule" "azure_services" {
  name             = "AllowAzureServices"
  server_id        = azurerm_mssql_server.main.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

# Optional: Allow specific IP ranges (for development)
resource "azurerm_mssql_firewall_rule" "allowed_ips" {
  for_each = var.allowed_ip_ranges

  name             = each.key
  server_id        = azurerm_mssql_server.main.id
  start_ip_address = each.value.start_ip
  end_ip_address   = each.value.end_ip
}

# Execute database schema initialization script
resource "null_resource" "database_schema" {
  depends_on = [
    azurerm_mssql_database.main,
    azurerm_mssql_firewall_rule.azure_services
  ]

  triggers = {
    database_id = azurerm_mssql_database.main.id
    script_hash = filemd5("${path.module}/../../sql/init_schema.sql")
  }

  provisioner "local-exec" {
    command = "sqlcmd -S ${azurerm_mssql_server.main.fully_qualified_domain_name} -d ${azurerm_mssql_database.main.name} -U ${var.administrator_login} -P ${random_password.sql_admin_password.result} -i ${path.module}/../../sql/init_schema.sql"
  }
}
