# Terraform Import Mapping Report

## Summary

Terraform implementation has moved from placeholder-only scaffolding to import-ready local definitions where repo exports provide enough production detail. No production resources were modified.

## Data Sources Used

| Source | Data discovered |
| --- | --- |
| `backend-AWS/README.md` | AWS region, Lambda function names, service inventory |
| `backend-AWS/apigateway/*.json` and docs | HTTP API IDs, routes, integrations, stages, CORS |
| `backend-AWS/lambda/*/function-configuration.json` | Lambda names, ARNs, roles, runtime, handler, memory, timeout, env vars |
| `backend-AWS/iam/*.json` and docs | IAM roles, managed policy attachments, inline policies |
| `backend-AWS/architecture/aws-backend.md` | DynamoDB table names, SQS queue name, service flows |
| `backend-GCP/app/config/settings.py` | GCP defaults for location, docs bucket, CORS, ingest documents |
| `Statement_MD/CAPSTONE_PROJECT_STATE.md` and `Statement_MD/GCP_RAG_DEVELOPMENT_LOG.md` | Current GCP Cloud Run URL, current RAG document source, runtime config history |
| `Statement_MD/GCP_RAG_PROJECT_STATE.md` | Current GCP production CORS reference, updated from stale CloudFront origin |
| `.github/workflows/` | Manual-only workflows and current GCP CORS workflow value |

No read-only AWS or GCP CLI inventory commands were run in this pass.

## Validation Status

| Check | Result |
| --- | --- |
| `terraform fmt -recursive terraform` | Passed |
| `terraform fmt -check -recursive terraform` | Passed |
| `terraform validate` for each module | Attempted; blocked because providers are not initialized locally |

`terraform init` was not run because the task requires asking before provider initialization. No provider downloads were attempted.

## Module Coverage

| Module | Now covered | Still placeholder or TODO |
| --- | --- | --- |
| `terraform/aws/frontend` | Existing S3 bucket shell with `prevent_destroy`; variables/outputs/import notes | CloudFront resource, S3 supporting resources such as policy, website config, encryption, ownership controls, public access block |
| `terraform/aws/backend` | API Gateway HTTP APIs, stages, integrations, routes; Lambda function shells; IAM roles, managed attachments, inline policies; DynamoDB table shells; SQS queue shell; SES email identity candidate | Lambda package zip paths, DynamoDB billing/TTL/PITR/streams/indexes, SQS attributes/redrive/encryption, SES verification status, Lambda SQS event source mapping UUID |
| `terraform/gcp/rag-backend` | Cloud Run v2 service shell with known env values and import command | Current container image, Cloud Run service account, traffic split, resource limits, ingress/VPC settings, IAM policy bindings |

## Prepared Import Commands

AWS frontend:

```sh
terraform import aws_s3_bucket.frontend nkc-201-02-cloudresume-frontend
terraform import aws_cloudfront_distribution.frontend E2N94TMVG2LDE7
```

AWS backend:

```sh
terraform import aws_dynamodb_table.contact_submissions Cloud-Resume-Contact-Submissions
terraform import aws_dynamodb_table.portfolio_views portfolio-views
terraform import aws_sqs_queue.contact_email https://sqs.ap-northeast-1.amazonaws.com/001920499658/CloudResume-Contact-Email-Queue
terraform import 'aws_iam_role.lambda_roles["CloudResumeContactLambdaRole"]' CloudResumeContactLambdaRole
terraform import 'aws_iam_role.lambda_roles["CloudResumeEmailHandler-role-68yf25yo"]' CloudResumeEmailHandler-role-68yf25yo
terraform import 'aws_iam_role.lambda_roles["portfolio-view-counter-role"]' portfolio-view-counter-role
terraform import 'aws_lambda_function.backend["CloudResumeContactHandler"]' CloudResumeContactHandler
terraform import 'aws_lambda_function.backend["CloudResumeEmailHandler"]' CloudResumeEmailHandler
terraform import 'aws_lambda_function.backend["portfolio-view-counter"]' portfolio-view-counter
terraform import aws_apigatewayv2_api.viewcounter ajqu2ciscd
terraform import aws_apigatewayv2_api.contact fh0e0v86nk
terraform import aws_ses_email_identity.portfolio_contact_sender jarrett6796@gmail.com
```

Full route, stage, integration, policy, and attachment import commands are recorded in `terraform/aws/backend/import-notes.md`.

The AWS backend import commands may require a reviewed temporary var-file for unresolved import-only variables such as `lambda_package_files` and `dynamodb_billing_mode`.

GCP RAG backend:

```sh
terraform import google_cloud_run_v2_service.rag_backend projects/cloud-resume-ai-rag/locations/asia-east1/services/gcp-rag-backend
```

The GCP import command may require a reviewed temporary var-file for `container_image` after the live Cloud Run image is exported.

## Recommended Import Order

1. AWS frontend S3 bucket
2. AWS frontend S3 supporting configs after live export
3. AWS CloudFront distribution after live export
4. AWS DynamoDB tables
5. AWS SQS queues
6. AWS Lambda IAM roles and policies
7. AWS Lambda functions
8. AWS API Gateway APIs, stages, integrations, and routes
9. AWS SES identities
10. GCP Cloud Run service
11. GCP Cloud Run IAM after live policy export

## Manual Verification Required

- Export CloudFront distribution config before writing `aws_cloudfront_distribution`.
- Export S3 bucket policy, public access, website hosting, ownership controls, and encryption before adding supporting S3 resources.
- Confirm DynamoDB billing mode and table features before trusting plans.
- Export SQS queue attributes and event source mapping UUID.
- Confirm SES identity type and verification status.
- Export Cloud Run image and IAM policy with read-only `gcloud` before planning GCP changes.
- If validation is needed beyond formatting, run `terraform init -backend=false` only after explicit approval, then rerun `terraform validate`.

## Safety Warnings

- Do not run `terraform apply`.
- Do not run `terraform destroy`.
- Do not run `terraform import` until explicitly approved.
- Do not run GitHub Actions deployment workflows.
