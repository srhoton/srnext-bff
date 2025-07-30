# Unit Lambda Function
resource "aws_lambda_function" "unit" {
  filename      = "../lambda/unit/lambda.zip"
  function_name = "${var.project}-${var.environment}-unit"
  role          = aws_iam_role.unit_lambda.arn
  handler       = "index.handler"
  runtime       = "nodejs18.x"
  timeout       = 30
  memory_size   = 256

  environment {
    variables = {
      UNITS_API_URL = "https://unit-srnext.sb.fullbay.com"
      LOG_LEVEL     = "INFO"
    }
  }

  source_code_hash = filebase64sha256("../lambda/unit/lambda.zip")

  tags = {
    Name        = "${var.project}-${var.environment}-unit-lambda"
    Environment = var.environment
    Project     = var.project
  }
}

# IAM Role for Unit Lambda
resource "aws_iam_role" "unit_lambda" {
  name = "${var.project}-${var.environment}-unit-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = {
    Name        = "${var.project}-${var.environment}-unit-lambda-role"
    Environment = var.environment
    Project     = var.project
  }
}

# IAM Policy for Unit Lambda
resource "aws_iam_role_policy" "unit_lambda" {
  name = "${var.project}-${var.environment}-unit-lambda-policy"
  role = aws_iam_role.unit_lambda.id

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
        Resource = "arn:aws:logs:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:log-group:/aws/lambda/${var.project}-${var.environment}-unit:*"
      }
    ]
  })
}

# CloudWatch Log Group for Unit Lambda
resource "aws_cloudwatch_log_group" "unit_lambda" {
  name              = "/aws/lambda/${var.project}-${var.environment}-unit"
  retention_in_days = 7

  tags = {
    Name        = "${var.project}-${var.environment}-unit-lambda-logs"
    Environment = var.environment
    Project     = var.project
  }
}

# AppSync Data Source for Unit Lambda
resource "aws_appsync_datasource" "unit_lambda" {
  api_id           = aws_appsync_graphql_api.main.id
  name             = "unit_lambda_datasource"
  type             = "AWS_LAMBDA"
  service_role_arn = aws_iam_role.appsync_lambda.arn

  lambda_config {
    function_arn = aws_lambda_function.unit.arn
  }
}

# IAM Role for AppSync to invoke Lambda
resource "aws_iam_role" "appsync_lambda" {
  name = "${var.project}-${var.environment}-appsync-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "appsync.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = {
    Name        = "${var.project}-${var.environment}-appsync-lambda-role"
    Environment = var.environment
    Project     = var.project
  }
}

# IAM Policy for AppSync to invoke Lambda
resource "aws_iam_role_policy" "appsync_lambda" {
  name = "${var.project}-${var.environment}-appsync-lambda-policy"
  role = aws_iam_role.appsync_lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "lambda:InvokeFunction"
        ]
        Resource = [
          aws_lambda_function.unit.arn,
          aws_lambda_function.account.arn,
          aws_lambda_function.contact.arn,
          aws_lambda_function.event.arn,
          aws_lambda_function.laborline.arn,
          aws_lambda_function.location.arn,
          aws_lambda_function.part.arn,
          aws_lambda_function.task.arn,
          aws_lambda_function.workorder.arn
        ]
      }
    ]
  })
}

# AppSync Resolvers for Unit operations
resource "aws_appsync_resolver" "get_unit" {
  api_id            = aws_appsync_graphql_api.main.id
  type              = "Query"
  field             = "getUnit"
  data_source       = aws_appsync_datasource.unit_lambda.name
  request_template  = file("${path.module}/resolvers/lambda-request.vtl")
  response_template = file("${path.module}/resolvers/lambda-response.vtl")
}

resource "aws_appsync_resolver" "list_units" {
  api_id            = aws_appsync_graphql_api.main.id
  type              = "Query"
  field             = "listUnits"
  data_source       = aws_appsync_datasource.unit_lambda.name
  request_template  = file("${path.module}/resolvers/lambda-request.vtl")
  response_template = file("${path.module}/resolvers/lambda-response.vtl")
}

resource "aws_appsync_resolver" "create_unit" {
  api_id            = aws_appsync_graphql_api.main.id
  type              = "Mutation"
  field             = "createUnit"
  data_source       = aws_appsync_datasource.unit_lambda.name
  request_template  = file("${path.module}/resolvers/lambda-request.vtl")
  response_template = file("${path.module}/resolvers/lambda-response.vtl")
}

resource "aws_appsync_resolver" "update_unit" {
  api_id            = aws_appsync_graphql_api.main.id
  type              = "Mutation"
  field             = "updateUnit"
  data_source       = aws_appsync_datasource.unit_lambda.name
  request_template  = file("${path.module}/resolvers/lambda-request.vtl")
  response_template = file("${path.module}/resolvers/lambda-response.vtl")
}

