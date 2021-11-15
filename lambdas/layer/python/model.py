from dataclasses import dataclass

@dataclass
class Order:
    pk: str
    sk: str
    status: str
    date: str
