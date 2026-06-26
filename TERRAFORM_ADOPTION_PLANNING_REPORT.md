# Terraform Adoption Planning Report

Date: 2026-06-13

## Scope

This report plans Terraform adoption for the existing AWS + GCP capstone portfolio. It does not add Terraform resources, run Terraform commands, deploy infrastructure, import state, or change application code.

Files reviewed before planning:

- `Statement_MD/CAPSTONE_PROJECT_STATE.md`
- `Statement_MD/GCP_RAG_PROJECT_STATE.md`
- `Statement_MD/GCP_RAG_DEVELOPMENT_LOG.md`
- `Statement_MD/CAPSTONE_V1_TEST_RECORD.md`
- `Statement_MD/REACT_Frontend_Development_Log.md`
- `FRONTEND_ENGINEERING_REPORT.md`
- `BACKEND_ENGINEERING_REPORT.md`
- `frontend-AWS/README.md`
- `.github/workflows/deploy-frontend.yml`
- `.github/workflows/deploy-backend-gcp.yml`
- `frontend-AWS/src/api/chat.js`
- `frontend-AWS/src/api/visitors.js`
- `frontend-AWS/.env.example`
- `backend-GCP/main.py`
- `backend-GCP/app/config/settings.py`
- `backend-GCP/Dockerfile`
- `frontend-AWS/package.json`

## 1. Current Architecture Review

### Current AWS Architecture

The AWS side is now a migration/rebuild workstream. The previous AWS account owned the public static frontend and visitor counter path, but that account is no longer available. Do not treat previous AWS resources as currently deployed in the new account until they are rebuilt and verified.

Previous resources and integration points:

- Static frontend deployment target: S3 bucket behind CloudFront.
- CDN and HTTPS: CloudFront distribution.
- Visitor counter API: API Gateway endpoint `https://9u8ml80foj.execute-api.ap-northeast-1.amazonaws.com/views`.
- Visitor counter compute/data path: API Gateway -> Lambda -> DynamoDB.
- Frontend deployment workflow:
  - runs on pushes to `main`;
  - builds `frontend-AWS`;
  - writes `.env` with `VITE_GCP_RAG_API_URL`;
  - syncs `dist/` to the S3 bucket from GitHub secret `S3_BUCKET`;
      - invalidates the CloudFront distribution from GitHub secret `CLOUDFRONT_DISTRIBUTION_ID`.

The AWS visitor endpoint is currently hard-coded in `frontend-AWS/src/api/visitors.js`, but that endpoint belongs to the previous AWS account evidence. After the new AWS account rebuild creates a new API endpoint, Terraform should expose the API URL as an output and the frontend build should consume it from environment configuration.

New AWS account rebuild scope:

- S3
- CloudFront
- API Gateway
- Lambda
- DynamoDB
- SNS
- EventBridge
- IAM roles and policies
- CI/CD deployment integration

### Current GCP Architecture

The GCP side owns the AI/RAG backend.

Verified resources and integration points:

- Cloud Run service in `asia-east1`.
- Current backend base URL: `https://gcp-rag-backend-189047029621.asia-east1.run.app`.
- Cloud Storage document bucket: `cloud-resume-ai-rag-docs`.
- Firestore collections:
  - `document_chunks`
  - `conversations/{session_id}/messages/{message_id}`
- Vertex AI generation model: `gemini-2.5-flash`.
- Vertex AI embedding model: `text-embedding-005`.
- Backend runtime: Python 3.11, FastAPI, Uvicorn, Docker, Cloud Run.
- Backend entrypoint: `backend-GCP/main.py` with `main:app`.
- Backend configuration source: `backend-GCP/app/config/settings.py`.

The backend supports:

- `GET /`
- `GET /healthz`
- `POST /chat`
- `POST /chat-with-docs`
- `POST /ingest-docs`
- `POST /ask-rag`
- `POST /ask-rag-stream`

`POST /ingest-docs` is admin-token protected through `INGESTION_ADMIN_TOKEN` and `X-Admin-Token`. Public assistant routes remain unauthenticated.

### Frontend and Backend Integration Flow

The current user-facing flow is:

```text
Browser
  -> CloudFront
  -> S3 static React/Vite assets
  -> AWS API Gateway visitor counter
  -> Lambda
  -> DynamoDB

Browser
  -> CloudFront
  -> React AI assistant
  -> POST /ask-rag-stream
  -> Cloud Run FastAPI
  -> Firestore conversation history
  -> Firestore document_chunks retrieval
  -> Vertex AI embeddings + Gemini response generation
  -> streamed answer and source metadata
```

