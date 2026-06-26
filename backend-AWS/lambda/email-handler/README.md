# CloudResumeEmailHandler

## Purpose

Processes contact email jobs from SQS and sends notification emails through SES. It also contains a sandbox-aware auto-reply branch.

## Runtime

python3.12

## Handler

lambda_function.lambda_handler

## AWS Region

ap-northeast-1

## API Gateway Routes / Triggers

- Trigger: SQS event source from `CloudResume-Contact-Email-Queue`
- No direct API Gateway route is configured for this Lambda.

## AWS Resources Used

- DynamoDB table: none
- SQS queue: `CloudResume-Contact-Email-Queue`
- SES identity: configured by the `FROM_EMAIL` and `TO_EMAIL` environment variables
- CloudWatch log group: `/aws/lambda/CloudResumeEmailHandler`
- IAM role: `CloudResumeEmailHandler-role-68yf25yo`

## Environment Variables

- `FROM_EMAIL`
- `TO_EMAIL`

## Notes

- Source exported from the deployed Lambda package on 2026-06-26.
- The deployed code sends an auto-reply only when the sender email matches the configured sender identity.
