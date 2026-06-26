variable "aws_region" {
  description = "AWS region for provider operations. Confirm against production before planning."
  type        = string
}

variable "frontend_bucket_name" {
  description = "Existing production S3 frontend bucket to import."
  type        = string
  default     = "nkc-201-02-cloudresume-frontend"
}

variable "cloudfront_distribution_id" {
  description = "Existing production CloudFront distribution ID to import."
  type        = string
  default     = "E2N94TMVG2LDE7"
}

variable "production_domain" {
  description = "Current production custom domain."
  type        = string
  default     = "aws-cloudresume-gcprag-jarrett.cc"
}
