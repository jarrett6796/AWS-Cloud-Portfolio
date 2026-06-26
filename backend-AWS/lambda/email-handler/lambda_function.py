import json
import os

import boto3

ses = boto3.client("ses")

FROM_EMAIL = os.environ["FROM_EMAIL"]
TO_EMAIL = os.environ["TO_EMAIL"]


def send_email(to_address, subject, body_text):
    ses.send_email(
        Source=FROM_EMAIL,
        Destination={
            "ToAddresses": [to_address]
        },
        Message={
            "Subject": {
                "Data": subject,
                "Charset": "UTF-8"
            },
            "Body": {
                "Text": {
                    "Data": body_text,
                    "Charset": "UTF-8"
                }
            }
        }
    )


def lambda_handler(event, context):
    for record in event.get("Records", []):
        message = json.loads(record["body"])

        name = message.get("name", "Unknown")
        email = message.get("email", "unknown@example.com")
        subject = message.get("subject", "No subject")
        contact_message = message.get("message", "")
        submission_id = message.get("submission_id", "unknown")
        created_at = message.get("created_at", "unknown")

        notification_subject = f"New Portfolio Contact: {subject}"
        notification_body = f"""
New contact submission received.

Submission ID: {submission_id}
Created At: {created_at}

Name: {name}
Email: {email}
Subject: {subject}

Message:
{contact_message}
"""

        send_email(
            TO_EMAIL,
            notification_subject,
            notification_body
        )

        auto_reply_subject = "Thanks for contacting Jarrett"
        auto_reply_body = f"""
Hi {name},

Thanks for reaching out through my portfolio website.

I have received your message and will reply as soon as possible.

Your message:
{contact_message}

Best regards,
Jarrett
"""

        # SES sandbox only allows sending to verified recipients.
        # For now, send auto-reply only when sender email is verified.
        # Later, after SES production access, this can send to any sender.
        if email == FROM_EMAIL:
            send_email(
                email,
                auto_reply_subject,
                auto_reply_body
            )

    return {
        "statusCode": 200,
        "body": json.dumps({"message": "Email job processed."})
    }