resource "aws_appsync_resolver" "delete_unit" {
  api_id            = aws_appsync_graphql_api.main.id
  type              = "Mutation"
  field             = "deleteUnit"
  data_source       = aws_appsync_datasource.unit_lambda.name
  request_template  = file("${path.module}/resolvers/lambda-request.vtl")
  response_template = file("${path.module}/resolvers/lambda-response.vtl")
}

# Account Lambda Function
resource "aws_lambda_function" "account" {
  filename      = "../lambda/account/lambda.zip"
  function_name = "${var.project}-${var.environment}-account"
  role          = aws_iam_role.account_lambda.arn
  handler       = "index.handler"
  runtime       = "nodejs18.x"
  timeout       = 30
  memory_size   = 256

  environment {
    variables = {
      ACCOUNTS_API_URL = "https://account-srnext.sb.fullbay.com"
      LOG_LEVEL        = "INFO"
    }
  }

  source_code_hash = filebase64sha256("../lambda/account/lambda.zip")

  tags = {
    Name        = "${var.project}-${var.environment}-account-lambda"
    Environment = var.environment
    Project     = var.project
  }
}

# IAM Role for Account Lambda
resource "aws_iam_role" "account_lambda" {
  name = "${var.project}-${var.environment}-account-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = {
    Name        = "${var.project}-${var.environment}-account-lambda-role"
    Environment = var.environment
    Project     = var.project
  }
}

# IAM Policy for Account Lambda
resource "aws_iam_role_policy" "account_lambda" {
  name = "${var.project}-${var.environment}-account-lambda-policy"
  role = aws_iam_role.account_lambda.id

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
        Resource = "arn:aws:logs:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:log-group:/aws/lambda/${var.project}-${var.environment}-account:*"
      }
    ]
  })
}

# CloudWatch Log Group for Account Lambda
resource "aws_cloudwatch_log_group" "account_lambda" {
  name              = "/aws/lambda/${var.project}-${var.environment}-account"
  retention_in_days = 7

  tags = {
    Name        = "${var.project}-${var.environment}-account-lambda-logs"
    Environment = var.environment
    Project     = var.project
  }
}

# AppSync Data Source for Account Lambda
resource "aws_appsync_datasource" "account_lambda" {
  api_id           = aws_appsync_graphql_api.main.id
  name             = "account_lambda_datasource"
  type             = "AWS_LAMBDA"
  service_role_arn = aws_iam_role.appsync_lambda.arn

  lambda_config {
    function_arn = aws_lambda_function.account.arn
  }
}

# AppSync Resolvers for Account operations
resource "aws_appsync_resolver" "get_account" {
  api_id            = aws_appsync_graphql_api.main.id
  type              = "Query"
  field             = "getAccount"
  data_source       = aws_appsync_datasource.account_lambda.name
  request_template  = file("${path.module}/resolvers/lambda-request.vtl")
  response_template = file("${path.module}/resolvers/lambda-response.vtl")
}

resource "aws_appsync_resolver" "list_accounts" {
  api_id            = aws_appsync_graphql_api.main.id
  type              = "Query"
  field             = "listAccounts"
  data_source       = aws_appsync_datasource.account_lambda.name
  request_template  = file("${path.module}/resolvers/lambda-request.vtl")
  response_template = file("${path.module}/resolvers/lambda-response.vtl")
}

resource "aws_appsync_resolver" "create_account" {
  api_id            = aws_appsync_graphql_api.main.id
  type              = "Mutation"
  field             = "createAccount"
  data_source       = aws_appsync_datasource.account_lambda.name
  request_template  = file("${path.module}/resolvers/lambda-request.vtl")
  response_template = file("${path.module}/resolvers/lambda-response.vtl")
}

resource "aws_appsync_resolver" "update_account" {
  api_id            = aws_appsync_graphql_api.main.id
  type              = "Mutation"
  field             = "updateAccount"
  data_source       = aws_appsync_datasource.account_lambda.name
  request_template  = file("${path.module}/resolvers/lambda-request.vtl")
  response_template = file("${path.module}/resolvers/lambda-response.vtl")
}

resource "aws_appsync_resolver" "delete_account" {
  api_id            = aws_appsync_graphql_api.main.id
  type              = "Mutation"
  field             = "deleteAccount"
  data_source       = aws_appsync_datasource.account_lambda.name
  request_template  = file("${path.module}/resolvers/lambda-request.vtl")
  response_template = file("${path.module}/resolvers/lambda-response.vtl")
}

# Contact Lambda Function
resource "aws_lambda_function" "contact" {
  filename      = "../lambda/contact/lambda.zip"
  function_name = "${var.project}-${var.environment}-contact"
  role          = aws_iam_role.contact_lambda.arn
  handler       = "index.handler"
  runtime       = "nodejs18.x"
  timeout       = 30
  memory_size   = 256

  environment {
    variables = {
      CONTACTS_API_URL = "https://contact-srnext.sb.fullbay.com"
    }
  }

  source_code_hash = filebase64sha256("../lambda/contact/lambda.zip")

  tags = {
    Name        = "${var.project}-${var.environment}-contact-lambda"
    Environment = var.environment
    Project     = var.project
  }
}

