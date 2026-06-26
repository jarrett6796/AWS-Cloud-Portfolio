output "frontend_bucket_name" {
  description = "Existing production S3 bucket name targeted for import."
  value       = var.frontend_bucket_name
}

output "cloudfront_distribution_id" {
  description = "Existing production CloudFront distribution ID targeted for import."
  value       = var.cloudfront_distribution_id
}

output "production_domain_name" {
  description = "Current production custom domain."
  value       = var.production_domain_name
}
