variable "project_id" {
  description = "Existing GCP project for the RAG backend."
  type        = string
  default     = "cloud-resume-ai-rag"
}

variable "region" {
  description = "Existing Cloud Run service region."
  type        = string
  default     = "asia-east1"
}

variable "service_name" {
  description = "Existing Cloud Run service name to import."
  type        = string
  default     = "gcp-rag-backend"
}

variable "google_cloud_location" {
  description = "Vertex AI location used by the backend application."
  type        = string
  default     = "us-central1"
}

variable "docs_bucket" {
  description = "GCS bucket used for RAG source documents."
  type        = string
  default     = "cloud-resume-ai-rag-docs"
}

variable "cors_allowed_origins" {
  description = "Current production CORS allowlist for the Cloud Run backend."
  type        = string
  default     = "http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174,https://aws-cloudresume-gcprag-jarrett.cc,https://www.aws-cloudresume-gcprag-jarrett.cc,https://d338amzpyv3o5b.cloudfront.net"
}

variable "container_image" {
  description = "Current Cloud Run container image digest verified from read-only gcloud inventory."
  type        = string
  default     = "asia-east1-docker.pkg.dev/cloud-resume-ai-rag/cloud-run-source-deploy/gcp-rag-backend@sha256:3695901c3e67894b5a7a43c129e7f93f33216eb933d699f783c1963268822243"
}

variable "cloud_run_service_account" {
  description = "Current Cloud Run runtime service account verified from read-only gcloud inventory."
  type        = string
  default     = "189047029621-compute@developer.gserviceaccount.com"
}
