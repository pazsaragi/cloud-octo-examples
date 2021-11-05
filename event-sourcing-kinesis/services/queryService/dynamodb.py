import boto3
from boto3.dynamodb.conditions import Key
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

    def create(self, pk: str, attribute: str) -> dict or None:
        self.get_table().put_item(Item={
                "pk": pk,
                "sk": pk,
                "attributeone": attribute
            }
        )

        return True

    def get_item(self, pk: str) -> dict or None:
        item = self.get_table().query(
            KeyConditionExpression=Key('pk').eq(pk) & Key('sk').eq(pk)
        )

        return item.get("Items")