The frontend uses `POST /ask-rag-stream` first and falls back to `POST /ask-rag`. The current CloudFront origin `https://dvzu3s2gq6iw.cloudfront.net` is present in backend CORS defaults and the backend deployment workflow.

### Existing Deployed Resources

Confirmed from project files and documentation:

- Previous AWS S3 frontend bucket, name stored in GitHub secret `S3_BUCKET`.
- Previous AWS CloudFront distribution, ID stored in GitHub secret `CLOUDFRONT_DISTRIBUTION_ID`.
- Previous AWS API Gateway visitor counter endpoint.
- Previous AWS Lambda visitor counter function.
- Previous AWS DynamoDB visitor counter table.
- GCP Cloud Run service, name stored in GitHub secret `GCP_SERVICE_NAME`.
- GCP Artifact Registry image path under `${GCP_REGION}-docker.pkg.dev/${GCP_PROJECT_ID}/cloud-run-source-deploy/${GCP_SERVICE_NAME}`.
- GCP Firestore database with `document_chunks` and `conversations`.
- GCP Cloud Storage bucket `cloud-resume-ai-rag-docs`.
- GCP service account used by GitHub Actions Workload Identity Federation.
- Vertex AI API usage for Gemini and embeddings.

Resource names for several previous AWS resources and some GCP IAM details are still secret-backed or implicit. Terraform planning should collect exact new-account AWS identifiers before rebuild work and exact GCP identifiers before any import work.

### Current Deployment Process

Frontend deployment is automated through `.github/workflows/deploy-frontend.yml`:

- trigger: push to `main`;
- install dependencies with `npm ci`;
- build with `npm run build`;
- configure AWS credentials from repository secrets;
- sync built files to S3;
- invalidate CloudFront.

Backend deployment is automated through `.github/workflows/deploy-backend-gcp.yml`:

- trigger: push to `main` affecting `backend-GCP/**` or the backend workflow;
- authenticate to GCP through Workload Identity Federation;
- build Docker image from `backend-GCP`;
- push image to Artifact Registry;
- deploy to Cloud Run with `gcloud run deploy`;
- set selected runtime env vars;
- allow unauthenticated Cloud Run access.

The deployment workflows exist and are useful, but they currently deploy application artifacts and selected service configuration directly. Terraform should not immediately replace these workflows. The safer path is to add Terraform validation and planning first, then move ownership of stable infrastructure over time.

### Current CI/CD Status

Existing CI/CD is deployment-oriented rather than infrastructure-governance-oriented.

Current coverage:

- frontend build and deploy to AWS;
- backend image build, push, and Cloud Run deploy to GCP;
- backend Workload Identity Federation already used for GitHub Actions authentication.

Missing for Terraform adoption:

- `terraform fmt -check`
- `terraform validate`
- `terraform plan`
- protected/manual approval before `terraform apply`
- environment-specific plans
- drift detection
- policy around imports and state changes

### Known Risks and Technical Debt

- Previous AWS production resources were created in an account that is no longer available, so AWS Terraform must start with discovery of the new account and rebuild planning rather than old-resource imports.
- Existing GCP resources were created manually or by provider CLIs/workflows, so GCP Terraform can still use discovery and imports rather than replacement where verified.
- The frontend API URL and visitor API URL are hard-coded or build-time configured in different places. Terraform outputs should eventually become the source for those values.
- The frontend README is still the default Vite template and does not describe deployment or infrastructure.
- Documentation still contains some stale `frontend-Vite` references while the actual app folder is `frontend-AWS`.
- Backend default document names in `settings.py` still include older `PROJECT_STATE.md` and `Frontend_Development_Log.md` defaults, while current docs are in `Statement_MD/` and current ingestion deployment appears to override this with environment values.
- Cloud Run env vars are partly managed in GitHub Actions. Terraform should not take over Cloud Run until env var ownership is clearly mapped.
- Firestore retrieval currently scans chunks in memory. This is an application architecture limitation, not a Terraform blocker.
- Secrets are currently GitHub Actions secrets. Terraform must not store secret values in `.tfvars` or state.

### Stable Infrastructure Parts

Good early Terraform candidates after discovery:

