locals {
  cloud_run_env = {
    CORS_ALLOWED_ORIGINS                 = var.cors_allowed_origins
    DIRECT_CONTEXT_DOCUMENTS             = "CAPSTONE_PROJECT_STATE.md"
    DOCS_BUCKET                          = var.docs_bucket
    GOOGLE_CLOUD_LOCATION                = var.google_cloud_location
    GOOGLE_CLOUD_PROJECT                 = var.project_id
    INGEST_DOCUMENTS                     = "CAPSTONE_PROJECT_STATE.md"
    RAG_FIRESTORE_VECTOR_FIELD           = "embedding"
    RAG_MULTI_QUERY_COUNT                = "3"
    RAG_MULTI_QUERY_ENABLED              = "false"
    RAG_MULTI_QUERY_MODEL                = "gemini-2.5-flash"
    RAG_PARENT_CHILD_ENABLED             = "true"
    RAG_PARENT_CONTEXT_FALLBACK_ENABLED  = "true"
    RAG_PARENT_CONTEXT_MAX_TOKENS        = "1200"
    RAG_QUERY_REWRITE_ENABLED            = "false"
    RAG_QUERY_REWRITE_HISTORY_LIMIT      = "6"
    RAG_QUERY_REWRITE_MODEL              = "gemini-2.5-flash"
    RAG_RATE_LIMIT_ENABLED               = "true"
    RAG_RATE_LIMIT_REQUESTS              = "100"
    RAG_RATE_LIMIT_WINDOW_SECONDS        = "60"
    RAG_SEMANTIC_RERANK_ENABLED          = "true"
    RAG_SEMANTIC_RERANK_FALLBACK_ENABLED = "true"
    RAG_SEMANTIC_RERANK_KEEP_K           = "5"
    RAG_SEMANTIC_RERANK_MODEL            = "gemini-2.5-flash"
    RAG_SEMANTIC_RERANK_TOP_N            = "10"
    RAG_VECTOR_SEARCH_BACKEND            = "local"
    RAG_VECTOR_SEARCH_DISTANCE_MEASURE   = "COSINE"
    RAG_VECTOR_SEARCH_FALLBACK_ENABLED   = "true"
    RAG_VECTOR_SEARCH_LIMIT              = "20"
  }
}

resource "google_cloud_run_v2_service" "rag_backend" {
  name     = var.service_name
  location = var.region
  project  = var.project_id
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    service_account                  = var.cloud_run_service_account
    timeout                          = "300s"
    max_instance_request_concurrency = 80

    scaling {
      max_instance_count = 3
    }

    containers {
      image = var.container_image

      ports {
        name           = "http1"
        container_port = 8080
      }

      dynamic "env" {
        for_each = local.cloud_run_env
        content {
          name  = env.key
          value = env.value
        }
      }

      resources {
        limits = {
          cpu    = "1000m"
          memory = "512Mi"
        }
      }

      startup_probe {
        failure_threshold = 1
        period_seconds    = 240
        timeout_seconds   = 240

        tcp_socket {
          port = 8080
        }
      }
    }
  }

  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }

  lifecycle {
    prevent_destroy = true
    ignore_changes  = all
  }
}
