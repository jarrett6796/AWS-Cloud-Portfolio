output "gcp_project_id" {
  description = "Existing GCP project targeted for import planning."
  value       = var.gcp_project_id
}

output "cloud_run_service_name" {
  description = "Existing Cloud Run service targeted for import planning."
  value       = var.cloud_run_service_name
}

output "cloud_run_region" {
  description = "Existing Cloud Run service region."
  value       = var.cloud_run_region
}
