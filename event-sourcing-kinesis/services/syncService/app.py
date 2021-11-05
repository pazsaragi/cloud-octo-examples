import json
from dynamodb import DynamoDB

from octo_aws_common.dynamo_streams_application \
    import DynamoDBStreamsApplication


class SyncServiceApp(DynamoDBStreamsApplication):
    def __init__(self):
        super().__init__()
        self._database = DynamoDB()
        self._body = None

    def update(self):

        data = self._body["NewImage"]
        print(data)

        db_entry = self._database.update_item(
            data["pk"]["S"], 
            data["attributeone"]["S"]
        )

        if not db_entry:
            return self._failed_to_update_item()

        return self._create_response()

    def process_record(self, event):
        self._get_event_body(event.dynamodb)
        return self.update()


    @staticmethod
    def _parse_body(body):
        return json.loads(body)

    def _get_event_body(self, json_body):
        self._body = json_body

    def _failed_to_update_item(self):
        return self._400_error_response()

    def _create_response(self):
        return True

    def _500_error_response(self):
        return False
    
    def _400_error_response(self):
        return False