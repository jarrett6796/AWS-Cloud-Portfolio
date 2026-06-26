locals {
  lambda_functions = {
    CloudResumeContactHandler = {
      role        = "arn:aws:iam::001920499658:role/CloudResumeContactLambdaRole"
      runtime     = "python3.12"
      handler     = "lambda_function.lambda_handler"
      memory_size = 128
      timeout     = 3
      environment = {
        CONTACT_TABLE_NAME = "Cloud-Resume-Contact-Submissions"
        EMAIL_QUEUE_URL    = "https://sqs.ap-northeast-1.amazonaws.com/001920499658/CloudResume-Contact-Email-Queue"
      }
    }
    CloudResumeEmailHandler = {
      role        = "arn:aws:iam::001920499658:role/CloudResumeEmailHandler-role-68yf25yo"
      runtime     = "python3.12"
      handler     = "lambda_function.lambda_handler"
      memory_size = 128
      timeout     = 3
      environment = {
        FROM_EMAIL = "jarrett6796@gmail.com"
        TO_EMAIL   = "jarrett6796@gmail.com"
      }
    }
    portfolio-view-counter = {
      role        = "arn:aws:iam::001920499658:role/portfolio-view-counter-role"
      runtime     = "python3.12"
      handler     = "lambda_function.lambda_handler"
      memory_size = 128
      timeout     = 3
      environment = {}
    }
  }
}

resource "aws_lambda_function" "backend" {
  for_each = local.lambda_functions

  function_name = each.key
  role          = each.value.role
  runtime       = each.value.runtime
  handler       = each.value.handler
  memory_size   = each.value.memory_size
  timeout       = each.value.timeout
  package_type  = "Zip"
  architectures = ["x86_64"]

  # TODO_IMPORT_REQUIRED: provide exact package zip paths before any plan that
  # may update code. Import first, then reconcile code packaging intentionally.
  filename = var.lambda_package_files[each.key]

  dynamic "environment" {
    for_each = length(each.value.environment) > 0 ? [each.value.environment] : []
    content {
      variables = environment.value
    }
  }

  tracing_config {
    mode = "PassThrough"
  }

  lifecycle {
    prevent_destroy = true
    ignore_changes = [
      filename,
      source_code_hash,
    ]
  }
}
