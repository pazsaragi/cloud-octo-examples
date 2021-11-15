# Saga Pattern Example

> This example implements this [pattern.](https://docs.aws.amazon.com/prescriptive-guidance/latest/modernization-data-persistence/saga-pattern.html)

The saga pattern is used to coordinate transactions between multiple microservices to maintain data consistency.

![Saga Pattern](https://docs.aws.amazon.com/prescriptive-guidance/latest/modernization-data-persistence/images/enabling-diagram6.png)

"""
The application needs to maintain data consistency across multiple microservices without tight coupling.

There are long-lived transactions and you don’t want other microservices to be blocked if one microservice runs for a long time.

You need to be able to roll back if an operation fails in the sequence.

The saga pattern is difficult to debug and its complexity increases with the number of microservices. The pattern requires a complex programming model that develops and designs compensating transactions for rolling back and undoing changes.

"""

## Reading

* []()