- New-account S3 static website/frontend bucket configuration.
- New-account CloudFront distribution configuration.
- CloudFront cache invalidation remains an application deployment concern, not Terraform.
- New-account API Gateway, Lambda, DynamoDB, SNS, EventBridge, and IAM roles/policies after module design.
- GCP Cloud Storage document bucket.
- GCP service accounts and IAM bindings.
- Cloud Run service definition after import and env-var ownership review.
- Artifact Registry repository if it already exists and can be imported cleanly.
- Firestore database/collection-level planning where supported, but not application documents.

### Parts That Should Not Be Migrated Yet

Do not migrate these in the first Terraform phase:

- Firestore application documents in `document_chunks` or `conversations`.
- RAG ingestion data and embeddings.
- Live Cloud Run service replacement.
- Old-account S3/CloudFront/Lambda/API/DynamoDB imports.
- New-account production AWS apply before module review, sandbox validation, and behavior testing.
- GitHub Actions secrets.
- Gemini model selection as a Terraform-managed "resource"; keep it as app configuration.

## 2. Terraform Adoption Plan

### Phase 0 - Discovery and Safety

Goal: build an accurate resource inventory and avoid accidental production changes.

Actions:

- Record exact new-account AWS target resources and required names:
  - S3 bucket name
  - CloudFront distribution ID
  - API Gateway REST or HTTP API ID/stage
  - Lambda function name/runtime/env vars
  - DynamoDB table name/key schema/billing mode
  - SNS topics/subscriptions
  - EventBridge buses/rules/targets
  - IAM roles and policies used by Lambda and deploy workflows
  - Route53/ACM resources if any exist
- Record exact GCP resources:
  - project ID
  - region
  - Cloud Run service name
  - Cloud Run runtime service account
  - Artifact Registry repository
  - GCS document bucket
  - Firestore database mode/location
  - Workload Identity Federation pool/provider
  - GitHub deployment service account and IAM bindings
  - enabled APIs
- Export current GCP resource configs with gcloud before imports.
- Use AWS CLI against the new account to confirm what exists before rebuild; do not rely on old-account identifiers.
- Decide GCP import candidates, AWS rebuild candidates, and "manual for now" resources.
- Add a Terraform safety rule: no production `apply` until imported state is reviewed and `plan` shows no destructive changes.

Deliverable:

- `Statement_MD/TERRAFORM_RESOURCE_INVENTORY.md`
- no Terraform state yet, unless created in an isolated sandbox.

### Phase 1 - Terraform Repository Initialization

Goal: establish structure and validation without managing production resources yet.

Actions:

- Add a `terraform/` folder.
- Add provider constraints for AWS and Google.
- Add shared provider configuration.
- Add environment folders for `dev` and `prod`.
- Add module folders with placeholder READMEs only at first.
- Add `.gitignore` rules for Terraform local files.
- Add root Terraform README explaining safety rules and import-first policy.
- Add example variable files only. Do not commit real project IDs, secrets, state files, or credentials.

Production impact:

- None. This phase should not create, update, import, or destroy live resources.

### Phase 2 - Sandbox Infrastructure

Goal: prove provider authentication and Terraform workflow against disposable resources.

Actions:

- Create a small dev-only AWS test bucket with a unique sandbox name.
- Create a small dev-only GCP test bucket with a unique sandbox name.
- Run `terraform init`, `fmt`, `validate`, `plan`, `apply`, and `destroy` only in `dev`.
- Confirm no prod provider variables are accidentally used.
- Confirm GitHub Actions can run Terraform `plan` without broad credentials.

Production impact:

- None, if separate names/projects/prefixes are used.

### Phase 3 - AWS Infrastructure Module Design

Goal: model AWS resources safely for the new AWS account rebuild.

Planned modules:

- `aws-s3-frontend`
  - frontend bucket
  - public access block
  - bucket policy for CloudFront access
  - optional static website settings if still needed
  - ownership controls/encryption/versioning as appropriate
- `aws-cloudfront`
  - distribution
  - origins
  - cache behaviors
  - default root object
  - error responses for SPA routing
  - origin access control or legacy OAI, matching current setup
- `aws-visitor-counter`
  - API Gateway
  - Lambda
  - DynamoDB table
  - Lambda IAM role/policy
  - CloudWatch log group
- `aws-event-notifications`
  - EventBridge rules
  - SNS topics and subscriptions
  - Lambda notification handlers
  - DynamoDB event state table if needed
