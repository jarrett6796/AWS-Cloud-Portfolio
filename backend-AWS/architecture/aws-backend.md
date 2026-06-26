# AWS Backend Architecture

Export date: 2026-06-26

AWS region: `ap-northeast-1`

## Contact Flow

1. API Gateway HTTP API receives `POST /contact`.
2. `CloudResumeContactHandler` validates the submitted contact form body.
3. The Lambda writes the submission to the `Cloud-Resume-Contact-Submissions` DynamoDB table.
4. The Lambda sends an email job to the `CloudResume-Contact-Email-Queue` SQS queue.
5. `CloudResumeEmailHandler` processes SQS records and sends notification email through SES.

## View Counter Flow

1. API Gateway HTTP API receives `GET /views`, `GET /projects/{projectId}`, or `POST /projects/{projectId}/view`.
2. `portfolio-view-counter` handles the route.
3. The Lambda reads or increments counters in the `portfolio-views` DynamoDB table.

## Terraform Migration Status

Terraform is planned but has not been applied.

The files in this directory preserve the current manually deployed AWS implementation as the migration source-of-truth.
