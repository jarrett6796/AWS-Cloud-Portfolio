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

resource "aws_lambda_event_source_mapping" "email_queue" {
  event_source_arn = aws_sqs_queue.contact_email.arn
  function_name    = aws_lambda_function.backend["CloudResumeEmailHandler"].arn
  enabled          = true
  batch_size       = 1

  lifecycle {
    prevent_destroy = true
    ignore_changes  = all
  }
}

locals {
  lambda_permissions = {
    contact_api_post_contact = {
      statement_id  = "51360466-057a-5ee4-9b2d-1705d6aefa5d"
      function_name = "CloudResumeContactHandler"
      source_arn    = "arn:aws:execute-api:ap-northeast-1:001920499658:fh0e0v86nk/*/*/contact"
    }
    viewcounter_api_get_views = {
      statement_id  = "0f0eb62a-8f29-53c6-9e68-19f200979b8b"
      function_name = "portfolio-view-counter"
      source_arn    = "arn:aws:execute-api:ap-northeast-1:001920499658:ajqu2ciscd/*/*/views"
    }
    viewcounter_api_get_project = {
      statement_id  = "7ce2696f-070f-5fef-98ae-ca0e38af6405"
      function_name = "portfolio-view-counter"
      source_arn    = "arn:aws:execute-api:ap-northeast-1:001920499658:ajqu2ciscd/*/*/projects/{projectId}"
    }
    viewcounter_api_post_project_view = {
      statement_id  = "allow-apigateway-project-view-post"
      function_name = "portfolio-view-counter"
      source_arn    = "arn:aws:execute-api:ap-northeast-1:001920499658:ajqu2ciscd/*/POST/projects/*/view"
    }
  }
}

resource "aws_lambda_permission" "apigateway" {
  for_each = local.lambda_permissions

  statement_id  = each.value.statement_id
  action        = "lambda:InvokeFunction"
  function_name = each.value.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = each.value.source_arn

  lifecycle {
    prevent_destroy = true
  }
}
