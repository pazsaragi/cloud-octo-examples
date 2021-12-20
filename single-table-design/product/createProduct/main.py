from typing import Dict
import boto3
import os
import json
import uuid
from shared.headers import get_headers
from aws_lambda_powertools import Tracer, Logger
from aws_lambda_powertools.logging import correlation_paths




tracer = Tracer()
logger = Logger(service="create_product")
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.getenv("DB_TABLE"))
PK = os.getenv('TABLE_PK')


def _create_item(item):
    """
        'pk': 'PRODUCT#873958739ah9y7ghai876',
        'sk': 'PRODUCT#Bread',
        'ProductName': 'Bread',
        'allergens': ["Fish", "Veggie"],
        'GSI2PK': 'SECTION#agoia83939haivha#SECTION#Starters',
        'GSI2SK': 'PRODUCT#Bread',
    """
    try:
        primary_key = f"PRODUCT#{uuid.uuid4()}"
        sort_key = f"PRODUCT#{item['name']}"
        payload = {
            'pk': primary_key,
            'sk': sort_key,
            'EntityType': PK,
            'ProductName': item["name"],
            "Allergens": item["allergens"] if item["allergens"] else None,
            'GSI2PK': item["gsi2pk"],  # joins to the below
            'GSI2SK': sort_key,
        }
        response = table.put_item(
            Item=payload
        )
        return {
            **payload,
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
def handler(event, context):
    logger.info(event)
    try:
        payload = _handle_input(event["body"])
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
