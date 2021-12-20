import boto3
import os
from shared.topic import add_message_to_topic
import json

client = boto3.client('cognito-idp')
sns_client = boto3.client('sns')
TOPIC_ARN = os.getenv("TOPIC_ARN")


def handler(event, context):
    """

    """
    try:
        response = {}
        print(event)
        username = event["userName"]
        group_name = ""
        user_attributes = event["request"]["userAttributes"]
        message = json.dumps({
            "default": json.dumps({
                "username": username,
                "email": user_attributes["email"],
                "phone_number": user_attributes["phone_number"],
                "org_name": user_attributes["custom:org_name"],
                "ref": username
            })

        })
        add_message_to_topic(
            message,
            topic_arn=TOPIC_ARN,
            sns_client=sns_client
        )
        print(message)
        if "custom:group" in event["request"]["userAttributes"]:
            group_name = event["request"]["userAttributes"]["custom:group"]
            response = client.admin_add_user_to_group(
                UserPoolId=event["userPoolId"],
                Username=username,
                GroupName=group_name
            )

        response["statusCode"] = 200
        print(response)
        return event
    except Exception as e:
        print(e)
