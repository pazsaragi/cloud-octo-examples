from http import HTTPStatus
import json
from logger import logger
import time
import uuid


from octo_aws_common.api_gateway_application import APIGatewayApplication
from aws_lambda_powertools.event_handler.api_gateway import Response
from aws_lambda_powertools.utilities.data_classes.api_gateway_proxy_event \
    import APIGatewayProxyEvent
from config import VERIFIED_EMAIL
from step_function import StepFunction


class App(APIGatewayApplication):
    def __init__(self):
        super().__init__()
        self._step_function = StepFunction()
        self._body = None
        self._db_input = None

    def _start_step_function(self):
        if not self._step_function.start(self._input):
            raise Exception("Failed to start step function")

    def error_handled_workflow(self, event: APIGatewayProxyEvent) -> Response:
        """
        Handles error logic for event processing.
        """
        try:
            return self._event_workflow(event)
        except Exception as e:
            logger.error(e)
            return self._500_error_response()

    def _process_body(self):
        self._input = json.dumps({
            "order_id": str(uuid.uuid4()),
            "status": "order_created",
            "date": str(time.time()),
            "email": VERIFIED_EMAIL
        })

    def _event_workflow(self, event: APIGatewayProxyEvent):
        """
        Event process workflow:

            - stores event body in context
            - converts body to pydantic model
            - persists model to db
            - handles response
        """
        self._get_event_body(event)
        self._process_body()
        self._start_step_function()
        return self._200_success_response({"message": "Successfully inserted!"})

    def _get_event_body(self, event: APIGatewayProxyEvent):
        try:
            self._body = event.body
        except AttributeError:
            self._body = event["body"]

    def _item_not_found(self, business_id):
        error = "No entry for that id %s" % business_id
        return self._400_error_response(HTTPStatus.OK, {"message": error})

    def _200_success_response(self, response_body: dict):
        return Response(
            HTTPStatus.OK,
            body=json.dumps(response_body),
            content_type="application/json"
        )

    def _500_error_response(self):
        return Response(
            HTTPStatus.INTERNAL_SERVER_ERROR,
            body="Internal Server Error",
            content_type="application/json"
        )

    def _400_error_response(self, response_body: dict):
        return Response(
            HTTPStatus.BAD_REQUEST,
            body=json.dumps(response_body),
            content_type="application/json"
        )
