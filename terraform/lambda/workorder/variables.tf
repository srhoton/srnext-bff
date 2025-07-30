variable "project" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "common_tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default     = {}
}

variable "appsync_api_id" {
  description = "AppSync API ID"
  type        = string
}

variable "workorders_api_url" {
  description = "URL for the workorders backend API"
  type        = string
  default     = "https://workorder-srnext.sb.fullbay.com"
}

variable "log_level" {
  description = "Log level for the Lambda function"
  type        = string
  default     = "INFO"
}