output "project_id" {
  description = "Existing GCP project targeted for import planning."
  value       = var.project_id
}

output "service_name" {
  description = "Existing Cloud Run service targeted for import planning."
  value       = var.service_name
}

output "region" {
  description = "Existing Cloud Run service region."
  value       = var.region
}

output "cloud_run_url" {
  description = "Known production Cloud Run URL from project documentation."
  value       = "https://gcp-rag-backend-189047029621.asia-east1.run.app"
}
