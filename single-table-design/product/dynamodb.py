import boto3
import os
from base_database import BaseDatabase

table_name = os.getenv("DYNAMO_TABLE_NAME", "business-table")


class DynamoDB(BaseDatabase):
    def __init__(self) -> None:
        super().__init__()
        self._dynamodb = boto3.resource("dynamodb")
        self._table = self.get_client().Table(table_name)

    def get_table(self):
        return self._table

    def get_client(self):
        return self._dynamodb

    def get_item(self, business_id: str) -> dict or None:
        item = self.get_table().get_item(Key={"pk": business_id, "sk": business_id})

        return item.get("Item")

    def create_item(self, business_id: str) -> dict or None:
        self.get_table().put_item(Item={
                "pk": business_id,
                "sk": business_id,
            }
        )

        return True