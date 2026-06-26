# portfolio-view-counter

## Purpose

Maintains the portfolio website view counter and per-project view counters in DynamoDB.

## Runtime

python3.12

## Handler

lambda_function.lambda_handler

## AWS Region

ap-northeast-1

## API Gateway Routes / Triggers

- HTTP API route: `GET /views`
- HTTP API route: `GET /projects/{projectId}`
- HTTP API route: `POST /projects/{projectId}/view`
- Lambda integration: `Viewcounter API`

## AWS Resources Used

- DynamoDB table: `portfolio-views`
- SQS queue: none
- SES identity: none
- CloudWatch log group: `/aws/lambda/portfolio-view-counter`
- IAM role: `portfolio-view-counter-role`

## Environment Variables

None.

## Notes

- Source exported from the deployed Lambda package on 2026-06-26.
- This Lambda handles both the website view route and all project view routes.
- The local `lambda/project-counter/` folder remains documentation-only unless the project counter is later separated into its own Lambda.
