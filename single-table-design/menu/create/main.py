from typing import Any, Dict
import boto3
import os
import json
import uuid
from shared.headers import get_headers
from aws_lambda_powertools import Tracer, Logger
from aws_lambda_powertools.logging import correlation_paths
from aws_lambda_powertools.utilities.typing import LambdaContext


# tracer = Tracer()
logger = Logger(service="create_menu")
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.getenv("DB_TABLE"))
PK = os.getenv('TABLE_PK')


def _create_item(item):
    """
        'pk': 'ORG#139580gjasdgh89ty2t',
        'sk': 'MENU#Breakfast',
        'MenuName': 'Breakfast',
        'IsActive': False,
        # rest of attributes ...
        'GSI1PK': 'ORG#139580gjasdgh89ty2t#MENU#Breakfast',
        'GSI1SK': 'MENU#Breakfast',
    """
    try:
        SK = f'MENU#{uuid.uuid4()}'
        item = {
            'pk': f'ORG#{item["org_pk"]}',
            'sk': SK,
            'EntityType': PK,
            'name': item["name"],
            'is_active': item["is_active"],
            'GSI1PK': f'ORG#{item["org_pk"]}#{SK}',
            'GSI1SK': SK,
        }
        response = table.put_item(
            Item=item
        )
        return {
            **item,
            **response,
        }
    except Exception as e:
        raise e


def _handle_input(body) -> Dict:
    """
    Converts event into input
    """
    try:
        data = json.loads(body)
    except Exception as e:
        print("Failed to load data as json ", e)
        data = body
        if data is None:
            raise Exception("Input is empty.")

    return data


# @tracer.capture_lambda_handler
@logger.inject_lambda_context(
    correlation_id_path=correlation_paths.API_GATEWAY_REST
)
# @validator(inbound_schema=schemas.INPUT)
def handler(event: Dict[str, Any], context: LambdaContext):
    logger.info("EVENT", event)
    print(event)
    try:
        payload = _handle_input(event["body"])
        logger.info("PAYLOAD", payload)
        db_response = json.dumps(_create_item(payload))
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
    logger.info(response)
    return response
