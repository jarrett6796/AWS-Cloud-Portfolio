output "production_domain_name" {
  description = "Current production custom domain reference."
  value       = var.production_domain_name
}

output "api_gateway_ids" {
  description = "API Gateway HTTP API IDs discovered from backend-AWS exports."
  value = {
    viewcounter = aws_apigatewayv2_api.viewcounter.id
    contact     = aws_apigatewayv2_api.contact.id
  }
}

output "lambda_function_names" {
  description = "Lambda function names discovered from backend-AWS exports."
  value       = keys(aws_lambda_function.backend)
}
