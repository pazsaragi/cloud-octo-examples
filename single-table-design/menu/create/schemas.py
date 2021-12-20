INPUT = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://example.com/product.schema.json",
    "title": "Product",
    "description": "A product from Acme's catalog",
    "type": "object",
    "properties": {
        "body": {
            "type": "object",
            "properties": {
                "name": {
                    "description": "The name of an item.",
                    "type": "string"
                },
                "org_pk": {
                    "description": "The quantity of an item.",
                    "type": "string"
                },
                "is_active": {
                    "description": "The price of an item.",
                    "type": "boolean"
                }
            },
            "required": ["name", "org_pk", "is_active"]
        },
    },
}
