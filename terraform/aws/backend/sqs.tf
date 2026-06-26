resource "aws_sqs_queue" "contact_email" {
  name                       = "CloudResume-Contact-Email-Queue"
  delay_seconds              = 0
  max_message_size           = 262144
  message_retention_seconds  = 345600
  receive_wait_time_seconds  = 0
  sqs_managed_sse_enabled    = true
  visibility_timeout_seconds = 30

  policy = jsonencode({
    Version = "2012-10-17"
    Id      = "__default_policy_ID"
    Statement = [
      {
        Sid    = "__owner_statement"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::001920499658:root"
        }
        Action   = "SQS:*"
        Resource = "arn:aws:sqs:ap-northeast-1:001920499658:CloudResume-Contact-Email-Queue"
      },
    ]
  })

  lifecycle {
    prevent_destroy = true
    ignore_changes  = all
  }
}
