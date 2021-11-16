from aws_lambda_powertools import Logger
from config import SERVICE_NAME


logger = Logger(service=SERVICE_NAME)