variable "aws_region" {
  description = "AWS region for provider operations. Confirm against production before planning."
  type        = string
}

variable "production_domain" {
  description = "Current production custom domain."
  type        = string
  default     = "aws-cloudresume-gcprag-jarrett.cc"
}
