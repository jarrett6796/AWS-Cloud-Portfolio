import json
import os
import uuid
from datetime import datetime, timezone

import boto3

dynamodb = boto3.resource("dynamodb")
sqs = boto3.client("sqs")

TABLE_NAME = os.environ["CONTACT_TABLE_NAME"]
QUEUE_URL = os.environ["EMAIL_QUEUE_URL"]

table = dynamodb.Table(TABLE_NAME)


def response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "POST,OPTIONS",
        },
        "body": json.dumps(body),
    }


def lambda_handler(event, context):
    try:
        if event.get("requestContext", {}).get("http", {}).get("method") == "OPTIONS":
            return response(200, {"message": "OK"})

        body = json.loads(event.get("body") or "{}")

        name = body.get("name", "").strip()
        email = body.get("email", "").strip()
        subject = body.get("subject", "").strip()
        message = body.get("message", "").strip()

        if not name or not email or not subject or not message:
            return response(400, {"error": "All fields are required."})

        if len(message) > 5000:
            return response(400, {"error": "Message is too long."})

        submission_id = str(uuid.uuid4())
        created_at = datetime.now(timezone.utc).isoformat()

        item = {
            "submission_id": submission_id,
            "name": name,
            "email": email,
            "subject": subject,
            "message": message,
            "created_at": created_at,
            "status": "queued",
        }

        table.put_item(Item=item)

        sqs.send_message(
            QueueUrl=QUEUE_URL,
            MessageBody=json.dumps({
                "submission_id": submission_id,
                "name": name,
                "email": email,
                "subject": subject,
                "message": message,
                "created_at": created_at,
            }),
        )

        return response(200, {
            "message": "Contact submission received.",
            "submission_id": submission_id,
        })

    except Exception as e:
        print(f"ERROR: {str(e)}")
        return response(500, {"error": "Internal server error."})