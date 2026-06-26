provider "google" {
  project = var.gcp_project_id
  region  = var.cloud_run_region
}
