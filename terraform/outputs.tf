output "appsync_graphql_url" {
  description = "The URI of the GraphQL API"
  value       = aws_appsync_graphql_api.main.uris["GRAPHQL"]
}

output "appsync_custom_domain_url" {
  description = "The custom domain URL for the GraphQL API"
  value       = "https://${var.domain_name}/graphql"
}

output "appsync_api_id" {
  description = "The ID of the AppSync GraphQL API"
  value       = aws_appsync_graphql_api.main.id
}

output "cognito_user_pool_id" {
  description = "The Cognito User Pool ID used for authentication"
  value       = var.cognito_user_pool_id
}