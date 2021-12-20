from app import BusinessApp
from tracer import tracer

app = BusinessApp()


@tracer.capture_lambda_handler()
def handler(event, context):
    print(event)
    responses = []
    wrapper = app.main(event, context)
    for record in wrapper.records:
        response = app.process_record(record)
        responses.append(response)
    return responses