# IAM Role for Contact Lambda
resource "aws_iam_role" "contact_lambda" {
  name = "${var.project}-${var.environment}-contact-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = {
    Name        = "${var.project}-${var.environment}-contact-lambda-role"
    Environment = var.environment
    Project     = var.project
  }
}

# IAM Policy for Contact Lambda
resource "aws_iam_role_policy" "contact_lambda" {
  name = "${var.project}-${var.environment}-contact-lambda-policy"
  role = aws_iam_role.contact_lambda.id

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
        Resource = "arn:aws:logs:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:log-group:/aws/lambda/${var.project}-${var.environment}-contact*"
      }
    ]
  })
}

# CloudWatch Log Group for Contact Lambda
resource "aws_cloudwatch_log_group" "contact_lambda" {
  name              = "/aws/lambda/${var.project}-${var.environment}-contact"
  retention_in_days = 7

  tags = {
    Name        = "${var.project}-${var.environment}-contact-lambda-logs"
    Environment = var.environment
    Project     = var.project
  }
}

# AppSync Data Source for Contact Lambda
resource "aws_appsync_datasource" "contact_lambda" {
  api_id           = aws_appsync_graphql_api.main.id
  name             = "contact_lambda_datasource"
  type             = "AWS_LAMBDA"
  service_role_arn = aws_iam_role.appsync_lambda.arn

  lambda_config {
    function_arn = aws_lambda_function.contact.arn
  }
}

# AppSync Resolvers for Contact operations
resource "aws_appsync_resolver" "get_contact" {
  api_id            = aws_appsync_graphql_api.main.id
  type              = "Query"
  field             = "getContact"
  data_source       = aws_appsync_datasource.contact_lambda.name
  request_template  = file("${path.module}/resolvers/lambda-request.vtl")
  response_template = file("${path.module}/resolvers/lambda-response.vtl")
}

resource "aws_appsync_resolver" "list_contacts" {
  api_id            = aws_appsync_graphql_api.main.id
  type              = "Query"
  field             = "listContacts"
  data_source       = aws_appsync_datasource.contact_lambda.name
  request_template  = file("${path.module}/resolvers/lambda-request.vtl")
  response_template = file("${path.module}/resolvers/lambda-response.vtl")
}

resource "aws_appsync_resolver" "create_contact" {
  api_id            = aws_appsync_graphql_api.main.id
  type              = "Mutation"
  field             = "createContact"
  data_source       = aws_appsync_datasource.contact_lambda.name
  request_template  = file("${path.module}/resolvers/lambda-request.vtl")
  response_template = file("${path.module}/resolvers/lambda-response.vtl")
}

resource "aws_appsync_resolver" "update_contact" {
  api_id            = aws_appsync_graphql_api.main.id
  type              = "Mutation"
  field             = "updateContact"
  data_source       = aws_appsync_datasource.contact_lambda.name
  request_template  = file("${path.module}/resolvers/lambda-request.vtl")
  response_template = file("${path.module}/resolvers/lambda-response.vtl")
}

resource "aws_appsync_resolver" "delete_contact" {
  api_id            = aws_appsync_graphql_api.main.id
  type              = "Mutation"
  field             = "deleteContact"
  data_source       = aws_appsync_datasource.contact_lambda.name
  request_template  = file("${path.module}/resolvers/lambda-request.vtl")
  response_template = file("${path.module}/resolvers/lambda-response.vtl")
}

# Event Lambda Function
resource "aws_lambda_function" "event" {
  filename      = "../lambda/event/lambda.zip"
  function_name = "${var.project}-${var.environment}-event"
  role          = aws_iam_role.event_lambda.arn
  handler       = "index.handler"
  runtime       = "nodejs18.x"
  timeout       = 30
  memory_size   = 256

  environment {
    variables = {
      EVENTS_API_URL = "https://event-srnext.sb.fullbay.com"
    }
  }

  source_code_hash = filebase64sha256("../lambda/event/lambda.zip")

  tags = {
    Name        = "${var.project}-${var.environment}-event-lambda"
    Environment = var.environment
    Project     = var.project
  }
}

# IAM Role for Event Lambda
resource "aws_iam_role" "event_lambda" {
  name = "${var.project}-${var.environment}-event-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = {
    Name        = "${var.project}-${var.environment}-event-lambda-role"
    Environment = var.environment
    Project     = var.project
  }
}

