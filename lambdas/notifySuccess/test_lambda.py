from .app import App

TEST_DATA_1 = {'Records': [{'EventSource': 'aws:sns', 'EventVersion': '1.0', 'EventSubscriptionArn': 'arn:aws:sns:eu-west-2:355348644063:SagaPatternStack-successTopicF4167C97-1P5WWYS5X4Y8Y:aa5279be-2aba-49e3-af44-566503b399fa', 'Sns': {'Type': 'Notification', 'MessageId': '33dbabd1-7ce6-59f8-a5d2-f1ddc7f12b33', 'TopicArn': 'arn:aws:sns:eu-west-2:355348644063:SagaPatternStack-successTopicF4167C97-1P5WWYS5X4Y8Y', 'Subject': None, 'Message': '{"context":{"order_id":"8caad2c0-78af-4042-89b9-051c69a3296d","email":"paz40@hotmail.co.uk","status":"ok"}}', 'Timestamp': '2021-11-15T19:45:27.016Z', 'SignatureVersion': '1', 'Signature': 'VLA8stK29jd2zUcLnI6vOzgYFUSRylI+sAMTViqKLX5q5bi71BPIBrfQXNnr9SXqdtRZXOVt//staQppX1iBkcdl8AVFQ+EZzC8u+NSxyAGOIuNuGt0J8VMLjuzhAh0PdpeDqvSZDO8d0KpA/faFpNKZCeWiaKQVc1DqmlDmQphtVWIUZdCLmbDuL1wPKShhIt8bBNSnMTs35gZP94I9WU7DOERBq2CoA2I4qsAfawk/wBvbaFDy4zn8m0GPRp3lnuGIZbwu/6t7mRE2A9sLQr8qjuSd4YXfJf8x4aztytXoO3nXhTnYSKMfHx3Qh74aKrGA0jd0F5CXSKsKSoJEJQ==', 'SigningCertUrl': 'https://sns.eu-west-2.amazonaws.com/SimpleNotificationService-7ff5318490ec183fbaddaa2a969abfda.pem', 'UnsubscribeUrl': 'https://sns.eu-west-2.amazonaws.com/?Action=Unsubscribe&SubscriptionArn=arn:aws:sns:eu-west-2:355348644063:SagaPatternStack-successTopicF4167C97-1P5WWYS5X4Y8Y:aa5279be-2aba-49e3-af44-566503b399fa', 'MessageAttributes': {}}}]}


app = App()

class TestLambdaTest:

    def test_create_event(self):
        response = app.error_handled_workflow(TEST_DATA_1)
        assert response is not None
        assert "status" in response 
        assert response ["status"] == "ok"

