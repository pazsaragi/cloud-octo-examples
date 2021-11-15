from http import HTTPStatus
import json

from logger import logger
from mailer import Mailer


class App:
    def __init__(self):
        super().__init__()
        self._mailer = Mailer()
        self._body = None
        self._input = None
        self._context = {}

    def _send_email(self):
        for record in self._context:
            print(record)
            message = json.loads(record["Sns"]["Message"])
            if not self._mailer.send(message["context"]["email"]):
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
            "status": "FAILED",
        }

    def _event_workflow(self, event):
        """
        Event process workflow:

            - stores event body in context
            - handles response
        """
        self._get_event_body(event)
        self._send_email()
        return {
            "status": "ok",
        }

    def _get_event_body(self, event):
        try:
            self._context = event["Records"]
            logger.info("Event body processed logReference=EV001")
        except Exception as e:
            logger.info(f"Event body failed processing logReference=EV099 {e}")

    def _item_not_found(self, business_id):
        error = "No entry for that id %s" % business_id
        return self._400_error_response(HTTPStatus.OK, {"message": error})