from app import App
from tracer import tracer
from logger import logger
from aws_lambda_powertools.utilities.data_classes.api_gateway_proxy_event \
    import APIGatewayProxyEvent

app = App()


@logger.inject_lambda_context()
@tracer.capture_lambda_handler()
def handler(event, context):
    logger.info(event)
    wrapped_event: APIGatewayProxyEvent = app.main(event, context)
    response = app.error_handled_workflow(wrapped_event)

    return {
        "statusCode": 200,
        'headers': {'Content-Type': 'application/json'},
        'body': response.body
    }