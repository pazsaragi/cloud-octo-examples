# CQRS CDK Example

> This example implements this [pattern.](https://docs.aws.amazon.com/prescriptive-guidance/latest/modernization-data-persistence/cqrs-pattern.html)

Command query responsibility segregation separates data mutation (writes/updates) from queries. This is extremely useful if you have more writes/updates than reads. This is done by having a read replica for queries.

In this example, we will use a DynamoDB datastore for writes. A DynamoDB stream to then send data to a Lambda function that updates another DynamoDB datastore that holds the queries.

![CQRS Design Image](https://docs.aws.amazon.com/prescriptive-guidance/latest/modernization-data-persistence/images/enabling-diagram3.png)

"""
You should consider using this pattern if:

You implemented the database-per-service pattern and want to join data from multiple microservices.

Your read and write workloads have separate requirements for scaling, latency, and consistency.

Eventual consistency is acceptable for the read queries.
"""

## Reading

* [Lambda DynamoDB streams](https://docs.aws.amazon.com/lambda/latest/dg/with-ddb.html)