- `aws-iam-deployment`
  - GitHub Actions deployment role
  - least-privilege policies for S3 sync, CloudFront invalidation, Lambda/API deployment, EventBridge/SNS, and DynamoDB access
- optional later modules:
  - `aws-route53`
  - `aws-acm`

Do not let Terraform manage CloudFront invalidations. Keep invalidation in the deployment workflow.

### Phase 4 - GCP Infrastructure Module Design

Goal: model GCP platform resources while keeping app image deployment workflow stable.

Planned modules:

- `gcp-cloud-run`
  - Cloud Run service
  - runtime service account
  - unauthenticated invoker policy if intentionally public
  - non-secret environment variables
  - resource limits and ingress policy
- `gcp-storage`
  - document bucket
  - lifecycle rules if needed
  - uniform bucket-level access
- `gcp-firestore`
  - Firestore database location/mode where Terraform support matches existing state
  - no application documents
- `gcp-service-account`
  - runtime service account
  - deploy service account
  - Workload Identity Federation bindings if imported later
- `gcp-vertex-ai-iam`
  - IAM required for Vertex AI prediction/embedding access
- optional:
  - `gcp-artifact-registry`
  - repository for Cloud Run images

For Cloud Run, decide whether Terraform or GitHub Actions owns runtime env vars. A common compromise is:

- Terraform owns stable infrastructure settings, service account, IAM, ingress, and non-secret env vars.
- GitHub Actions owns image revisions and deployment.
- Secret values remain in Secret Manager or GitHub Secrets, not in Terraform variables.

### Phase 5 - Existing Resource Import and Rebuild Strategy

Goal: bring stable manually-created GCP resources under Terraform without replacement and rebuild AWS resources safely in the new account.

GCP import order:

1. Read-only discovery data sources where possible.
2. GCP storage bucket and IAM.
3. GCP service accounts and IAM bindings.
4. Artifact Registry repository.
5. Cloud Run service only after env vars, image behavior, ingress, and service account are fully modeled.

AWS rebuild order:

1. Remote state infrastructure, if using AWS S3/DynamoDB backend.
2. IAM deployment role and least-privilege policies.
3. S3 frontend bucket and bucket policy.
4. CloudFront distribution.
5. DynamoDB visitor counter table.
6. Visitor counter Lambda IAM role/policies.
7. Visitor counter Lambda and API Gateway.
8. SNS topics/subscriptions.
9. EventBridge rules and targets.
10. Notification Lambda and event-state DynamoDB resources.

Resources to import:

- GCS document bucket.
- Cloud Run service.
- Artifact Registry repository.
- GCP service accounts and IAM bindings.

Resources to create in new AWS account after sandbox validation:

- S3 frontend bucket.
- CloudFront distribution.
- DynamoDB visitor counter table.
- Lambda function and IAM role/policies.
- API Gateway resources/stage.
- SNS/EventBridge notification resources.

Resources to recreate only in sandbox first:

- disposable S3/GCS buckets;
- disposable Cloud Run service;
- disposable DynamoDB table;
- test Lambda/API path;
- test SNS/EventBridge path.

Resources to leave manual for now:

- Firestore application documents;
- RAG embeddings and chunks;
- GitHub Actions secrets;
- current production Cloud Run image rollouts;
- CloudFront invalidation operations;
- admin ingestion runs.

State validation steps after each import or rebuild phase:

- run `terraform state show`;
- compare imported attributes against CLI-exported resource config;
- run `terraform plan`;
- require zero deletes and zero replacements before moving to the next resource;
- if Terraform wants to mutate a live resource unexpectedly, stop and adjust configuration/import mapping.

### Phase 6 - Remote State Strategy

Recommended backend: AWS S3 remote state with DynamoDB locking.

Reasoning:

- AWS is already a core part of the project.
- The frontend deployment already uses AWS credentials and an S3/CloudFront operational path.
- S3 + DynamoDB is a mature Terraform backend pattern.
- It gives explicit state locking, which is important once both AWS and GCP resources are managed from one codebase.

Recommended layout:

```text
s3://<terraform-state-bucket>/nkc-02/dev/terraform.tfstate
s3://<terraform-state-bucket>/nkc-02/prod/terraform.tfstate
```

Create the remote state bucket and lock table carefully. Because Terraform cannot use a backend before it exists, bootstrap options are:

1. Create the state bucket and lock table manually once, then document them.
2. Create them with a temporary local-state bootstrap configuration, then migrate state to S3.

