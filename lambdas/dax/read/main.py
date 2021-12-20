import os
import boto3
import json

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.getenv("DB_TABLE"))

def handler():
    try:
        items = table.scan()
        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
            },
            "body": json.dumps(items)
        }
    except Exception as e:
        print(e)
