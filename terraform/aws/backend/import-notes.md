# AWS Backend Import Notes

Completed AWS backend services currently include:

- API Gateway
- Lambda
- DynamoDB
- SQS
- SES
- Website View Counter
- Project View Counter
- Contact Form

This module now includes import-ready resource definitions for values that were confidently discovered from `backend-AWS/` exports.

Do not run apply or create new backend resources until imports and plans have been reviewed.

## Discovered From Repo Exports

| Resource type | Names or IDs |
| --- | --- |
| API Gateway HTTP APIs | `ajqu2ciscd` (`Viewcounter API`), `fh0e0v86nk` (`CloudResumeContactAPI`) |
| API Gateway stages | `$default` for both APIs |
| API Gateway integrations | `kgscnwd` for `portfolio-view-counter`, `g9ynj9l` for `CloudResumeContactHandler` |
| API Gateway routes | `GET /views`, `GET /projects/{projectId}`, `POST /projects/{projectId}/view`, `POST /contact` |
| Lambda functions | `CloudResumeContactHandler`, `CloudResumeEmailHandler`, `portfolio-view-counter` |
| IAM roles | `CloudResumeContactLambdaRole`, `CloudResumeEmailHandler-role-68yf25yo`, `portfolio-view-counter-role` |
| DynamoDB tables | `Cloud-Resume-Contact-Submissions`, `portfolio-views` |
| SQS queue | `CloudResume-Contact-Email-Queue` |
| SES email identity candidate | `jarrett6796@gmail.com` from deployed Lambda env |

## Prepared Import Commands

Prepared but not executed:

These commands may require a temporary reviewed var-file for unresolved variables such as `lambda_package_files` and `dynamodb_billing_mode`. Do not use guessed values.

```sh
terraform import aws_dynamodb_table.contact_submissions Cloud-Resume-Contact-Submissions
terraform import aws_dynamodb_table.portfolio_views portfolio-views
terraform import aws_sqs_queue.contact_email https://sqs.ap-northeast-1.amazonaws.com/001920499658/CloudResume-Contact-Email-Queue

terraform import 'aws_iam_role.lambda_roles["CloudResumeContactLambdaRole"]' CloudResumeContactLambdaRole
terraform import 'aws_iam_role.lambda_roles["CloudResumeEmailHandler-role-68yf25yo"]' CloudResumeEmailHandler-role-68yf25yo
terraform import 'aws_iam_role.lambda_roles["portfolio-view-counter-role"]' portfolio-view-counter-role
terraform import 'aws_iam_role_policy_attachment.managed["contact_basic_logs"]' CloudResumeContactLambdaRole/arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
terraform import 'aws_iam_role_policy_attachment.managed["email_basic_logs"]' CloudResumeEmailHandler-role-68yf25yo/arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
terraform import 'aws_iam_role_policy_attachment.managed["viewcounter_basic_logs"]' portfolio-view-counter-role/arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
terraform import 'aws_iam_role_policy_attachment.managed["viewcounter_dynamodb_full_access"]' portfolio-view-counter-role/arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess
terraform import aws_iam_role_policy.contact_write CloudResumeContactLambdaRole:CloudResume-ContactLambdaWritePolicy
terraform import aws_iam_role_policy.email_handler CloudResumeEmailHandler-role-68yf25yo:CloudResumeEmailLambdaPolicy

terraform import 'aws_lambda_function.backend["CloudResumeContactHandler"]' CloudResumeContactHandler
terraform import 'aws_lambda_function.backend["CloudResumeEmailHandler"]' CloudResumeEmailHandler
terraform import 'aws_lambda_function.backend["portfolio-view-counter"]' portfolio-view-counter

terraform import aws_apigatewayv2_api.viewcounter ajqu2ciscd
terraform import aws_apigatewayv2_api.contact fh0e0v86nk
terraform import 'aws_apigatewayv2_stage.default["viewcounter"]' ajqu2ciscd/$default
terraform import 'aws_apigatewayv2_stage.default["contact"]' fh0e0v86nk/$default
terraform import 'aws_apigatewayv2_integration.lambda["viewcounter"]' ajqu2ciscd/kgscnwd
terraform import 'aws_apigatewayv2_integration.lambda["contact"]' fh0e0v86nk/g9ynj9l
terraform import 'aws_apigatewayv2_route.routes["viewcounter_get_views"]' ajqu2ciscd/0evcx1c
terraform import 'aws_apigatewayv2_route.routes["viewcounter_get_project"]' ajqu2ciscd/bsbu0oo
terraform import 'aws_apigatewayv2_route.routes["viewcounter_post_project_view"]' ajqu2ciscd/t4jan9l
terraform import 'aws_apigatewayv2_route.routes["contact_post"]' fh0e0v86nk/0m4niwi

terraform import aws_ses_email_identity.portfolio_contact_sender jarrett6796@gmail.com
```

## TODO_IMPORT_REQUIRED

- Verify DynamoDB billing mode, TTL, streams, encryption, PITR, and any secondary indexes.
- Verify SQS queue attributes, redrive policy, encryption, visibility timeout, and message retention.
- Export Lambda event source mapping UUID for `CloudResumeEmailHandler` consuming `CloudResume-Contact-Email-Queue`.
- Confirm SES identity type and verification status before importing `aws_ses_email_identity`.
- Provide exact Lambda package zip paths in `var.lambda_package_files` before running any plan that may reconcile code.
- Provide verified `var.dynamodb_billing_mode` before importing or planning DynamoDB resources.
- Confirm API Gateway route/integration imports in a non-production state file before planning changes.
