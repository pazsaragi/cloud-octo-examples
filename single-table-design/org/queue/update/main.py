import boto3
import logging
import os
import json


dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.getenv("DB_TABLE"))


def update_item(id: str, item: str):
    try:
        response = table.put_item(
           Item={
                'pk': id,
                'sk': id,
                'EntityType': 'data',
                'Item': item,
            }
        )
        return response
    except Exception as e:
        raise e


def handler(event, context):
    print(json.loads(event["body"]))
    data = json.loads(event["body"])
    id = event['pathParameters']["id"]
    
    if 'name' not in data:
        logging.error("Validation Failed")
        return {
            "statusCode": 400,
            "body": {
                "message": "Couldn't create the item"
            },
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            }
        }
        
    response = {
        "statusCode": 204,
        "body": json.dumps(update_item(id, data['name'])),
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        }
    }
    print(response)
    return response
