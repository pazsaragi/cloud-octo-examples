from app import CommandServiceApp
from tracer import tracer

app = CommandServiceApp()


@tracer.capture_lambda_handler()
def handler(event, context):
    proxy_event = app.main(event, context)
    return app.process_request(proxy_event).body