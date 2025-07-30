variable "project" {
  description = "Project name"
  type        = string
  default     = "srnext-bff"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "cognito_user_pool_id" {
  description = "Existing Cognito User Pool ID"
  type        = string
  default     = "us-west-2_Sg0RnpexL"
}

variable "domain_name" {
  description = "Custom domain name for AppSync API"
  type        = string
  default     = "srnext-bff.sb.fullbay.com"
}

variable "base_domain" {
  description = "Base domain for Route53 hosted zone"
  type        = string
  default     = "sb.fullbay.com"
}