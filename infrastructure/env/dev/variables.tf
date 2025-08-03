variable "subscription_id" {
  description = "Azure subscription ID"
  type        = string
}

variable "project" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "location" {
  description = "Azure region"
  type        = string
}

variable "resource_group_name" {
  description = "Resource group name"
  type        = string
  default     = null
}

variable "app_service_sku" {
  description = "App Service plan SKU"
  type        = string
}

variable "https_only" {
  description = "Force HTTPS for all traffic"
  type        = bool
  default     = true
}


variable "sql_allowed_ip_ranges" {
  description = "Map of allowed IP ranges for SQL firewall"
  type = map(object({
    start_ip = string
    end_ip   = string
  }))
}

variable "key_vault" {
  description = "Key Vault configuration"
  type = object({
    sku_name = string
  })
}

variable "storage" {
  description = "Storage account configuration"
  type = object({
    account_tier             = string
    account_replication_type = string
    min_tls_version          = string
  })
}

variable "storage_container" {
  description = "Storage container configuration"
  type = object({
    name                  = string
    container_access_type = string
  })
}


variable "github_username" {
  description = "GitHub username for container registry"
  type        = string
  sensitive   = false
}

variable "github_token" {
  description = "GitHub personal access token with package read permissions"
  type        = string
  sensitive   = true
}