# IAM Policy for Event Lambda
resource "aws_iam_role_policy" "event_lambda" {
  name = "${var.project}-${var.environment}-event-lambda-policy"
  role = aws_iam_role.event_lambda.id

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
        Resource = "arn:aws:logs:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:log-group:/aws/lambda/${var.project}-${var.environment}-event*"
      }
    ]
  })
}

# CloudWatch Log Group for Event Lambda
resource "aws_cloudwatch_log_group" "event_lambda" {
  name              = "/aws/lambda/${var.project}-${var.environment}-event"
  retention_in_days = 7

  tags = {
    Name        = "${var.project}-${var.environment}-event-lambda-logs"
    Environment = var.environment
    Project     = var.project
  }
}

# AppSync Data Source for Event Lambda
resource "aws_appsync_datasource" "event_lambda" {
  api_id           = aws_appsync_graphql_api.main.id
  name             = "event_lambda_datasource"
  type             = "AWS_LAMBDA"
  service_role_arn = aws_iam_role.appsync_lambda.arn

  lambda_config {
    function_arn = aws_lambda_function.event.arn
  }
}

# AppSync Resolvers for Event operations
resource "aws_appsync_resolver" "get_event" {
  api_id            = aws_appsync_graphql_api.main.id
  type              = "Query"
  field             = "getEvent"
  data_source       = aws_appsync_datasource.event_lambda.name
  request_template  = file("${path.module}/resolvers/lambda-request.vtl")
  response_template = file("${path.module}/resolvers/lambda-response.vtl")
}

resource "aws_appsync_resolver" "list_events" {
  api_id            = aws_appsync_graphql_api.main.id
  type              = "Query"
  field             = "listEvents"
  data_source       = aws_appsync_datasource.event_lambda.name
  request_template  = file("${path.module}/resolvers/lambda-request.vtl")
  response_template = file("${path.module}/resolvers/lambda-response.vtl")
}

resource "aws_appsync_resolver" "list_events_by_status" {
  api_id            = aws_appsync_graphql_api.main.id
  type              = "Query"
  field             = "listEventsByStatus"
  data_source       = aws_appsync_datasource.event_lambda.name
  request_template  = file("${path.module}/resolvers/lambda-request.vtl")
  response_template = file("${path.module}/resolvers/lambda-response.vtl")
}

resource "aws_appsync_resolver" "create_event" {
  api_id            = aws_appsync_graphql_api.main.id
  type              = "Mutation"
  field             = "createEvent"
  data_source       = aws_appsync_datasource.event_lambda.name
  request_template  = file("${path.module}/resolvers/lambda-request.vtl")
  response_template = file("${path.module}/resolvers/lambda-response.vtl")
}

resource "aws_appsync_resolver" "update_event" {
  api_id            = aws_appsync_graphql_api.main.id
  type              = "Mutation"
  field             = "updateEvent"
  data_source       = aws_appsync_datasource.event_lambda.name
  request_template  = file("${path.module}/resolvers/lambda-request.vtl")
  response_template = file("${path.module}/resolvers/lambda-response.vtl")
}

resource "aws_appsync_resolver" "delete_event" {
  api_id            = aws_appsync_graphql_api.main.id
  type              = "Mutation"
  field             = "deleteEvent"
  data_source       = aws_appsync_datasource.event_lambda.name
  request_template  = file("${path.module}/resolvers/lambda-request.vtl")
  response_template = file("${path.module}/resolvers/lambda-response.vtl")
}

# LaborLine Lambda Function
resource "aws_lambda_function" "laborline" {
  filename      = "../lambda/laborline/lambda.zip"
  function_name = "${var.project}-${var.environment}-laborline-resolver"
  role          = aws_iam_role.laborline_lambda.arn
  handler       = "index.handler"
  runtime       = "nodejs18.x"
  timeout       = 30
  memory_size   = 256

  environment {
    variables = {
      LABORLINES_API_URL = "https://laborlines-dev.sb.fullbay.com"
      LOG_LEVEL          = "INFO"
    }
  }

  source_code_hash = filebase64sha256("../lambda/laborline/lambda.zip")

  tags = {
    Name        = "${var.project}-${var.environment}-laborline-lambda"
    Environment = var.environment
    Project     = var.project
  }
}

# IAM Role for LaborLine Lambda
resource "aws_iam_role" "laborline_lambda" {
  name = "${var.project}-${var.environment}-laborline-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = {
    Name        = "${var.project}-${var.environment}-laborline-lambda-role"
    Environment = var.environment
    Project     = var.project
  }
}

# IAM Policy for LaborLine Lambda
resource "aws_iam_role_policy" "laborline_lambda" {
  name = "${var.project}-${var.environment}-laborline-lambda-policy"
  role = aws_iam_role.laborline_lambda.id

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
        Resource = "arn:aws:logs:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:log-group:/aws/lambda/${var.project}-${var.environment}-laborline-resolver*"
      }
    ]
  })
}

