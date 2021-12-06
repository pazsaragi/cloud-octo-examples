from .main import handler
import json


def test_handler():
    with open('event.json') as f:
        responses = handler(json.load(f), None)
        assert(responses is not None)
