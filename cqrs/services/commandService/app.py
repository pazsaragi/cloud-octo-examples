from http import HTTPStatus
import json
from dynamodb import DynamoDB

from octo_aws_common.api_gateway_application import APIGatewayApplication
from aws_lambda_powertools.event_handler.api_gateway import Response


class CommandServiceApp(APIGatewayApplication):
    def __init__(self):
        super().__init__()
        self._database = DynamoDB()
        self._body = None

    def create(self):

        db_entry = self._database.create(
            self._body["pk"], 
            self._body["attribute"]
        )
        
        if not db_entry:
            return self._failed_to_create_item()

        return self._create_response({"message": "success!"})

    def process_request(self, event):
        self._get_event_body(event.body)
        return self.create()

    @staticmethod
    def _parse_body(body):
        return json.loads(body)

    def _get_event_body(self, json_body):
        self._body = json_body

    def _failed_to_create_item(self):
        return self._500_error_response()

    def _create_response(self, response_body: dict):
        return Response(
            HTTPStatus.OK,
            body=json.dumps(response_body),
            content_type="application/json"
        ) 

    def _500_error_response(self):
        return Response(
            HTTPStatus.INTERNAL_SERVER_ERROR,
            body=json.dumps({"message": "Failed"}),
            content_type="application/json"
        )
    
    def _400_error_response(self, response_body):
        return Response(
            HTTPStatus.BAD_REQUEST,
            body=json.dumps(response_body),
            content_type="application/json"
        )