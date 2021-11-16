import json
from .lambda_handler import handler
from .app import App

TEST_DATA_1 = {
      "resource": "/",
      "path": "/",
      "httpMethod": "GET",
      "requestContext": {
          "resourcePath": "/",
          "httpMethod": "GET",
          "path": "/Prod/"
      },
      "headers": {
          "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
          "accept-encoding": "gzip, deflate, br",
          "Host": "70ixmpl4fl.execute-api.us-east-2.amazonaws.com",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36",
          "X-Amzn-Trace-Id": "Root=1-5e66d96f-7491f09xmpl79d18acf3d050"
      },
      "multiValueHeaders": {
          "accept": [
              "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9"
          ],
          "accept-encoding": [
              "gzip, deflate, br"
          ]
      },
      "queryStringParameters": None,
      "multiValueQueryStringParameters": None,
      "pathParameters": None,
      "stageVariables": None,
      "body": {"pk":"123asf4", "sk":"12hds34"},
      "isBase64Encoded": False
  }

app = App()

class TestLambdaTest:

    def test_create_event(self):
        wrapper = app.main(TEST_DATA_1, None)
        response = app.process_event(wrapper)
        assert response is not None
