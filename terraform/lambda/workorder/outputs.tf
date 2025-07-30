output "lambda_function_arn" {
  description = "ARN of the workorder resolver Lambda function"
  value       = aws_lambda_function.workorder_resolver.arn
}

output "lambda_function_name" {
  description = "Name of the workorder resolver Lambda function"
  value       = aws_lambda_function.workorder_resolver.function_name
}

output "lambda_role_arn" {
  description = "ARN of the Lambda execution role"
  value       = aws_iam_role.workorder_lambda_role.arn
}

output "appsync_datasource_name" {
  description = "Name of the AppSync data source"
  value       = aws_appsync_datasource.workorder_lambda.name
}