# CloudWatch Log Group for LaborLine Lambda
resource "aws_cloudwatch_log_group" "laborline_lambda" {
  name              = "/aws/lambda/${var.project}-${var.environment}-laborline-resolver"
  retention_in_days = 7

  tags = {
    Name        = "${var.project}-${var.environment}-laborline-lambda-logs"
    Environment = var.environment
    Project     = var.project
  }
}

# AppSync Data Source for LaborLine Lambda
resource "aws_appsync_datasource" "laborline_lambda" {
  api_id           = aws_appsync_graphql_api.main.id
  name             = "laborline_lambda_datasource"
  type             = "AWS_LAMBDA"
  service_role_arn = aws_iam_role.appsync_lambda.arn

  lambda_config {
    function_arn = aws_lambda_function.laborline.arn
  }
}

# AppSync Resolvers for LaborLine operations
resource "aws_appsync_resolver" "get_labor_line" {
  api_id            = aws_appsync_graphql_api.main.id
  type              = "Query"
  field             = "getLaborLine"
  data_source       = aws_appsync_datasource.laborline_lambda.name
  request_template  = file("${path.module}/resolvers/lambda-request.vtl")
  response_template = file("${path.module}/resolvers/lambda-response.vtl")
}

resource "aws_appsync_resolver" "list_labor_lines" {
  api_id            = aws_appsync_graphql_api.main.id
  type              = "Query"
  field             = "listLaborLines"
  data_source       = aws_appsync_datasource.laborline_lambda.name
  request_template  = file("${path.module}/resolvers/lambda-request.vtl")
  response_template = file("${path.module}/resolvers/lambda-response.vtl")
}

resource "aws_appsync_resolver" "create_labor_line" {
  api_id            = aws_appsync_graphql_api.main.id
  type              = "Mutation"
  field             = "createLaborLine"
  data_source       = aws_appsync_datasource.laborline_lambda.name
  request_template  = file("${path.module}/resolvers/lambda-request.vtl")
  response_template = file("${path.module}/resolvers/lambda-response.vtl")
}

resource "aws_appsync_resolver" "update_labor_line" {
  api_id            = aws_appsync_graphql_api.main.id
  type              = "Mutation"
  field             = "updateLaborLine"
  data_source       = aws_appsync_datasource.laborline_lambda.name
  request_template  = file("${path.module}/resolvers/lambda-request.vtl")
  response_template = file("${path.module}/resolvers/lambda-response.vtl")
}

resource "aws_appsync_resolver" "delete_labor_line" {
  api_id            = aws_appsync_graphql_api.main.id
  type              = "Mutation"
  field             = "deleteLaborLine"
  data_source       = aws_appsync_datasource.laborline_lambda.name
  request_template  = file("${path.module}/resolvers/lambda-request.vtl")
  response_template = file("${path.module}/resolvers/lambda-response.vtl")
}

# Location Lambda Function
resource "aws_lambda_function" "location" {
  filename      = "../lambda/location/lambda.zip"
  function_name = "${var.project}-${var.environment}-location-resolver"
  role          = aws_iam_role.location_lambda.arn
  handler       = "index.handler"
  runtime       = "nodejs18.x"
  timeout       = 30
  memory_size   = 256

  environment {
    variables = {
      LOCATIONS_API_URL = "https://location-srnext.sb.fullbay.com"
      LOG_LEVEL         = "INFO"
    }
  }

  source_code_hash = filebase64sha256("../lambda/location/lambda.zip")

  tags = {
    Name        = "${var.project}-${var.environment}-location-lambda"
    Environment = var.environment
    Project     = var.project
  }
}

# IAM Role for Location Lambda
resource "aws_iam_role" "location_lambda" {
  name = "${var.project}-${var.environment}-location-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = {
    Name        = "${var.project}-${var.environment}-location-lambda-role"
    Environment = var.environment
    Project     = var.project
  }
}

# IAM Policy for Location Lambda
resource "aws_iam_role_policy" "location_lambda" {
  name = "${var.project}-${var.environment}-location-lambda-policy"
  role = aws_iam_role.location_lambda.id

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
        Resource = "arn:aws:logs:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:log-group:/aws/lambda/${var.project}-${var.environment}-location-resolver*"
      }
    ]
  })
}

# CloudWatch Log Group for Location Lambda
resource "aws_cloudwatch_log_group" "location_lambda" {
  name              = "/aws/lambda/${var.project}-${var.environment}-location-resolver"
  retention_in_days = 7

  tags = {
    Name        = "${var.project}-${var.environment}-location-lambda-logs"
    Environment = var.environment
    Project     = var.project
  }
}

# AppSync Data Source for Location Lambda
resource "aws_appsync_datasource" "location_lambda" {
  api_id           = aws_appsync_graphql_api.main.id
  name             = "location_lambda_datasource"
  type             = "AWS_LAMBDA"
  service_role_arn = aws_iam_role.appsync_lambda.arn

  lambda_config {
    function_arn = aws_lambda_function.location.arn
  }
}

