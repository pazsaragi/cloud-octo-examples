import boto3
import os
import json
from shared.headers import get_headers

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.getenv("DB_TABLE"))
pk = os.getenv('TABLE_PK')


def _update_item(org_pk, item):
    try:
        response = table.update_item(
            Key={f'org#{org_pk}'},
            AttributeUpdates={
                **item
            },
        )
        return {
            'pk': org_pk,
            **response,
        }
    except Exception as e:
        raise e


def _handle_input(body):
    """
    Converts SQS body into input
    """
    try:
        body = body.replace("\'", "\"")
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


def handler(event, context):
    print(event)
    try:
        payload = _handle_input(event["body"])
        db_response = json.dumps(_update_item(payload))
        response = {
            "headers": get_headers(),
            "statusCode": 200,
            "body": db_response
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": str(e)
        }

    print(response)
    return response
