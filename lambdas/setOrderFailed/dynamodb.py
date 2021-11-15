from logger import logger
import boto3
import os
from base_database import BaseDatabase

table_name = os.getenv("TABLE_NAME", "orderTable")


class DynamoDB(BaseDatabase):
    def __init__(self) -> None:
        super().__init__()
        self._dynamodb = boto3.resource("dynamodb")
        self._table = self.get_client().Table(table_name)

    def get_table(self):
        return self._table

    def get_client(self):
        return self._dynamodb

    def update_item(self, order) -> bool:
        try:
            self.get_table().update_item(
                Key={
                    "pk": order["pk"],
                    "sk": order["sk"],
                },
                UpdateExpression="set order_status=:os",
                ExpressionAttributeValues={
                    ':os': "order_failed"
                }
            )
            logger.info("Item Persisted logReference=DBPUT001")

            return True
        except Exception as e:
            logger.info(f"Log Reference=DBPUT1501 Error={e}")
            raise