For this project, option 1 is simpler and safer because the first priority is not full automation; it is avoiding production damage.

GCP Cloud Storage backend is also viable, but S3 + DynamoDB is the better fit here because the project already uses AWS for the frontend and visitor-counter side, and DynamoDB locking is explicit.

### Phase 7 - CI/CD Integration

Add Terraform CI before Terraform CD.

Recommended GitHub Actions flow:

- On pull requests:
  - `terraform fmt -check`
  - `terraform init -backend=false` for static validation
  - `terraform validate`
  - `terraform plan` for `dev`
  - optional `terraform plan` for `prod` only when relevant paths change
- On pushes to `main`:
  - keep existing app deploy workflows
  - publish Terraform plan artifact
  - do not auto-apply production changes
- Manual workflow dispatch:
  - environment selection: `dev` or `prod`
  - run plan
  - require GitHub Environment approval before apply
  - apply only from protected branch

Authentication:

- AWS: prefer GitHub OIDC with an AWS IAM role instead of long-lived access keys.
- GCP: keep Workload Identity Federation; it already exists in the backend deployment workflow.

Do not combine application deploy and Terraform apply in the same job at first. App deployments are frequent; infrastructure changes should be less frequent and reviewed separately.

### Phase 8 - Refactor Recommendations

These refactors are recommended before or during Terraform adoption. They do not block Phase 0 or Phase 1.

1. Replace default frontend README content.
   - Why: the README currently describes the Vite template, not this deployed AWS/GCP project.
   - Blocks Terraform: no.
   - Recommended timing: before sharing Terraform work publicly.

2. Normalize docs and folder naming references.
   - Why: current docs still include some `frontend-Vite` references while the actual app folder is `frontend-AWS`.
   - Blocks Terraform: no, but it can confuse import and deployment documentation.
   - Recommended timing: before writing Terraform README/import docs.

3. Move frontend visitor API URL to env configuration.
   - Why: `frontend-AWS/src/api/visitors.js` hard-codes the API Gateway URL.
   - Blocks Terraform: no.
   - Recommended timing: before Terraform outputs become deployment inputs.

4. Keep Cloud Run backend base URL environment-driven.
   - Why: `frontend-AWS/src/api/chat.js` has a default Cloud Run URL and the workflow writes `VITE_GCP_RAG_API_URL`.
   - Blocks Terraform: no.
   - Recommended timing: when Terraform starts outputting Cloud Run URL or custom domain.

5. Decide Cloud Run ownership boundary.
   - Why: GitHub Actions currently deploys images and sets env vars. Terraform managing the same env vars can create drift.
   - Blocks Terraform: blocks Cloud Run import/apply, not Terraform initialization.
   - Recommended timing: before importing Cloud Run.

6. Move secret-backed runtime values to Secret Manager if Terraform will manage Cloud Run deeply.
   - Why: Terraform state can expose secret values if secrets are handled as plain env vars.
   - Blocks Terraform: no for early phases; yes for mature production management.
   - Recommended timing: before production Cloud Run Terraform ownership.

7. Document exact resource names and IDs.
   - Why: multiple important names are currently known only through GitHub secrets or deployment history.
   - Blocks Terraform: yes for imports.
   - Recommended timing: Phase 0.

## 3. Recommended Modular Terraform Structure

Recommended initial structure:

```text
terraform/
├── README.md
├── .gitignore
├── environments/
│   ├── dev/
│   │   ├── backend.tf
│   │   ├── main.tf
│   │   ├── providers.tf
│   │   ├── variables.tf
│   │   ├── terraform.tfvars.example
│   │   └── outputs.tf
│   └── prod/
│       ├── backend.tf
│       ├── main.tf
│       ├── providers.tf
│       ├── variables.tf
│       ├── terraform.tfvars.example
│       └── outputs.tf
├── modules/
│   ├── aws-s3-frontend/
│   │   ├── README.md
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── aws-cloudfront/
│   │   ├── README.md
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── aws-visitor-counter/
│   │   ├── README.md
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── aws-event-notifications/
│   │   ├── README.md
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── aws-iam-deployment/
│   │   ├── README.md
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── gcp-cloud-run/
│   │   ├── README.md
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── gcp-storage/
│   │   ├── README.md
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── gcp-firestore/
│   │   ├── README.md
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── gcp-service-account/
│   │   ├── README.md
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── gcp-vertex-ai-iam/
│   │   ├── README.md
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── gcp-artifact-registry/
│       ├── README.md
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
└── docs/
    ├── import-plan.md
    ├── resource-inventory.md
    └── state-strategy.md
```

