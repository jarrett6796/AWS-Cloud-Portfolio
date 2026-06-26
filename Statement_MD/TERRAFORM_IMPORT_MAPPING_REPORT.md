# Terraform Import Mapping Report

## Summary

Terraform implementation has moved from placeholder-only scaffolding to import-ready local definitions where repo exports and read-only live inventory provide enough production detail. No production resources were modified.

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
| Read-only AWS CLI inventory under ignored `terraform/aws/*/inventory/` | S3, CloudFront, OAC, API Gateway, Lambda, DynamoDB, SQS, IAM, and SES live settings |
| Read-only GCP CLI inventory under ignored `terraform/gcp/rag-backend/inventory/` | Cloud Run service, Cloud Run IAM policy, and docs bucket live settings |

The raw inventory folders are intentionally ignored by `.gitignore` and must not be committed.

## Validation Status

| Check | Result |
| --- | --- |
| `terraform fmt -recursive terraform` | Passed |
| `terraform fmt -check -recursive terraform` | Passed |
| `terraform init -backend=false` for each module | Passed |
| `terraform validate` for each module | Passed |

Provider initialization reused locked provider versions locally with backend disabled. No `terraform import`, `terraform plan`, `terraform apply`, or `terraform destroy` command was run.

## Module Coverage

| Module | Now covered | Still placeholder or TODO |
| --- | --- | --- |
| `terraform/aws/frontend` | Existing S3 bucket plus versioning, public access block, ownership controls, encryption, bucket policy, CloudFront OAC, and CloudFront distribution import blocks with `prevent_destroy` | Decide whether Terraform should later own WAF, ACM, DNS, and invalidation workflows; S3 website hosting is not configured |
| `terraform/aws/backend` | API Gateway HTTP APIs, stages, integrations, routes; Lambda function shells; Lambda permissions; SQS event source mapping; IAM roles, managed attachments, inline policies; DynamoDB table shells with verified on-demand billing; SQS queue attributes; SES email identity | Lambda package zip paths; decide whether to explicitly model disabled DynamoDB TTL/PITR; review API Gateway route imports in state before any plan |
| `terraform/gcp/rag-backend` | Cloud Run v2 service shell with verified image digest, env vars, service account, traffic, scaling, timeout, resources, ingress, and public invoker IAM member | Decide whether to model Artifact Registry, source-deploy bucket, GCS docs bucket, and service annotations or leave referenced-only |

## Live Inventory Reconciliation - 2026-06-26

AWS frontend:

- S3 bucket region is `ap-northeast-1`.
- S3 versioning is `Enabled`.
- S3 public access block has all four controls set to `true`.
- S3 bucket policy allows only the CloudFront service principal, scoped to distribution `E2N94TMVG2LDE7`.
- S3 website hosting is not configured.
- S3 ownership controls are `BucketOwnerEnforced`.
- S3 default encryption is `AES256` with bucket key enabled.
- CloudFront distribution `E2N94TMVG2LDE7` is deployed with alias `aws-cloudresume-gcprag-jarrett.cc`, default root object `index.html`, S3 regional origin `nkc-201-02-cloudresume-frontend.s3.ap-northeast-1.amazonaws.com`, OAC `E1IJNX3IJT2ZYV`, SPA rewrites for `403` and `404`, and cache policy `658327ea-f89d-4fab-a63d-7e88639e58f6`.

AWS backend:

- DynamoDB tables `Cloud-Resume-Contact-Submissions` and `portfolio-views` both use `PAY_PER_REQUEST`, have TTL disabled, have PITR disabled, and have no secondary indexes.
- SQS queue `CloudResume-Contact-Email-Queue` has visibility timeout `30`, message retention `345600`, max message size `262144`, receive wait `0`, and SQS-managed SSE enabled.
- Lambda `CloudResumeEmailHandler` has event source mapping UUID `83d00468-0bb4-4e42-bcc9-6b851a177710` from the contact email queue, batch size `1`, enabled.
- Lambda invoke permissions exist for the contact API route and the three view counter routes.
- SES identity `jarrett6796@gmail.com` verification status is `Success`.

GCP RAG backend:

