from commandService.lambda_handler import handler
from commandService.app import CommandServiceApp
import uuid

TEST_DATA_1 = {
  "body": {
    "pk": str(uuid.uuid4()),
    "attribute": str(uuid.uuid4())
  }
}

app = CommandServiceApp()


class TestLambdaTest:

    def test_create_event(self):
        response = handler(TEST_DATA_1, None)
        assert response == '{"message": "success!"}'