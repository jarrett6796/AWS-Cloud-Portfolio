resource "aws_ses_email_identity" "portfolio_contact_sender" {
  email = "jarrett6796@gmail.com"

  lifecycle {
    prevent_destroy = true
  }
}
