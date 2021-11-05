import boto3
import os
from base_database import BaseDatabase

table_name = os.getenv("DYNAMO_TABLE_NAME", "query")


class DynamoDB(BaseDatabase):
    def __init__(self) -> None:
        super().__init__()
        self._dynamodb = boto3.resource("dynamodb")
        self._table = self.get_client().Table(table_name)

    def get_table(self):
        return self._table

    def get_client(self):
        return self._dynamodb

    def update_item(self, pk: str, attribute: str):
        item = self.get_table().update_item(
            Key={
                "pk": pk,
                "sk": pk,
            }, 
            UpdateExpression="set attributeone=:a",
            ExpressionAttributeValues={
                ':a': attribute,
            },
            ReturnValues="UPDATED_NEW"
        )

        return item
