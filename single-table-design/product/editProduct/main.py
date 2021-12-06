from typing import Dict
import boto3
import os
import json
from shared.headers import get_headers
from aws_lambda_powertools import Tracer, Logger
from aws_lambda_powertools.logging import correlation_paths


tracer = Tracer()
logger = Logger(service="add_product_to_section")
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.getenv("DB_TABLE"))
PK = os.getenv('TABLE_PK')


def _update_item(pk, sk, SectionName, product):
    """
        'pk': 'ORG#139580gjasdgh89ty2t',
        'sk': 'MENU#892508520',
        'MenuName': 'Breakfast',
        'IsActive': False,
        'Sections': [
        {
            'SectionName': 'Starters',
            'IsActive': False,
            'Products': [
            {
                'ProductName': 'Bread',
                'allergens': ["Fish", "Veggie"],
            }
            ...
            ]
        }
        ...
        ]
    """
    try:
        response = table.update_item(
            Key={
                'pk': pk,
                'sk': sk
            },
            UpdateExpression=f"SET Sections.{SectionName}.Products.{product['ProductId']} \
                 = :p",
            ExpressionAttributeValues={
                ":p": product,
            },
            ReturnValues="UPDATED_NEW"
        )
        return {
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
        db_response = json.dumps(_update_item(**payload))
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
