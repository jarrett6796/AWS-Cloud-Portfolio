# GCP RAG Backend Import Notes

Known production references:

- GCP project: `cloud-resume-ai-rag`
- Cloud Run service: `gcp-rag-backend`
- Cloud Run region: `asia-east1`
- Cloud Run URL: `https://gcp-rag-backend-189047029621.asia-east1.run.app`
- Vertex AI location used by backend: `us-central1`

Current production CORS runtime allowlist should include:

- `http://localhost:5173`
- `http://localhost:5174`
- `http://127.0.0.1:5173`
- `http://127.0.0.1:5174`
- `https://aws-cloudresume-gcprag-jarrett.cc`
- `https://www.aws-cloudresume-gcprag-jarrett.cc`
- `https://d338amzpyv3o5b.cloudfront.net`

Do not update Cloud Run runtime configuration from Terraform until the live service configuration has been exported, reviewed, and imported.
