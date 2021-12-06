import boto3
from boto3.dynamodb.conditions import Key
import os
import json
from typing import Any, Dict
from shared.headers import get_headers
from aws_lambda_powertools import Tracer, Logger
from aws_lambda_powertools.logging import correlation_paths
from aws_lambda_powertools.utilities.typing import LambdaContext

# tracer = Tracer()
logger = Logger(service="get_products_by_section")
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.getenv("DB_TABLE"))
pk = os.getenv('TABLE_PK')


def get_item(gsi1pk):
    """
    'GSI2PK': 'SECTION#agoia83939haivha#SECTION#Starters',
    """
    response = table.query(
        IndexName='section-to-product-index',
        KeyConditionExpression=Key('GSI2PK')
        .eq(gsi1pk) & Key('GSI2SK')
        .begins_with('PRODUCT')
    )
    return response


# @tracer.capture_lambda_handler
@logger.inject_lambda_context(
    correlation_id_path=correlation_paths.API_GATEWAY_REST
)
def handler(event: Dict[str, Any], context: LambdaContext):
    logger.info(event)
    gsi1pk = event['pathParameters']["id"]
    section_sk = event['pathParameters']["section_sk"]
    if not section_sk or not gsi1pk:
        logger.error("Validation Failed")
        raise Exception("Couldn't find the item.")
    query_string = f"SECTION#{gsi1pk}#SECTION#{section_sk}"
    response = {
        "statusCode": 200,
        "body": json.dumps(get_item(query_string)),
        "headers": get_headers()
    }
    logger.info(response)
    return response
