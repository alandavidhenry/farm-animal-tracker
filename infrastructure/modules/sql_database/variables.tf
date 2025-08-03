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

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}