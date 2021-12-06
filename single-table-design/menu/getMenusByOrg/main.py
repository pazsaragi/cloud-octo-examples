import boto3
from boto3.dynamodb.conditions import Key
import os
import json
from typing import Any, Dict
from shared.headers import get_headers
from shared.transforms import transform_menu_response
from aws_lambda_powertools import Tracer, Logger
from aws_lambda_powertools.logging import correlation_paths
from aws_lambda_powertools.utilities.typing import LambdaContext

# tracer = Tracer()
logger = Logger(service="get_menus_by_org")
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.getenv("DB_TABLE"))
pk = os.getenv('TABLE_PK')


def query_db(org_pk):
    """

    """
    try:
        response = table.query(
            KeyConditionExpression=Key('pk').eq(
                "ORG#"+org_pk) & Key('sk').begins_with("MENU")
        )
        return transform_menu_response(response)
    except Exception as e:
        print(e)

# @tracer.capture_lambda_handler
@logger.inject_lambda_context(
    correlation_id_path=correlation_paths.API_GATEWAY_REST
)
def handler(event: Dict[str, Any], context: LambdaContext):
    logger.info(event)
    org_pk = event['pathParameters']["id"]
    if not org_pk:
        logger.error("Validation Failed")
        raise Exception("Couldn't find the item.")

    response = {
        "statusCode": 200,
        "body": json.dumps(query_db(org_pk)),
        "headers": get_headers()
    }
    logger.info(response)
    return response
