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
  description = "TODO_IMPORT_REQUIRED: current Cloud Run container image from read-only gcloud describe before planning changes."
  type        = string
}
