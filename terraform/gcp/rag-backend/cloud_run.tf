locals {
  cloud_run_env = {
    GOOGLE_CLOUD_PROJECT          = var.project_id
    GOOGLE_CLOUD_LOCATION         = var.google_cloud_location
    DOCS_BUCKET                   = var.docs_bucket
    CORS_ALLOWED_ORIGINS          = var.cors_allowed_origins
    INGEST_DOCUMENTS              = "CAPSTONE_PROJECT_STATE.md"
    DIRECT_CONTEXT_DOCUMENTS      = "CAPSTONE_PROJECT_STATE.md"
    RAG_RATE_LIMIT_REQUESTS       = "100"
    RAG_RATE_LIMIT_WINDOW_SECONDS = "60"
  }
}

resource "google_cloud_run_v2_service" "rag_backend" {
  name     = var.service_name
  location = var.region
  project  = var.project_id

  template {
    containers {
      # TODO_IMPORT_REQUIRED: populate from read-only
      # `gcloud run services describe` before running plan.
      image = var.container_image

      dynamic "env" {
        for_each = local.cloud_run_env
        content {
          name  = env.key
          value = env.value
        }
      }
    }
  }

  lifecycle {
    prevent_destroy = true
    ignore_changes  = all
  }
}
