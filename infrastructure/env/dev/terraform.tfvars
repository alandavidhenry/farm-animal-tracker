project         = "farm-animal-tracker"
environment     = "dev"
location        = "UK South"
github_username = "alandavidhenry"

app_service_sku = "F1"
https_only      = false

sql_allowed_ip_ranges = {
  "alan_pc" = {
    start_ip = "193.237.217.75"
    end_ip   = "193.237.217.75"
  }
}

key_vault = {
  sku_name = "standard"
}

storage = {
  account_tier             = "Standard"
  account_replication_type = "LRS"
  min_tls_version          = "TLS1_2"
}

storage_container = {
  name                  = "animal-files"
  container_access_type = "private"
}
