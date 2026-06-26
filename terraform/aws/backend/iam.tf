locals {
  lambda_assume_role_policy = {
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
  }

  iam_roles = {
    CloudResumeContactLambdaRole = {
      description = "Lambda role for Contact Submission"
      tags = {
        Project = ""
      }
    }
    CloudResumeEmailHandler-role-68yf25yo = {
      description = ""
      tags        = {}
    }
    portfolio-view-counter-role = {
      description = ""
      tags        = {}
    }
  }

  managed_policy_attachments = {
    contact_basic_logs = {
      role       = "CloudResumeContactLambdaRole"
      policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
    }
    email_basic_logs = {
      role       = "CloudResumeEmailHandler-role-68yf25yo"
      policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
    }
    viewcounter_basic_logs = {
      role       = "portfolio-view-counter-role"
      policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
    }
    viewcounter_dynamodb_full_access = {
      role       = "portfolio-view-counter-role"
      policy_arn = "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
    }
  }
}

resource "aws_iam_role" "lambda_roles" {
  for_each = local.iam_roles

  name               = each.key
  assume_role_policy = jsonencode(local.lambda_assume_role_policy)
  description        = each.value.description
  tags               = each.value.tags

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_iam_role_policy_attachment" "managed" {
  for_each = local.managed_policy_attachments

  role       = each.value.role
  policy_arn = each.value.policy_arn

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_iam_role_policy" "contact_write" {
  name = "CloudResume-ContactLambdaWritePolicy"
  role = "CloudResumeContactLambdaRole"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "WriteContactSubmissionsToDynamoDB"
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem",
        ]
        Resource = "arn:aws:dynamodb:ap-northeast-1:001920499658:table/Cloud-Resume-Contact-Submissions"
      },
      {
        Sid    = "SendEmailJobsToSQS"
        Effect = "Allow"
        Action = [
          "sqs:SendMessage",
        ]
        Resource = "arn:aws:sqs:ap-northeast-1:001920499658:CloudResume-Contact-Email-Queue"
      },
    ]
  })

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_iam_role_policy" "email_handler" {
  name = "CloudResumeEmailLambdaPolicy"
  role = "CloudResumeEmailHandler-role-68yf25yo"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "ReadEmailJobsFromSQS"
        Effect = "Allow"
        Action = [
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes",
        ]
        Resource = "arn:aws:sqs:ap-northeast-1:001920499658:CloudResume-Contact-Email-Queue"
      },
      {
        Sid    = "SendEmailsWithSES"
        Effect = "Allow"
        Action = [
          "ses:SendEmail",
          "ses:SendRawEmail",
        ]
        Resource = "*"
      },
    ]
  })

  lifecycle {
    prevent_destroy = true
  }
}
