from logger import logger
import boto3
from config import SOURCE_EMAIL
from botocore.exceptions import ClientError


BODY_TEXT = ("Amazon SES Test (Python)\r\n"
             "This email was sent with Amazon SES using the "
             "AWS SDK for Python (Boto)."
            )

BODY_HTML = """<html>
<head></head>
<body>
  <h1>Amazon SES Test (SDK for Python)</h1>
  <p>This email was sent with
    <a href='https://aws.amazon.com/ses/'>Amazon SES</a> using the
    <a href='https://aws.amazon.com/sdk-for-python/'>
      AWS SDK for Python (Boto)</a>.</p>
</body>
</html>
            """  
CHARSET = "UTF-8"


class Mailer:
    def __init__(self) -> None:
        super().__init__()
        self._mailer = boto3.client("ses")

    def get_client(self):
        return self._mailer

    def send(self, email: str) -> bool:
        try:
            self.get_client().send_email(
                    Source=SOURCE_EMAIL,
                    Destination={
                        'ToAddresses': [
                            email
                        ]
                    },
                    Message={
                        'Body': {
                            'Html': {
                                'Charset': CHARSET,
                                'Data': BODY_HTML,
                            },
                            'Text': {
                                'Charset': CHARSET,
                                'Data': BODY_TEXT,
                            },
                        },
                    },
                    ConfigurationSetName='ConfigSet'
            )
            logger.info("Mailer sent logReference=MAIL01")

            return True
        except ClientError as e:
            logger.info(f"Log Reference=MAIL009 Error={e}")
            raise