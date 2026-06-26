# AWS Backend

This folder stores the exported source-of-truth for the manually built AWS backend before Terraform migration.

## Modules

- Visitor / Project View Counter
- Contact Handler
- Email Handler

## Services Used

- API Gateway HTTP API
- Lambda
- DynamoDB
- SQS
- SES
- IAM
- CloudWatch Logs

## Terraform Status

Planned. Not yet applied.

## Export Date

2026-06-26

## AWS Region

ap-northeast-1

## Exported Lambda Functions

| Lambda function | Local folder | Runtime | Handler |
| --- | --- | --- | --- |
| CloudResumeContactHandler | lambda/contact-handler/ | python3.12 | lambda_function.lambda_handler |
| CloudResumeEmailHandler | lambda/email-handler/ | python3.12 | lambda_function.lambda_handler |
| portfolio-view-counter | lambda/visitor-counter/ | python3.12 | lambda_function.lambda_handler |

## Notes

- `portfolio-view-counter` handles the website view counter and project view routes.
- `lambda/project-counter/` is documentation-only because project routes are currently implemented by `portfolio-view-counter`.
- Exported JSON files preserve deployed Lambda, IAM, and API Gateway configuration for later Terraform migration.
