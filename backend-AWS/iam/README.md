# IAM

This folder contains exported IAM role and policy documents for the manually built AWS backend before Terraform migration.

## Export Date

2026-06-26

## AWS Region

ap-northeast-1

## Lambda Execution Roles

| Lambda | Role |
| --- | --- |
| CloudResumeContactHandler | `CloudResumeContactLambdaRole` |
| CloudResumeEmailHandler | `CloudResumeEmailHandler-role-68yf25yo` |
| portfolio-view-counter | `portfolio-view-counter-role` |

## Attached Managed Policies

| Role | Managed policy |
| --- | --- |
| CloudResumeContactLambdaRole | `AWSLambdaBasicExecutionRole` |
| CloudResumeEmailHandler-role-68yf25yo | `AWSLambdaBasicExecutionRole` |
| portfolio-view-counter-role | `AWSLambdaBasicExecutionRole` |
| portfolio-view-counter-role | `AmazonDynamoDBFullAccess` |

## Inline Policies

| Role | Inline policy | Purpose |
| --- | --- | --- |
| CloudResumeContactLambdaRole | `CloudResume-ContactLambdaWritePolicy` | Write contact submissions to DynamoDB and send jobs to SQS. |
| CloudResumeEmailHandler-role-68yf25yo | `CloudResumeEmailLambdaPolicy` | Read/delete SQS email jobs and send email through SES. |

## Raw Export Files

- `CloudResumeContactLambdaRole-role.json`
- `CloudResumeContactLambdaRole-attached-policies.json`
- `CloudResumeContactLambdaRole-inline-policy-names.json`
- `CloudResumeContactLambdaRole-CloudResume-ContactLambdaWritePolicy-inline-policy.json`
- `CloudResumeEmailHandler-role-68yf25yo-role.json`
- `CloudResumeEmailHandler-role-68yf25yo-attached-policies.json`
- `CloudResumeEmailHandler-role-68yf25yo-inline-policy-names.json`
- `CloudResumeEmailHandler-role-68yf25yo-CloudResumeEmailLambdaPolicy-inline-policy.json`
- `portfolio-view-counter-role-role.json`
- `portfolio-view-counter-role-attached-policies.json`
- `portfolio-view-counter-role-inline-policy-names.json`
- `AWSLambdaBasicExecutionRole-policy.json`
- `AWSLambdaBasicExecutionRole-policy-version-v1.json`
- `AmazonDynamoDBFullAccess-policy.json`
- `AmazonDynamoDBFullAccess-policy-version.json`
