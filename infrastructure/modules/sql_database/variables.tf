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
}

variable "administrator_login" {
  description = "SQL Server administrator login"
  type        = string
  default     = "sqladmin"
}

variable "allowed_ip_ranges" {
  description = "Map of allowed IP ranges for SQL firewall"
  type = map(object({
    start_ip = string
    end_ip   = string
  }))
  default = {}
}

variable "sku_name" {
  description = "SQL Database SKU name"
  type        = string
  default     = "GP_S_Gen5_2"
}

variable "max_size_gb" {
  description = "Maximum size of the database in gigabytes"
  type        = number
  default     = 32
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}