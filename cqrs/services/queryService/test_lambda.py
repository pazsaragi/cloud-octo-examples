import json
from .lambda_handler import handler
from .app import QueryServiceApp
from http import HTTPStatus

TEST_DATA_1 = {
  "body": {
    "pk": "1234",
    "attribute": "anything",
  }
}

app = QueryServiceApp()


class TestLambdaTest:

    def test_get_event(self):
        app._body = TEST_DATA_1["body"]
        app.create()
        response = handler(TEST_DATA_1, None)
        assert response.status_code == HTTPStatus.OK
        assert response is not None
        assert json.loads(response.body)[0]["pk"] == TEST_DATA_1["body"]["pk"]