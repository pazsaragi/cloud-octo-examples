import boto3
import os
import json
from shared.headers import get_headers


dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.getenv("DB_TABLE"))


def _create_item(item):
    try:
        PK = 'ORG#' + item["ref"]
        response = table.put_item(
            Item={
                'pk': PK,
                'sk': f"METADATA#{item['org_name']}",
                'EntityType': 'ORG',
                **item,
                "org_finished": False,
                "menu_created": False,
                "set_to_live": False,
                "picked_payment_plan": False,
                "tables_created": False,
                'GSI3PK': f'ORGNAME#{item["org_name"]}',
                'GSI3SK': 'ORG#' # postcode?
            }
        )
        return {
            'pk': PK,
            **response,
        }
    except Exception as e:
        print(e)
        raise e


def _handle_input(body):
    """
    Converts SQS body into input
    """
    try:
        data = json.loads(body)
    except Exception as e:
        print("Failed to load data as json ", e)
        try:
            data = body
        except Exception as e:
            print("No body in event payload ", e)
            raise e
    print(data)
    return data


def handle_event(eventBody):
    try:
        payload = _handle_input(eventBody)
        db_response = json.dumps(_create_item(payload))
        return {
            "headers": get_headers(),
            "statusCode": 200,
            "body": db_response,
            "isBase64Encoded": False
        }
    except Exception as e:
        print(e)
        raise e


def handler(event, context):
    print(event)
    responses = []
    try:
        if "Records" in event:
            for evnt in event["Records"]:
                responses.append(handle_event(
                    json.loads(evnt["body"])["Message"]))
            return responses
        else:
            return handle_event(event["body"])
    except Exception as e:
        return {
            "statusCode": 500,
            "body": str(e),
            "headers": get_headers(),
            "isBase64Encoded": False
        }
