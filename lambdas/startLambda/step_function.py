import json
from logger import logger
import boto3
import os
import uuid

state_machine_arn = os.getenv("STATE_MACHINE_ARN")


class StepFunction:
    def __init__(self) -> None:
        super().__init__()
        self.step_function = boto3.client("stepfunctions")

    def get_client(self):
        return self.step_function

    def start(self, order) -> bool:
        try:
            self.get_client().start_execution(
                stateMachineArn=state_machine_arn,
                name=str(uuid.uuid4()),
                input=order
            )
            return True
        except Exception as e:
            logger.info(f"Log Reference=DBPUT1501 Error={e}")
            raise
