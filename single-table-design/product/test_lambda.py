import json
from .lambda_handler import handler
from .app import BusinessApp

TEST_DATA_1 = {
    'Records': [
        {
            'messageId': '925a7569-467f-44ad-b465-9920cc3e60bc', 
            'receiptHandle': 'AQEBVmDBVeZAjXYJ9PE6tSRuFHT', 
            'body': '{"pk":"1234", "event_type":"create"}', 
            'attributes': {
                'ApproximateReceiveCount': '1', 
                'SentTimestamp': '1635784558003', 
                'SenderId': '355348644063', 
                'ApproximateFirstReceiveTimestamp': '1635784558007'
                }, 
            'messageAttributes': {}, 
            'md5OfBody': '1cf52fc66ee5f9c941a11b913d7a2de4', 
            'eventSource': 'aws:sqs', 
            'eventSourceARN': '', 
            'awsRegion': 'eu-west-2'
        }
    ]
}

TEST_DATA_2 = {
    'Records': [
        {
            'messageId': '925a7569-467f-44ad-b465-9920cc3e60bc', 
            'receiptHandle': 'AQEBVmDBVeZAjXYJ9PE6tSRuFHT', 
            'body': '{"pk":"1234", "event_type":"get"}', 
            'attributes': {
                'ApproximateReceiveCount': '1', 
                'SentTimestamp': '1635784558003', 
                'SenderId': '355348644063', 
                'ApproximateFirstReceiveTimestamp': '1635784558007'
                }, 
            'messageAttributes': {}, 
            'md5OfBody': '1cf52fc66ee5f9c941a11b913d7a2de4', 
            'eventSource': 'aws:sqs', 
            'eventSourceARN': '', 
            'awsRegion': 'eu-west-2'
        }
    ]
}

app = BusinessApp()


class TestLambdaTest:

    def test_create_event(self):
        response = handler(TEST_DATA_1, None)
        assert response is not None

    def test_get_event(self):
        response = handler(TEST_DATA_2, None)
        assert response is not None
        
        response = json.loads(response[0])
        data_body = json.loads(TEST_DATA_2['Records'][0]["body"])
        
        assert response["pk"] == data_body["body"]["payload"]["pk"]
