from http import HTTPStatus
import time

from logger import logger
from payment_provider import PaymentProvider


class App:
    def __init__(self):
        super().__init__()
        self._paymeny_provider = PaymentProvider()
        self._body = None
        self.context = {}

    def _send_payment_request(self):
        logger.info(f"Payment request sent logReference=P1902")
        if not self._paymeny_provider.mock_payment_request():
            raise Exception("Failed to make payment")

    def error_handled_workflow(self, event):
        """
        Handles error logic for event processing.
        """
        try:
            return self._event_workflow(event)
        except Exception as e:
            logger.info(f"Generic Workflow Error logReference=ERR0001 {e}")
            return {
            "ProcessPaymentError": {
                "error": str(e),
                "status": "FAILED",
            }
        }

    def _event_workflow(self, event):
        """
        Event process workflow:

            - stores event body in context
            - sends request to payment provider
            - handles response
        """
        self._get_event_body(event)
        self._send_payment_request()
        return {
            "ProcessPaymentResult": {
                "order_id": self._body["order_id"],
                "email": self._body["email"],
                "status": "ok",
            }
        }

    def _get_event_body(self, event) -> None:
        try:
            self._body = event
            self.context["input_result"] = event
            logger.info(f"Event body processed logReference=EV001 {self.context}")
        except Exception as e:
            logger.error(f"Event body retrieval error logReference=EV099 {e}")

    def _item_not_found(self, business_id):
        error = "No entry for that id %s" % business_id
        return self._400_error_response(HTTPStatus.OK, {"message": error})