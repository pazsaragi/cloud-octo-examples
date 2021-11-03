from app import QueryServiceApp
from tracer import tracer

app = QueryServiceApp()


@tracer.capture_lambda_handler()
def handler(event, context):
    print(event)
    event_wrapper = app.main(event, context)
    return app.process_record(event_wrapper).body