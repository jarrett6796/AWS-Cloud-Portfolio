resource "aws_sqs_queue" "contact_email" {
  name = "CloudResume-Contact-Email-Queue"

  lifecycle {
    prevent_destroy = true
    ignore_changes  = all
  }
}
