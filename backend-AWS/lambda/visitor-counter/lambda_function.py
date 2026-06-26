import json
from decimal import Decimal

import boto3

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("portfolio-views")


def response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
        },
        "body": json.dumps(body),
    }


def to_int(value):
    if isinstance(value, Decimal):
        return int(value)
    return int(value)


def increment_counter(counter_id):
    result = table.update_item(
        Key={"id": counter_id},
        UpdateExpression="ADD #views :inc",
        ExpressionAttributeNames={
            "#views": "views",
        },
        ExpressionAttributeValues={
            ":inc": Decimal(1),
        },
        ReturnValues="UPDATED_NEW",
    )

    return to_int(result["Attributes"]["views"])


def get_counter(counter_id):
    result = table.get_item(Key={"id": counter_id})
    item = result.get("Item")

    if not item:
        return None

    return to_int(item.get("views", 0))


def lambda_handler(event, context):
    print("EVENT:", json.dumps(event))
    method = event.get("requestContext", {}).get("http", {}).get("method", "")
    raw_path = event.get("rawPath", "")
    path_params = event.get("pathParameters") or {}

    if method == "GET" and raw_path == "/views":
        views = increment_counter("website")
        return response(200, {"id": "website", "views": views})

    if method == "POST" and raw_path.endswith("/view"):
        project_id = path_params.get("projectId")

        if not project_id:
            return response(400, {"message": "Missing projectId"})

        views = increment_counter(project_id)
        return response(200, {"id": project_id, "views": views})

    if method == "GET" and raw_path.startswith("/projects/"):
        project_id = path_params.get("projectId")

        if not project_id:
            return response(400, {"message": "Missing projectId"})

        views = get_counter(project_id)

        if views is None:
            return response(404, {"message": "Project not found", "id": project_id})

        return response(200, {"id": project_id, "views": views})

    return response(404, {"message": "Route not found"})