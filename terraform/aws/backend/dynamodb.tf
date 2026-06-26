resource "aws_dynamodb_table" "contact_submissions" {
  name         = "Cloud-Resume-Contact-Submissions"
  billing_mode = var.dynamodb_billing_mode
  hash_key     = "submission_id"

  attribute {
    name = "submission_id"
    type = "S"
  }

  lifecycle {
    prevent_destroy = true
    ignore_changes  = all
  }
}

resource "aws_dynamodb_table" "portfolio_views" {
  name         = "portfolio-views"
  billing_mode = var.dynamodb_billing_mode
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  lifecycle {
    prevent_destroy = true
    ignore_changes  = all
  }
}
