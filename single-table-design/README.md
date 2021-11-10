# Single-Table Design Example

> In this example, we will model a Menu using single table design, to demonstrate how you might go about creating a CRUD API with several one-to-many relationships.

* Access patterns:

| Pattern      | Comments |
| ----------- | ----------- |
| Get Menu by Name      | ...       |
| Get Sections by Menu   | ...        |
| Get Sections by Menu   | ...        |
| Get Products by Section   | ...        |
| Update Menu   | ...        |
| Update Section   | ...        |
| Update Product   | ...        |

## Different Methods

### Composite Primary key + query api

This method colocates the one-to-many relationship. So our data rows might look like such:
```python
[
    {
        'pk': 'MENU#<MENU_NAME>',
        'sk': 'METADATA#<MENU_NAME>',
        'MenuName': ...,
        'Status': ...
    },
    {
        'pk': 'MENU#<MENU_NAME>',
        'sk': 'SECTION#<SECTION_NAME>',
        'SectionName': ...,
        'Status': ...
    },
    {
        'pk': 'MENU#<MENU_NAME>',
        'sk': 'SECTION#<SECTION_NAME>',
        'SectionName': ...,
        'Status': ...
    },
]
```

To query for all the menus and it's child section you could achieve this by using the `GetItem` API call and the Menu's name to make a request for the item with a `pk` of `MENU#<MENU_NAME>`. This would returns the menu and all of its sections. 

To retrieve only sections within a menu you can use the Query API with a key condition expression of `pk=MENU#<MENU_NAME> AND begins_with(sk, "SECTION")`. To retrieve a specific section you could use the GetItem API through `pk=MENU#<MENU_NAME>` and `sk=SECTION#<SECTION_NAME>`.

### Secondary index + the Query API action

The previous pattern is not suitable since we have **hierarchical data with many levels of hierarchy**. 

You might turn instead to using a Global Secondary Index(GSI). This is akin to adding additional composite primary keys to a row. 

This allows us to find all sections to a menu and then all products to a section. For this we will need two GSI's, one to join menu to section and then section to product.

This might look like such:

```python
{
    # Menu Item Collection

    'pk': 'MENU#<MENU_PK_UUID>',
    'sk': 'MENU#<MENU_NAME>',
    'MenuName': ...,
    'Status': ...,
    # rest of attributes ...
    'GSI1PK': '{pk}#{sk}', # joins to section
    'GSI1SK': '{sk}',
},
{
    # Section Item Collection

    'pk': 'SECTION#<SECTION_PK_UUID>',
    'sk': 'SECTION#<SECTION_NAME>',
    'SectionName': ...,
    'GSI1PK': '{menu_pk}#{menu_sk}',
    'GSI1SK': '{sk}',
    # rest of attributes ...
    'GSI2PK': '{pk}#{sk}', # joins to product
    'GSI2SK': '{sk}',
},
{
    # Product Item Collection

    'pk': 'PRODUCT#<PRODUCT_PK_UUID>',
    'sk': 'PRODUCT#<PRODUCT_NAME>',
    'ProductName': ...,
    # rest of attributes ...
    'GSI2PK': '{section_pk}#{section_sk}',
    'GSI2SK': '{pk}',
}
```

To find all sections for a given menu we could query like such `GSI1PK=MENU#<MENU_PK_UUID>#MENU#<MENU_NAME>`. To get a specific section you would then do `GSI1PK=MENU#<MENU_PK_UUID>#MENU#<MENU_NAME> AND GSI1SK=SECTION#<SECTION_NAME>`. This can also be applied to get all products for a given section, simply query `GSI2PK=SECTION#<SECTION_PK_UUID>#SECTION#<SECTION_NAME>`.

### Composite sort keys with hierarchical data

The previous approaches are useful techniques but fail when we have sevelra levels of hierarchy. Having to add more and more GSIs is not a suitable approach.

Composite sort keys aims to solve this issue by adding levels of hierarchy to the sort key. However, what if we want to update our section name? This would then not be suitable since we cannot update our Sort key.


## Nested Object

Instead for this example it is best to store the entire document as a document. This means we only have to query a single item which is extremely efficient and the only complexity is around updating different levels of the menu. See: (List append)[https://stackoverflow.com/questions/31288085/how-to-append-a-value-to-list-attribute-on-aws-dynamodb], (List append if not exists)[https://stackoverflow.com/questions/34951043/is-it-possible-to-combine-if-not-exists-and-list-append-in-update-item] and (updating nested object)[https://stackoverflow.com/questions/51911927/update-nested-map-dynamodb]


```python
    'pk': 'MENU#<MENU_PK_UUID>',
    'sk': 'MENU#<MENU_SK_UUID>',',
    'MenuName': 'Breakfast',
    'IsActive': False,
    'Sections': 
      {
        '<SECTION_UUID>': {
          'SectionName': 'Desserts',
          'SectionId': '<SECTION_UUID>',
          'IsActive': False,
          'Products': 
            {
              '<PRODUCT_UUID>': {
                'ProductName': 'Bread',
                'allergens': ["Fish", "Veggie"],
                'ProductId': '<PRODUCT_UUID>'
              }
            ...
            }
        }
      ...
      }
```


# Reading

* https://www.alexdebrie.com/posts/dynamodb-one-to-many/#composite-sort-keys-with-hierarchical-data
* https://www.sensedeep.com/blog/posts/2021/dynamodb-singletable-design.html
* Python Dynamodb examples - https://highlandsolutions.com/blog/hands-on-examples-for-working-with-dynamodb-boto3-and-python
* Updating nested object - https://stackoverflow.com/questions/51911927/update-nested-map-dynamodb
* Appending items - https://stackoverflow.com/questions/31288085/how-to-append-a-value-to-list-attribute-on-aws-dynamodb

