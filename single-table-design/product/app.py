from http import HTTPStatus
import json
from dynamodb import DynamoDB

from octo_aws_common.sqs_application import SQSApplication
from aws_lambda_powertools.event_handler.api_gateway import Response


class ProductApp(SQSApplication):
    def __init__(self):
        super().__init__()
        self._database = DynamoDB()
        self._body = None

    def get_business_by_id(self, business_id):

        db_entry = self._database.get_item(business_id)

        if db_entry is None:
            return self._item_not_found(business_id)

        return self._create_response(db_entry)

    def create_business(self, business_id):

        db_entry = self._database.create_item(business_id=business_id)

        if db_entry is None:
            return self._item_not_found(business_id)

        return self._create_response(db_entry)

    def process_record(self, event):
        self._get_event_body(event.body)
        
        if "event_type" not in self._body or not self._body:
            return

        event_type = self._body["event_type"]

        if event_type == "create":
            business_id = self._body["pk"]
            return self.create_business(business_id)
        
        if event_type == "get":
            business_id = self._body["pk"]
            return self.get_business_by_id(business_id)


    @staticmethod
    def _parse_body(body):
        return json.loads(body)

    def _get_event_body(self, json_body):
        self._body = self._parse_body(json_body)

    def _item_not_found(self, business_id):
        error = "No entry for that id %s" % business_id
        return self._400_error_response(HTTPStatus.OK, {"message": error})

    def _create_response(self, response_body):
        return json.dumps(response_body)

    def _500_error_response(self):
        return Response(
            HTTPStatus.INTERNAL_SERVER_ERROR,
            body="Internal Server Error",
        )
    
    def _400_error_response(self, response_body):
        return Response(
            HTTPStatus.BAD_REQUEST,
            body=json.dumps(response_body),
        )