Why this structure:

- `environments/dev` and `environments/prod` keep state isolated.
- Modules stay provider/resource focused and map cleanly to the current AWS/GCP architecture.
- `docs/` keeps import decisions close to Terraform code without mixing them into current project-state markdown.
- Root-level shared provider files are avoided because provider aliases, backend config, and environment variables are usually clearer when each environment owns its own provider configuration.
- A separate `shared/` folder is not necessary at the start. If repeated locals or naming conventions become large, add `terraform/shared/` later.

## 4. Import Strategy Summary

Use import only after the module configuration is written to match the existing live resource. The expected import approach is:

1. Write module for one resource family.
2. Fill variables from discovery inventory.
3. Run `terraform import`.
4. Run `terraform plan`.
5. Fix config until plan is no-op or only contains intentionally accepted changes.
6. Commit after each stable resource family.

Start with lower-risk GCP imports and AWS rebuild resources:

- GCS document bucket.
- GCP service accounts/IAM.
- New-account S3 frontend bucket.
- New-account DynamoDB visitor counter table.

Delay higher-risk work:

- CloudFront distribution rebuild.
- Cloud Run service.
- API Gateway/Lambda visitor counter stack.
- SNS/EventBridge notification stack.

Never import Firestore application documents or RAG embeddings.

## 5. Remote State Recommendation

Use AWS S3 for Terraform state and DynamoDB for locking:

```text
backend "s3" {
  bucket         = "<nkc-02-terraform-state-bucket>"
  key            = "nkc-02/prod/terraform.tfstate"
  region         = "<aws-region>"
  dynamodb_table = "<nkc-02-terraform-locks>"
  encrypt        = true
}
```

Use a separate key for each environment. Do not use local state for production after imports begin.

## 6. CI/CD Recommendation

Add a new Terraform workflow instead of changing the current frontend/backend deploy workflows first.

Recommended jobs:

- `terraform-check`
  - runs on PR;
  - runs `fmt`, `init`, `validate`;
  - does not need production credentials if using `init -backend=false`.
- `terraform-plan-dev`
  - runs on PR when `terraform/**` changes;
  - uses dev credentials;
  - uploads plan artifact.
- `terraform-plan-prod`
  - runs on PR or manual dispatch;
  - uses read/plan credentials;
  - never applies automatically.
- `terraform-apply`
  - manual dispatch only;
  - requires GitHub Environment approval;
  - applies one environment at a time.

Keep existing app deploy workflows separate until Terraform ownership boundaries are stable.

## 7. Refactor and Cleanup Recommendations

Priority order:

1. Create `Statement_MD/TERRAFORM_RESOURCE_INVENTORY.md` from new-account AWS CLI output and current GCP CLI output.
2. Replace `frontend-AWS/README.md` with a project-specific README.
3. Normalize `frontend-Vite` references to `frontend-AWS` in docs where they are current-state references.
4. Move visitor counter API URL into `VITE_VISITOR_COUNT_URL`.
5. Decide whether Cloud Run env vars are owned by Terraform, GitHub Actions, or split by secret/non-secret type.
6. Add Terraform structure with README and placeholder modules.
7. Add Terraform validation workflow.
8. Only then start sandbox resources or imports.

## 8. Next Concrete Action

The next concrete action should be Phase 0 inventory, not Terraform code generation.

Recommended next task:

```text
Create Statement_MD/TERRAFORM_RESOURCE_INVENTORY.md by collecting exact new-account AWS targets, current GCP resource IDs, regions, service accounts, IAM roles, deployment secrets, AWS rebuild candidates, and GCP import candidates. Do not import or apply anything yet.
```

Suggested evidence to collect:

- `aws s3api get-bucket-location`
- `aws s3api get-bucket-policy`
- `aws cloudfront get-distribution`
- `aws apigateway get-rest-apis` or `aws apigatewayv2 get-apis`
- `aws lambda get-function`
- `aws dynamodb describe-table`
- `gcloud run services describe`
- `gcloud artifacts repositories describe`
- `gcloud storage buckets describe`
- `gcloud iam service-accounts list`
- `gcloud projects get-iam-policy`
- Firestore database location/mode from GCP console or CLI

Do not run these commands until the target AWS profile, GCP project, and allowed read-only scope are confirmed.
