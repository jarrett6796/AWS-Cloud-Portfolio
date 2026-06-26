variable "gcp_project_id" {
  description = "Existing GCP project for the RAG backend."
  type        = string
  default     = "cloud-resume-ai-rag"
}

variable "cloud_run_region" {
  description = "Existing Cloud Run service region."
  type        = string
  default     = "asia-east1"
}

variable "vertex_ai_location" {
  description = "Vertex AI location used by the backend application."
  type        = string
  default     = "us-central1"
}

variable "cloud_run_service_name" {
  description = "Existing Cloud Run service name to import."
  type        = string
  default     = "gcp-rag-backend"
}
