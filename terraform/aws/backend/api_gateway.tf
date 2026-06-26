locals {
  api_gateway_integrations = {
    contact = {
      api_key     = "contact"
      lambda_name = "CloudResumeContactHandler"
      uri         = "arn:aws:lambda:ap-northeast-1:001920499658:function:CloudResumeContactHandler"
    }
    viewcounter = {
      api_key     = "viewcounter"
      lambda_name = "portfolio-view-counter"
      uri         = "arn:aws:lambda:ap-northeast-1:001920499658:function:portfolio-view-counter"
    }
  }

  api_gateway_routes = {
    contact_post = {
      api_key   = "contact"
      route_key = "POST /contact"
      target    = "integrations/g9ynj9l"
    }
    viewcounter_get_views = {
      api_key   = "viewcounter"
      route_key = "GET /views"
      target    = "integrations/kgscnwd"
    }
    viewcounter_get_project = {
      api_key   = "viewcounter"
      route_key = "GET /projects/{projectId}"
      target    = "integrations/kgscnwd"
    }
    viewcounter_post_project_view = {
      api_key   = "viewcounter"
      route_key = "POST /projects/{projectId}/view"
      target    = "integrations/kgscnwd"
    }
  }
}

resource "aws_apigatewayv2_api" "viewcounter" {
  name                         = "Viewcounter API"
  protocol_type                = "HTTP"
  api_key_selection_expression = "$request.header.x-api-key"
  route_selection_expression   = "$request.method $request.path"
  disable_execute_api_endpoint = false

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_apigatewayv2_api" "contact" {
  name                         = "CloudResumeContactAPI"
  protocol_type                = "HTTP"
  api_key_selection_expression = "$request.header.x-api-key"
  route_selection_expression   = "$request.method $request.path"
  disable_execute_api_endpoint = false

  cors_configuration {
    allow_credentials = false
    allow_headers     = ["content-type"]
    allow_methods     = ["POST"]
    allow_origins = [
      "http://localhost:5174",
      "http://localhost:5173",
      "https://aws-cloudresume-gcprag-jarrett.cc",
    ]
    max_age = 0
  }

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_apigatewayv2_stage" "default" {
  for_each = {
    viewcounter = aws_apigatewayv2_api.viewcounter.id
    contact     = aws_apigatewayv2_api.contact.id
  }

  api_id      = each.value
  name        = "$default"
  auto_deploy = true

  default_route_settings {
    detailed_metrics_enabled = false
  }

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_apigatewayv2_integration" "lambda" {
  for_each = local.api_gateway_integrations

  api_id                 = each.value.api_key == "contact" ? aws_apigatewayv2_api.contact.id : aws_apigatewayv2_api.viewcounter.id
  integration_type       = "AWS_PROXY"
  integration_method     = "POST"
  integration_uri        = each.value.uri
  connection_type        = "INTERNET"
  payload_format_version = "2.0"
  timeout_milliseconds   = 30000

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_apigatewayv2_route" "routes" {
  for_each = local.api_gateway_routes

  api_id             = each.value.api_key == "contact" ? aws_apigatewayv2_api.contact.id : aws_apigatewayv2_api.viewcounter.id
  route_key          = each.value.route_key
  target             = each.value.target
  authorization_type = "NONE"
  api_key_required   = false

  lifecycle {
    prevent_destroy = true
  }
}