- Cloud Run service `gcp-rag-backend` latest ready revision is `gcp-rag-backend-00029-x6s`.
- The live Cloud Run image digest is `asia-east1-docker.pkg.dev/cloud-resume-ai-rag/cloud-run-source-deploy/gcp-rag-backend@sha256:3695901c3e67894b5a7a43c129e7f93f33216eb933d699f783c1963268822243`.
- Cloud Run runtime service account is `189047029621-compute@developer.gserviceaccount.com`.
- Cloud Run traffic is 100% latest revision, ingress is all, timeout is `300s`, concurrency is `80`, max scale is `3`, CPU is `1000m`, and memory is `512Mi`.
- Cloud Run IAM includes public invoker binding `roles/run.invoker` for `allUsers`.
- Live runtime env confirms `RAG_VECTOR_SEARCH_BACKEND=local`, current CORS allowlist, `INGEST_DOCUMENTS=CAPSTONE_PROJECT_STATE.md`, and `DIRECT_CONTEXT_DOCUMENTS=CAPSTONE_PROJECT_STATE.md`.

## Prepared Import Commands

AWS frontend:

```sh
terraform import aws_s3_bucket.frontend nkc-201-02-cloudresume-frontend
terraform import aws_s3_bucket_versioning.frontend nkc-201-02-cloudresume-frontend
terraform import aws_s3_bucket_public_access_block.frontend nkc-201-02-cloudresume-frontend
terraform import aws_s3_bucket_ownership_controls.frontend nkc-201-02-cloudresume-frontend
terraform import aws_s3_bucket_server_side_encryption_configuration.frontend nkc-201-02-cloudresume-frontend
terraform import aws_s3_bucket_policy.frontend nkc-201-02-cloudresume-frontend
terraform import aws_cloudfront_origin_access_control.frontend E1IJNX3IJT2ZYV
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
terraform import aws_lambda_event_source_mapping.email_queue 83d00468-0bb4-4e42-bcc9-6b851a177710
terraform import 'aws_lambda_permission.apigateway["contact_api_post_contact"]' CloudResumeContactHandler/51360466-057a-5ee4-9b2d-1705d6aefa5d
terraform import 'aws_lambda_permission.apigateway["viewcounter_api_get_views"]' portfolio-view-counter/0f0eb62a-8f29-53c6-9e68-19f200979b8b
terraform import 'aws_lambda_permission.apigateway["viewcounter_api_get_project"]' portfolio-view-counter/7ce2696f-070f-5fef-98ae-ca0e38af6405
terraform import 'aws_lambda_permission.apigateway["viewcounter_api_post_project_view"]' portfolio-view-counter/allow-apigateway-project-view-post
terraform import aws_apigatewayv2_api.viewcounter ajqu2ciscd
terraform import aws_apigatewayv2_api.contact fh0e0v86nk
terraform import aws_ses_email_identity.portfolio_contact_sender jarrett6796@gmail.com
```

Full route, stage, integration, policy, and attachment import commands are recorded in `terraform/aws/backend/import-notes.md`.

The AWS backend import commands may require a reviewed temporary var-file for unresolved import-only variables such as `lambda_package_files` and `dynamodb_billing_mode`.

GCP RAG backend:

```sh
terraform import google_cloud_run_v2_service.rag_backend projects/cloud-resume-ai-rag/locations/asia-east1/services/gcp-rag-backend
terraform import google_cloud_run_v2_service_iam_member.public_invoker "projects/cloud-resume-ai-rag/locations/asia-east1/services/gcp-rag-backend roles/run.invoker allUsers"
```

The Cloud Run container image is now recorded from live inventory, but imports should still be reviewed before any plan.

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

- Import into a reviewed local state before running any `terraform plan`.
- Review CloudFront WAF, ACM certificate, DNS alias, and invalidation workflow ownership boundaries.
- Review whether DynamoDB TTL/PITR disabled state should be explicitly modeled or left omitted.
- Provide exact Lambda package zip paths before any plan that may reconcile code.
- Decide whether GCP Artifact Registry, the source-deploy bucket, and the docs bucket should be referenced-only or Terraform-owned later.

## Safety Warnings

- Do not run `terraform apply`.
- Do not run `terraform destroy`.
- Do not run `terraform import` until explicitly approved.
- Do not run GitHub Actions deployment workflows.
