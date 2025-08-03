# Generate random password for NextAuth secret
resource "random_password" "nextauth_secret" {
  length      = 32
  special     = true
  min_special = 1
  min_upper   = 1
  min_lower   = 1
  min_numeric = 1
  # Only create this on first run
  keepers = {
    first_run = "true"
  }
}

# Generate random password for NextAuth admin
resource "random_password" "admin_password" {
  length      = 20
  special     = true
  min_special = 1
  min_upper   = 1
  min_lower   = 1
  min_numeric = 1
  # Only create this on first run
  keepers = {
    first_run = "true"
  }
}

module "resource_group" {
  source = "../resource_group"

  project             = var.project
  environment         = var.environment
  location            = var.location
  resource_group_name = var.resource_group_name
  tags                = local.common_tags
}

module "key_vault" {
  source = "../key_vault"

  project             = local.kv_name
  environment         = var.environment
  location            = var.location
  resource_group_name = module.resource_group.resource_group_name
  sku_name            = var.key_vault.sku_name
  tags                = local.common_tags

  # We'll add secrets and access policies later
  secrets         = {}
  access_policies = []
}

module "storage" {
  source = "../storage"

  project                  = local.st_name
  environment              = var.environment
  suffix                   = "docs"
  location                 = var.location
  resource_group_name      = module.resource_group.resource_group_name
  account_tier             = var.storage.account_tier
  account_replication_type = var.storage.account_replication_type
  min_tls_version          = var.storage.min_tls_version
  allowed_origins          = var.allowed_origins
  tags                     = local.common_tags

  containers = {
    "${var.storage_container.name}" = {
      access_type = var.storage_container.container_access_type
    }
  }
}

module "sql_database" {
  source = "../sql_database"

  project             = var.project
  environment         = var.environment
  location            = var.location
  resource_group_name = module.resource_group.resource_group_name
  administrator_login = "sqladmin"
  allowed_ip_ranges   = var.sql_allowed_ip_ranges
  tags                = local.common_tags
}

resource "azurerm_key_vault_secret" "nextauth_secret" {
  name         = "nextauth-secret"
  value        = random_password.nextauth_secret.result
  key_vault_id = module.key_vault.key_vault_id

  depends_on = [module.key_vault]
}

resource "azurerm_key_vault_secret" "storage_connection_string" {
  name         = "storage-connection-string"
  value        = module.storage.primary_connection_string
  key_vault_id = module.key_vault.key_vault_id

  depends_on = [module.key_vault, module.storage]
}

resource "azurerm_key_vault_secret" "database_connection_string" {
  name         = "database-connection-string"
  value        = module.sql_database.connection_string
  key_vault_id = module.key_vault.key_vault_id

  depends_on = [module.key_vault, module.sql_database]
}

resource "azurerm_key_vault_secret" "admin_email" {
  name         = "admin-email"
  value        = "alandavidhenry@gmail.com"
  key_vault_id = module.key_vault.key_vault_id

  depends_on = [module.key_vault]
}

resource "azurerm_key_vault_secret" "admin_password" {
  name         = "admin-password"
  value        = random_password.admin_password.result
  key_vault_id = module.key_vault.key_vault_id

  depends_on = [module.key_vault]
}

module "app_service" {
  source = "../app_service"

  project             = var.project
  environment         = var.environment
  location            = var.location
  resource_group_name = module.resource_group.resource_group_name
  sku_name            = var.app_service_sku
  https_only          = var.https_only
  tags                = local.common_tags

  docker_image = {
    name              = "ghcr.io/${var.github_username}/${var.project}:${var.environment == "prod" ? "latest" : "dev-latest"}"
    registry_url      = "https://ghcr.io"
    registry_username = var.github_username
    registry_password = var.github_token
  }

  app_settings = {
    "WEBSITES_PORT"                       = "8080"
    "AZURE_STORAGE_CONNECTION_STRING"     = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.storage_connection_string.versionless_id})"
    "AZURE_STORAGE_CONTAINER_NAME"        = var.storage_container.name
    "DATABASE_URL"                        = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.database_connection_string.versionless_id})"
    "NEXTAUTH_URL"                        = "https://app-${var.project}-${var.environment}.azurewebsites.net"
    "NEXTAUTH_SECRET"                     = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.nextauth_secret.versionless_id})"
    "ADMIN_EMAIL"                         = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.admin_email.versionless_id})"
    "ADMIN_PASSWORD"                      = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.admin_password.versionless_id})"
    "WEBSITE_NODE_DEFAULT_VERSION"        = "~22"
    "SCM_DO_BUILD_DURING_DEPLOYMENT"      = "true"
    "WEBSITES_ENABLE_APP_SERVICE_STORAGE" = "true"
    "WEBSITES_CONTAINER_START_TIME_LIMIT" = "600"
  }

  depends_on = [
    azurerm_key_vault_secret.nextauth_secret,
    azurerm_key_vault_secret.storage_connection_string,
    azurerm_key_vault_secret.database_connection_string,
    azurerm_key_vault_secret.admin_email,
    azurerm_key_vault_secret.admin_password
  ]
}

resource "azurerm_key_vault_access_policy" "app_service" {
  key_vault_id = module.key_vault.key_vault_id
  tenant_id    = data.azurerm_client_config.current.tenant_id
  object_id    = module.app_service.app_service_identity_principal_id

  secret_permissions = [
    "Get", "List"
  ]

  depends_on = [module.app_service, module.key_vault]
}

# Data source for current client config
data "azurerm_client_config" "current" {}
