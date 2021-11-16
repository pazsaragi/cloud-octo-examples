from http import HTTPStatus
import time

from logger import logger
from dynamodb import DynamoDB


class App:
    def __init__(self):
        super().__init__()
        self._database = DynamoDB()
        self._body = None
        self._db_input = None

    def _persist_record(self):
        if not self._database.update_item(self._db_input):
            raise Exception("Failed to persist order")

    def error_handled_workflow(self, event):
        """
        Handles error logic for event processing.
        """
        try:
            return self._event_workflow(event)
        except Exception as e:
            logger.info(f"Generic Workflow Error logReference=ERR0001 {e}")
            return {
            "SetOrderCompletedError": {
                "order_id": self._db_input["pk"],
                "status": "FAILED",
            }
        }

    def _convert_body_to_class(self):
        self._db_input = {
            "pk": self._body["order_id"],
            "sk": self._body["order_id"],
            "order_status": "order_created",
            "date": str(time.time()),
        }
        logger.info("Body converted to input logReference=CV001")


    def _event_workflow(self, event):
        """
        Event process workflow:

            - stores event body in context
            - converts body to pydantic model
            - persists model to db
            - handles response
        """
        self._get_event_body(event)
        self._convert_body_to_class()
        self._persist_record()
        return {
            "SetOrderCompletedResult": {
                "order_id": self._db_input["pk"],
                "email": self._body["email"],
                "status": "ok",
            }
        }

    def _get_event_body(self, event):
        try:
            self._body = event
            logger.info("Event body processed logReference=EV001")
        except AttributeError:
            self._body = event["body"]

    def _item_not_found(self, business_id):
        error = "No entry for that id %s" % business_id
        return self._400_error_response(HTTPStatus.OK, {"message": error})