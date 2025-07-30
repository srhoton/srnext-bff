locals {
  function_name = "${var.project}-${var.environment}-workorder-resolver"
  zip_file      = "${path.module}/../../../lambda/workorder/lambda.zip"
}

resource "aws_lambda_function" "workorder_resolver" {
  filename         = local.zip_file
  function_name    = local.function_name
  role            = aws_iam_role.workorder_lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"
  timeout         = 30
  memory_size     = 256
  source_code_hash = filebase64sha256(local.zip_file)

  environment {
    variables = {
      WORKORDERS_API_URL = var.workorders_api_url
      LOG_LEVEL         = var.log_level
    }
  }

  tags = merge(var.common_tags, {
    Name = local.function_name
  })
}

resource "aws_iam_role" "workorder_lambda_role" {
  name = "${var.project}-${var.environment}-workorder-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = merge(var.common_tags, {
    Name = "${var.project}-${var.environment}-workorder-lambda-role"
  })
}

resource "aws_iam_role_policy_attachment" "workorder_lambda_basic" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  role       = aws_iam_role.workorder_lambda_role.name
}

resource "aws_iam_role_policy" "workorder_lambda_logging" {
  name = "${var.project}-${var.environment}-workorder-lambda-logging"
  role = aws_iam_role.workorder_lambda_role.id

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
        Resource = "arn:aws:logs:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:log-group:/aws/lambda/${local.function_name}:*"
      }
    ]
  })
}

resource "aws_cloudwatch_log_group" "workorder_lambda_logs" {
  name              = "/aws/lambda/${local.function_name}"
  retention_in_days = 14

  tags = merge(var.common_tags, {
    Name = "${local.function_name}-logs"
  })
}

data "aws_region" "current" {}
data "aws_caller_identity" "current" {}

# AppSync Data Source
resource "aws_appsync_datasource" "workorder_lambda" {
  api_id           = var.appsync_api_id
  name             = "WorkOrderLambdaDataSource"
  type             = "AWS_LAMBDA"
  service_role_arn = aws_iam_role.appsync_lambda_role.arn

  lambda_config {
    function_arn = aws_lambda_function.workorder_resolver.arn
  }

  depends_on = [aws_lambda_function.workorder_resolver]
}

resource "aws_iam_role" "appsync_lambda_role" {
  name = "${var.project}-${var.environment}-appsync-workorder-role"

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

  tags = merge(var.common_tags, {
    Name = "${var.project}-${var.environment}-appsync-workorder-role"
  })
}

resource "aws_iam_role_policy" "appsync_lambda_policy" {
  name = "${var.project}-${var.environment}-appsync-workorder-policy"
  role = aws_iam_role.appsync_lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "lambda:InvokeFunction"
        ]
        Resource = aws_lambda_function.workorder_resolver.arn
      }
    ]
  })
}

# AppSync Resolvers for WorkOrder operations
resource "aws_appsync_resolver" "get_workorder" {
  api_id      = var.appsync_api_id
  type        = "Query"
  field       = "getWorkOrder"
  data_source = aws_appsync_datasource.workorder_lambda.name
  kind        = "UNIT"

  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }

  code = <<EOF
import { util } from '@aws-appsync/utils';

export function request(ctx) {
  return {
    operation: 'Invoke',
    payload: ctx
  };
}

export function response(ctx) {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }
  return ctx.result;
}
EOF
}

resource "aws_appsync_resolver" "list_workorders" {
  api_id      = var.appsync_api_id
  type        = "Query"
  field       = "listWorkOrders"
  data_source = aws_appsync_datasource.workorder_lambda.name
  kind        = "UNIT"

  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }

  code = <<EOF
import { util } from '@aws-appsync/utils';

export function request(ctx) {
  return {
    operation: 'Invoke',
    payload: ctx
  };
}

export function response(ctx) {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }
  return ctx.result;
}
EOF
}

resource "aws_appsync_resolver" "create_workorder" {
  api_id      = var.appsync_api_id
  type        = "Mutation"
  field       = "createWorkOrder"
  data_source = aws_appsync_datasource.workorder_lambda.name
  kind        = "UNIT"

  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }

  code = <<EOF
import { util } from '@aws-appsync/utils';

export function request(ctx) {
  return {
    operation: 'Invoke',
    payload: ctx
  };
}

export function response(ctx) {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }
  return ctx.result;
}
EOF
}

resource "aws_appsync_resolver" "update_workorder" {
  api_id      = var.appsync_api_id
  type        = "Mutation"
  field       = "updateWorkOrder"
  data_source = aws_appsync_datasource.workorder_lambda.name
  kind        = "UNIT"

  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }

  code = <<EOF
import { util } from '@aws-appsync/utils';

export function request(ctx) {
  return {
    operation: 'Invoke',
    payload: ctx
  };
}

export function response(ctx) {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }
  return ctx.result;
}
EOF
}

resource "aws_appsync_resolver" "delete_workorder" {
  api_id      = var.appsync_api_id
  type        = "Mutation"
  field       = "deleteWorkOrder"
  data_source = aws_appsync_datasource.workorder_lambda.name
  kind        = "UNIT"

  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }

  code = <<EOF
import { util } from '@aws-appsync/utils';

export function request(ctx) {
  return {
    operation: 'Invoke',
    payload: ctx
  };
}

export function response(ctx) {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }
  return ctx.result;
}
EOF
}