# AppSync Resolvers for Location operations
resource "aws_appsync_resolver" "get_location" {
  api_id            = aws_appsync_graphql_api.main.id
  type              = "Query"
  field             = "getLocation"
  data_source       = aws_appsync_datasource.location_lambda.name
  request_template  = file("${path.module}/resolvers/lambda-request.vtl")
  response_template = file("${path.module}/resolvers/lambda-response.vtl")
}

resource "aws_appsync_resolver" "list_locations" {
  api_id            = aws_appsync_graphql_api.main.id
  type              = "Query"
  field             = "listLocations"
  data_source       = aws_appsync_datasource.location_lambda.name
  request_template  = file("${path.module}/resolvers/lambda-request.vtl")
  response_template = file("${path.module}/resolvers/lambda-response.vtl")
}

resource "aws_appsync_resolver" "create_location" {
  api_id            = aws_appsync_graphql_api.main.id
  type              = "Mutation"
  field             = "createLocation"
  data_source       = aws_appsync_datasource.location_lambda.name
  request_template  = file("${path.module}/resolvers/lambda-request.vtl")
  response_template = file("${path.module}/resolvers/lambda-response.vtl")
}

resource "aws_appsync_resolver" "update_location" {
  api_id            = aws_appsync_graphql_api.main.id
  type              = "Mutation"
  field             = "updateLocation"
  data_source       = aws_appsync_datasource.location_lambda.name
  request_template  = file("${path.module}/resolvers/lambda-request.vtl")
  response_template = file("${path.module}/resolvers/lambda-response.vtl")
}

resource "aws_appsync_resolver" "delete_location" {
  api_id            = aws_appsync_graphql_api.main.id
  type              = "Mutation"
  field             = "deleteLocation"
  data_source       = aws_appsync_datasource.location_lambda.name
  request_template  = file("${path.module}/resolvers/lambda-request.vtl")
  response_template = file("${path.module}/resolvers/lambda-response.vtl")
}

# Part Lambda Function
resource "aws_lambda_function" "part" {
  filename      = "../lambda/part/lambda.zip"
  function_name = "${var.project}-${var.environment}-part-resolver"
  role          = aws_iam_role.part_lambda.arn
  handler       = "index.handler"
  runtime       = "nodejs18.x"
  timeout       = 30
  memory_size   = 256

  environment {
    variables = {
      PARTS_API_URL = "https://part-srnext.sb.fullbay.com"
      LOG_LEVEL     = "INFO"
    }
  }

  source_code_hash = filebase64sha256("../lambda/part/lambda.zip")

  tags = {
    Name        = "${var.project}-${var.environment}-part-lambda"
    Environment = var.environment
    Project     = var.project
  }
}

# IAM Role for Part Lambda
resource "aws_iam_role" "part_lambda" {
  name = "${var.project}-${var.environment}-part-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = {
    Name        = "${var.project}-${var.environment}-part-lambda-role"
    Environment = var.environment
    Project     = var.project
  }
}

# IAM Policy for Part Lambda
resource "aws_iam_role_policy" "part_lambda" {
  name = "${var.project}-${var.environment}-part-lambda-policy"
  role = aws_iam_role.part_lambda.id

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
        Resource = "arn:aws:logs:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:log-group:/aws/lambda/${var.project}-${var.environment}-part-resolver*"
      }
    ]
  })
}

# CloudWatch Log Group for Part Lambda
resource "aws_cloudwatch_log_group" "part_lambda" {
  name              = "/aws/lambda/${var.project}-${var.environment}-part-resolver"
  retention_in_days = 7

  tags = {
    Name        = "${var.project}-${var.environment}-part-lambda-logs"
    Environment = var.environment
    Project     = var.project
  }
}

# AppSync Data Source for Part Lambda
resource "aws_appsync_datasource" "part_lambda" {
  api_id           = aws_appsync_graphql_api.main.id
  name             = "part_lambda_datasource"
  type             = "AWS_LAMBDA"
  service_role_arn = aws_iam_role.appsync_lambda.arn

  lambda_config {
    function_arn = aws_lambda_function.part.arn
  }
}

# AppSync Resolvers for Part operations
resource "aws_appsync_resolver" "get_part" {
  api_id            = aws_appsync_graphql_api.main.id
  type              = "Query"
  field             = "getPart"
  data_source       = aws_appsync_datasource.part_lambda.name
  request_template  = file("${path.module}/resolvers/lambda-request.vtl")
  response_template = file("${path.module}/resolvers/lambda-response.vtl")
}

resource "aws_appsync_resolver" "list_parts" {
  api_id            = aws_appsync_graphql_api.main.id
  type              = "Query"
  field             = "listParts"
  data_source       = aws_appsync_datasource.part_lambda.name
  request_template  = file("${path.module}/resolvers/lambda-request.vtl")
  response_template = file("${path.module}/resolvers/lambda-response.vtl")
}

