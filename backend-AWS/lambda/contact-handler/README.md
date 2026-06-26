# CloudResumeContactHandler

## Purpose

Receives portfolio contact form submissions, validates the request body, writes the submission to DynamoDB, and queues an email job in SQS.

## Runtime

python3.12

## Handler

lambda_function.lambda_handler

## AWS Region

ap-northeast-1

## API Gateway Routes / Triggers

- HTTP API route: `POST /contact`
- Lambda integration: `CloudResumeContactAPI`

## AWS Resources Used

- DynamoDB table: `Cloud-Resume-Contact-Submissions`
- SQS queue: `CloudResume-Contact-Email-Queue`
- SES identity: none directly used by this Lambda
- CloudWatch log group: `/aws/lambda/CloudResumeContactHandler`
- IAM role: `CloudResumeContactLambdaRole`

## Environment Variables

- `CONTACT_TABLE_NAME`
- `EMAIL_QUEUE_URL`

## Notes

- Source exported from the deployed Lambda package on 2026-06-26.
- The function returns permissive Lambda-level CORS headers for contact form requests.
