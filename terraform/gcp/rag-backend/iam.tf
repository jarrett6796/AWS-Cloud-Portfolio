resource "google_cloud_run_v2_service_iam_member" "public_invoker" {
  project  = var.project_id
  location = var.region
  name     = google_cloud_run_v2_service.rag_backend.name
  role     = "roles/run.invoker"
  member   = "allUsers"

  lifecycle {
    prevent_destroy = true
  }
}
