from app import App
from tracer import tracer
from logger import logger

app = App()


@logger.inject_lambda_context()
@tracer.capture_lambda_handler()
def handler(event, context):
    print(event)
    return app.error_handled_workflow(event)