import os
import uuid
import json
import boto3

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.getenv("DB_TABLE"))

def handler():
    try:
        table.put_item(Item={
            'pk': f"{uuid.uuid4()}",
            'sk': f"{uuid.uuid4()}",
        })
        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
            },
            "body": json.dumps({"message": "Success"})
        }
    except Exception as e:
        print(e)
