import requests
import json
import os

class BaseHttpClass(object):
    """This is a base class to facilitate testing an API.
    It contains reusable components & functions that can be shared between 
    different APIs"""

    def __init__(self):
        self.session = requests.Session()

    def get(self, url: str, **kwargs) -> requests.Response:
        """Sends a get request and returns the response.

        Args:
            url (str): Endpoint url.

        Returns:
            response (requests.Response): HTTP Response.
        """
        try:
            return self.session.get(url, **kwargs)
        except requests.ConnectionError as e:
            raise(e)

    def post(self, url: str, **kwargs) -> requests.Response:
        """Sends a post request and returns the response.

        Args:
            url (str): Endpoint url.

        Returns:
            response (requests.Response): HTTP Response."""
        try:
            return self.session.post(url, **kwargs)
        except requests.ConnectionError as e:
            raise(e)

    def put(self, url: str, **kwargs) -> requests.Response:
        """Sends a put request and returns the response.

        Args:
            url (str): Endpoint url.

        Returns:
            response (requests.Response): HTTP Response."""
        try:
            return self.session.put(url, **kwargs)
        except requests.ConnectionError as e:
            raise(e)

    def patch(self, url: str, **kwargs) -> requests.Response:
        """Sends a patch request and returns the response.

        Args:
            url (str): Endpoint url.

        Returns:
            response (requests.Response): HTTP Response."""
        try:
            return self.session.patch(url, **kwargs)
        except requests.ConnectionError as e:
            raise(e)



class PaymentProvider(BaseHttpClass):

    def __init__(self):
        super().__init__()


    def mock_payment_request(self):
        response = self.get("https://jsonplaceholder.typicode.com/todos/1")
        if not response.ok:
            raise Exception("HTTP Error")
        
        return response.json()

