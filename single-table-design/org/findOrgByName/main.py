import boto3
from boto3.dynamodb.conditions import Key
import os
import json
from typing import Any, Dict
from shared.headers import get_headers
from aws_lambda_powertools import Tracer, Logger
from aws_lambda_powertools.logging import correlation_paths
from aws_lambda_powertools.utilities.typing import LambdaContext
from urllib.parse import unquote

# tracer = Tracer()
logger = Logger(service="get_org_by_name")
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.getenv("DB_TABLE"))


def get_item(org_name):
    """

    """
    response = table.query(
        IndexName='search-org-by-name',
        KeyConditionExpression=Key('GSI3PK').eq(
            f'ORGNAME#{org_name}') & Key('GSI3SK').begins_with("ORG")
    )
    return response


# @tracer.capture_lambda_handler
@logger.inject_lambda_context(
    correlation_id_path=correlation_paths.API_GATEWAY_REST
)
def handler(event: Dict[str, Any], context: LambdaContext):
    logger.info(event)
    org_name = unquote(event['pathParameters']["org_name"])
    if not org_name:
        logger.error("Validation Failed")
        raise Exception("Couldn't find the item.")

    response = {
        "statusCode": 200,
        "body": json.dumps(get_item(org_name)),
        "headers": get_headers()
    }
    logger.info(response)
    return response
