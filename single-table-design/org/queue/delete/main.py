import boto3
import logging
import os
import json

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.getenv("DB_TABLE"))


def delete_item(pk_id):
    response = table.delete_item(
       Key={
            'pk': pk_id
        }
    )
    return response


def handler(event, context):
    print(event)
    id = event['pathParameters']["id"]
    if not id:
        logging.error("Validation Failed")
        raise Exception("Couldn't find the item.")
    
    response = {
        "statusCode": 200,
        "body": json.dumps(delete_item(id)),
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        }
    }
    print(response)
    return response
