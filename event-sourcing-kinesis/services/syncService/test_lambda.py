import json
from .lambda_handler import handler
from .app import SyncServiceApp

TEST_DATA_1 = {
   "Records":[
      {
         "eventID":"fceffa5d8ea36b9eb1b1f4e524cc3ab2",
         "eventName":"INSERT",
         "eventVersion":"1.1",
         "eventSource":"aws:dynamodb",
         "awsRegion":"eu-west-2",
         "dynamodb":{
            "ApproximateCreationDateTime":1635950457.0,
            "Keys":{
               "sk":{
                  "S":"31271277-4ee9-4e83-9675-4f3b586b3fae"
               },
               "pk":{
                  "S":"31271277-4ee9-4e83-9675-4f3b586b3fae"
               }
            },
            "NewImage":{
               "sk":{
                  "S":"31271277-4ee9-4e83-9675-4f3b586b3fae"
               },
               "attribute":{
                  "S":"37a8efdf-a9ac-48ca-84d1-d4543d34ab88"
               },
               "pk":{
                  "S":"31271277-4ee9-4e83-9675-4f3b586b3fae"
               }
            },
            "SequenceNumber":"200000000008208089849",
            "SizeBytes":197,
            "StreamViewType":"NEW_IMAGE"
         },
         "eventSourceARN":"arn:aws:dynamodb:eu-west-2:355348644063:table/command/stream/2021-11-03T13:31:41.885"
      }
   ]
}




app = SyncServiceApp()


class TestLambdaTest:

    def test_sync_event(self):
        response = handler(TEST_DATA_1, None)
        assert response is not None
