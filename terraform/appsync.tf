resource "aws_appsync_graphql_api" "main" {
  name                = "${var.environment}-srnext-bff"
  authentication_type = "AMAZON_COGNITO_USER_POOLS"

  user_pool_config {
    user_pool_id   = var.cognito_user_pool_id
    default_action = "ALLOW"
    aws_region     = "us-west-2"
  }

  schema = file("${path.module}/schema.graphql")

  xray_enabled = true

  log_config {
    cloudwatch_logs_role_arn = aws_iam_role.appsync_cloudwatch.arn
    field_log_level          = "ERROR"
    exclude_verbose_content  = false
  }

  tags = {
    Name = "${var.environment}-srnext-bff-api"
  }
}

resource "aws_cloudwatch_log_group" "appsync" {
  name              = "/aws/appsync/apis/${aws_appsync_graphql_api.main.id}"
  retention_in_days = 7

  tags = {
    Name = "${var.environment}-srnext-bff-logs"
  }
}

resource "aws_iam_role" "appsync_cloudwatch" {
  name = "${var.environment}-srnext-bff-appsync-cloudwatch-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "appsync.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "appsync_cloudwatch" {
  name = "${var.environment}-srnext-bff-appsync-cloudwatch-policy"
  role = aws_iam_role.appsync_cloudwatch.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      }
    ]
  })
}

resource "aws_appsync_datasource" "none" {
  api_id = aws_appsync_graphql_api.main.id
  name   = "none_datasource"
  type   = "NONE"
}

resource "aws_appsync_resolver" "hello" {
  api_id            = aws_appsync_graphql_api.main.id
  type              = "Query"
  field             = "hello"
  data_source       = aws_appsync_datasource.none.name
  request_template  = <<EOF
{
  "version": "2017-02-28",
  "payload": {}
}
EOF
  response_template = <<EOF
#set($result = {
  "message": "Hello from authenticated AppSync!"
})
$util.toJson($result)
EOF
}