resource "aws_appsync_resolver" "create_part" {
  api_id            = aws_appsync_graphql_api.main.id
  type              = "Mutation"
  field             = "createPart"
  data_source       = aws_appsync_datasource.part_lambda.name
  request_template  = file("${path.module}/resolvers/lambda-request.vtl")
  response_template = file("${path.module}/resolvers/lambda-response.vtl")
}

resource "aws_appsync_resolver" "update_part" {
  api_id            = aws_appsync_graphql_api.main.id
  type              = "Mutation"
  field             = "updatePart"
  data_source       = aws_appsync_datasource.part_lambda.name
  request_template  = file("${path.module}/resolvers/lambda-request.vtl")
  response_template = file("${path.module}/resolvers/lambda-response.vtl")
}

resource "aws_appsync_resolver" "delete_part" {
  api_id            = aws_appsync_graphql_api.main.id
  type              = "Mutation"
  field             = "deletePart"
  data_source       = aws_appsync_datasource.part_lambda.name
  request_template  = file("${path.module}/resolvers/lambda-request.vtl")
  response_template = file("${path.module}/resolvers/lambda-response.vtl")
}

# Task Lambda Resources
resource "aws_lambda_function" "task" {
  filename      = "../lambda/task/lambda.zip"
  function_name = "${var.project}-${var.environment}-task-resolver"
  role          = aws_iam_role.task_lambda.arn
  handler       = "index.handler"
  runtime       = "nodejs18.x"
  timeout       = 30
  memory_size   = 256
  
  environment {
    variables = {
      TASKS_API_URL = "https://srnext-tasks.sb.fullbay.com"
      LOG_LEVEL     = "INFO"
    }
  }
  
  source_code_hash = filebase64sha256("../lambda/task/lambda.zip")
  
  tags = {
    Name        = "${var.project}-${var.environment}-task-lambda"
    Environment = var.environment
    Project     = var.project
  }
}

# IAM Role for Task Lambda
resource "aws_iam_role" "task_lambda" {
  name = "${var.project}-${var.environment}-task-lambda-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
  
  tags = {
    Name        = "${var.project}-${var.environment}-task-lambda-role"
    Environment = var.environment
    Project     = var.project
  }
}

# IAM Policy for Task Lambda
resource "aws_iam_role_policy" "task_lambda" {
  name = "${var.project}-${var.environment}-task-lambda-policy"
  role = aws_iam_role.task_lambda.id

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
        Resource = "arn:aws:logs:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:log-group:/aws/lambda/${var.project}-${var.environment}-task-resolver*"
      }
    ]
  })
}

# CloudWatch Log Group for Task Lambda
resource "aws_cloudwatch_log_group" "task_lambda" {
  name              = "/aws/lambda/${var.project}-${var.environment}-task-resolver"
  retention_in_days = 7
  
  tags = {
    Name        = "${var.project}-${var.environment}-task-lambda-logs"
    Environment = var.environment
    Project     = var.project
  }
}

# AppSync Data Source for Task Lambda
resource "aws_appsync_datasource" "task_lambda" {
  api_id           = aws_appsync_graphql_api.main.id
  name             = "task_lambda_datasource"
  type             = "AWS_LAMBDA"
  service_role_arn = aws_iam_role.appsync_lambda.arn
  
  lambda_config {
    function_arn = aws_lambda_function.task.arn
  }
}

# Task AppSync Resolvers
resource "aws_appsync_resolver" "get_task" {
  api_id            = aws_appsync_graphql_api.main.id
  type              = "Query"
  field             = "getTask"
  data_source       = aws_appsync_datasource.task_lambda.name
  request_template  = file("${path.module}/resolvers/lambda-request.vtl")
  response_template = file("${path.module}/resolvers/lambda-response.vtl")
}

resource "aws_appsync_resolver" "list_tasks" {
  api_id            = aws_appsync_graphql_api.main.id
  type              = "Query"
  field             = "listTasks"
  data_source       = aws_appsync_datasource.task_lambda.name
  request_template  = file("${path.module}/resolvers/lambda-request.vtl")
  response_template = file("${path.module}/resolvers/lambda-response.vtl")
}

resource "aws_appsync_resolver" "create_task" {
  api_id            = aws_appsync_graphql_api.main.id
  type              = "Mutation"
  field             = "createTask"
  data_source       = aws_appsync_datasource.task_lambda.name
  request_template  = file("${path.module}/resolvers/lambda-request.vtl")
  response_template = file("${path.module}/resolvers/lambda-response.vtl")
}

resource "aws_appsync_resolver" "update_task" {
  api_id            = aws_appsync_graphql_api.main.id
  type              = "Mutation"
  field             = "updateTask"
  data_source       = aws_appsync_datasource.task_lambda.name
  request_template  = file("${path.module}/resolvers/lambda-request.vtl")
  response_template = file("${path.module}/resolvers/lambda-response.vtl")
}

