variable "aws_region" {
  description = "AWS region for provider operations."
  type        = string
  default     = "ap-northeast-1"
}

variable "environment" {
  description = "Deployment environment label for import mapping."
  type        = string
  default     = "production"
}

variable "production_domain_name" {
  description = "Current production custom domain."
  type        = string
  default     = "aws-cloudresume-gcprag-jarrett.cc"
}

variable "lambda_package_files" {
  description = "TODO_IMPORT_REQUIRED: exact local zip package path per Lambda function before any plan that may update code."
  type        = map(string)
}

variable "dynamodb_billing_mode" {
  description = "Live billing mode verified from read-only DynamoDB inventory."
  type        = string
  default     = "PAY_PER_REQUEST"
}
