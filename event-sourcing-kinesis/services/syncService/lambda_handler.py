from app import SyncServiceApp
from tracer import tracer

app = SyncServiceApp()


@tracer.capture_lambda_handler()
def handler(event, context):
    print(event)
    responses = []
    wrapper = app.main(event, context)
    for record in wrapper.records:
        response = app.process_record(record)
        responses.append(response)
    return responses