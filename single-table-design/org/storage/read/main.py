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
logger = Logger(service="get_org_by_id")
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.getenv("DB_TABLE"))
pk = os.getenv('TABLE_PK')


def get_item(pk_id):
    """

    """
    response = table.query(
        KeyConditionExpression=Key('pk').eq(
            f'ORG#{pk_id}') & Key('sk').begins_with("METADATA")
    )
    return response


# @tracer.capture_lambda_handler
@logger.inject_lambda_context(
    correlation_id_path=correlation_paths.API_GATEWAY_REST
)
def handler(event: Dict[str, Any], context: LambdaContext):
    logger.info(event)
    id = event['pathParameters']["id"]
    if not id:
        logger.error("Validation Failed")
        raise Exception("Couldn't find the item.")

    response = {
        "statusCode": 200,
        "body": json.dumps(get_item(id)),
        "headers": get_headers()
    }
    logger.info(response)
    return response
