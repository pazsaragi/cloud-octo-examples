from logger import logger
import boto3
from config import SOURCE_EMAIL
from botocore.exceptions import ClientError


BODY_TEXT = ("Amazon SES Test (Python)\r\n"
             "This email was sent with Amazon SES using the "
             "AWS SDK for Python (Boto)."
            )

def email_template(order_id: str):
    return f"""<html>
<head></head>
<body>
  <h1>Order Confirmation: {order_id}</h1>
  <p>This is your order confirmation email.</p>
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

    def send(self, email: str, order_id: str) -> bool:
        try:
            logger.info(f"Mailer input {email} logReference=MAIL11")

            self.get_client().send_email(
                    Source=SOURCE_EMAIL,
                    Destination={
                        'ToAddresses': [
                            email
                        ]
                    },
                    Message={
                        'Subject': {
                            'Data': 'Order confirmation',
                            'Charset': CHARSET
                        },
                        'Body': {
                            'Html': {
                                'Charset': CHARSET,
                                'Data': email_template(order_id),
                            },
                            'Text': {
                                'Charset': CHARSET,
                                'Data': BODY_TEXT,
                            },
                        },
                    },
            )
            logger.info("Mailer sent logReference=MAIL01")

            return True
        except ClientError as e:
            logger.info(f"Log Reference=MAIL009 Error={e}")
            raise