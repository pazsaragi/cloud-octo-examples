import boto3
import uuid
import os
import json
from shared.headers import get_headers
from pydantic.json import pydantic_encoder
from pydantic.dataclasses import dataclass
from typing import Optional
from enum import Enum


class Status(Enum):
    SANDBOX = 1
    LIVE = 2


@dataclass
class OrgInput:
    name: str
    email: str
    ref: str
    image: Optional[str]
    status: Status


queue_name = os.getenv("QUEUE_NAME")
client = boto3.resource("sqs")
queue = client.get_queue_by_name(QueueName=queue_name)


def _send_message(input: OrgInput):
    try:

        response = queue.send_message(
            MessageBody=json.dumps(input, default=pydantic_encoder),
            MessageGroupId=f'{uuid.uuid4()}'
        )
        return response
    except Exception as e:
        print(e)
        return None


def _handle_input(event):
    """
    Converts event into input
    """
    try:
        data = json.loads(event["body"])
    except Exception as e:
        print("Failed to load data as json ", e)
        try:
            data = event["body"]
        except Exception as e:
            print("No body in event payload ", e)
            raise e

    return OrgInput(
        name=data["name"],
        email=data["email"],
        ref=data["ref"],
        image=data["image"],
        status=data["status"],
    )


def handler(event, context):
    print(event["body"])
    # performs validation
    try:
        data: OrgInput = _handle_input(event)
    except Exception as e:
        print("Failed to load input", e)
        return {
            "statusCode": 400,
            "body": str(e)
        }

    try:
        sqs_response = json.dumps(_send_message(data))
    except Exception as e:
        print(e)
        return {
            "statusCode": 500,
            "body": str(e)
        }

    response = {
        "headers": get_headers(),
        "statusCode": 200,
        "response": sqs_response
    }

    print("Success", response)
    return response