resource "aws_appsync_resolver" "delete_task" {
  api_id            = aws_appsync_graphql_api.main.id
  type              = "Mutation"
  field             = "deleteTask"
  data_source       = aws_appsync_datasource.task_lambda.name
  request_template  = file("${path.module}/resolvers/lambda-request.vtl")
  response_template = file("${path.module}/resolvers/lambda-response.vtl")
}

# WorkOrder Lambda Function
resource "aws_lambda_function" "workorder" {
  filename      = "../lambda/workorder/lambda.zip"
  function_name = "${var.project}-${var.environment}-workorder-resolver"
  role          = aws_iam_role.workorder_lambda.arn
  handler       = "index.handler"
  runtime       = "nodejs18.x"
  timeout       = 30
  memory_size   = 256

  environment {
    variables = {
      WORKORDERS_API_URL = "https://workorder-srnext.sb.fullbay.com"
      LOG_LEVEL          = "INFO"
    }
  }

  source_code_hash = filebase64sha256("../lambda/workorder/lambda.zip")

  tags = {
    Name        = "${var.project}-${var.environment}-workorder-lambda"
    Environment = var.environment
    Project     = var.project
  }
}

# IAM Role for WorkOrder Lambda
resource "aws_iam_role" "workorder_lambda" {
  name = "${var.project}-${var.environment}-workorder-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = {
    Name        = "${var.project}-${var.environment}-workorder-lambda-role"
    Environment = var.environment
    Project     = var.project
  }
}

# IAM Policy for WorkOrder Lambda
resource "aws_iam_role_policy" "workorder_lambda" {
  name = "${var.project}-${var.environment}-workorder-lambda-policy"
  role = aws_iam_role.workorder_lambda.id

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
        Resource = "arn:aws:logs:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:log-group:/aws/lambda/${var.project}-${var.environment}-workorder-resolver*"
      }
    ]
  })
}

# CloudWatch Log Group for WorkOrder Lambda
resource "aws_cloudwatch_log_group" "workorder_lambda" {
  name              = "/aws/lambda/${var.project}-${var.environment}-workorder-resolver"
  retention_in_days = 7
  
  tags = {
    Name        = "${var.project}-${var.environment}-workorder-lambda-logs"
    Environment = var.environment
    Project     = var.project
  }
}

# AppSync Data Source for WorkOrder Lambda
resource "aws_appsync_datasource" "workorder_lambda" {
  api_id           = aws_appsync_graphql_api.main.id
  name             = "workorder_lambda_datasource"
  type             = "AWS_LAMBDA"
  service_role_arn = aws_iam_role.appsync_lambda.arn
  
  lambda_config {
    function_arn = aws_lambda_function.workorder.arn
  }
}

# WorkOrder AppSync Resolvers
resource "aws_appsync_resolver" "get_workorder" {
  api_id            = aws_appsync_graphql_api.main.id
  type              = "Query"
  field             = "getWorkOrder"
  data_source       = aws_appsync_datasource.workorder_lambda.name
  request_template  = file("${path.module}/resolvers/lambda-request.vtl")
  response_template = file("${path.module}/resolvers/lambda-response.vtl")
}

resource "aws_appsync_resolver" "list_workorders" {
  api_id            = aws_appsync_graphql_api.main.id
  type              = "Query"
  field             = "listWorkOrders"
  data_source       = aws_appsync_datasource.workorder_lambda.name
  request_template  = file("${path.module}/resolvers/lambda-request.vtl")
  response_template = file("${path.module}/resolvers/lambda-response.vtl")
}

resource "aws_appsync_resolver" "create_workorder" {
  api_id            = aws_appsync_graphql_api.main.id
  type              = "Mutation"
  field             = "createWorkOrder"
  data_source       = aws_appsync_datasource.workorder_lambda.name
  request_template  = file("${path.module}/resolvers/lambda-request.vtl")
  response_template = file("${path.module}/resolvers/lambda-response.vtl")
}

resource "aws_appsync_resolver" "update_workorder" {
  api_id            = aws_appsync_graphql_api.main.id
  type              = "Mutation"
  field             = "updateWorkOrder"
  data_source       = aws_appsync_datasource.workorder_lambda.name
  request_template  = file("${path.module}/resolvers/lambda-request.vtl")
  response_template = file("${path.module}/resolvers/lambda-response.vtl")
}

resource "aws_appsync_resolver" "delete_workorder" {
  api_id            = aws_appsync_graphql_api.main.id
  type              = "Mutation"
  field             = "deleteWorkOrder"
  data_source       = aws_appsync_datasource.workorder_lambda.name
  request_template  = file("${path.module}/resolvers/lambda-request.vtl")
  response_template = file("${path.module}/resolvers/lambda-response.vtl")
}