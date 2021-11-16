# CQRS CDK Example

> This example implements this [pattern.](https://docs.aws.amazon.com/prescriptive-guidance/latest/modernization-data-persistence/service-per-team.html)

The workflow consists of the following steps:

1. "OrderPlaced" events are published by the "Orders" microservice to the custom event bus.

2. Microservices that need to take action after an order is placed, such as the "/route" microservice, are initiated by rules and targets.

3. These microservices generate a route to ship the order to the customer and emit a "RouteCreated" event.

4. Microservices that need to take further action are also initiated by the "RouteCreated" event.

5. Events are sent to an event archive (for example, Amazon S3 Glacier) so that they can be replayed for reprocessing, if required.

6. If targets are not initiated, the affected events are placed in a dead letter queue (DLQ) for further analysis and reprocessing.



![Event Sourcing EventBridge](https://docs.aws.amazon.com/prescriptive-guidance/latest/modernization-data-persistence/images/enabling-diagram5.png)

"""
You should consider using this pattern if:

Events are used to completely rebuild the application's state.

You require events to be replayed in the system, and that an application's state can be determined at any point in time.

You want to be able to reverse specific events without having to start with a blank application state.

Your system requires a stream of events that can easily be serialized to create an automated log.

Your system requires heavy read operations but is light on write operations; heavy read operations can be directed to an in-memory database, which is kept updated with the events stream.
"""

## Event Bridge

* Eventbridge delivers a stream of system events that describes changes in AWS resources
* AWS Resources generate events when their state changes
* Targets process events. These can include EC2 instances, Lambda functions, kinesis streams, ECS tasks, Step functions ...
* Rules match incoming events and route them to targets
* Event busses can receive events from your own custom apps or can receive events from apps and services created by AWS SaaS partners.

## Reading

* ![Event Bus](https://eventbus-cdk.workshop.aws/en/04-api-gateway-service-integrations/01-rest-api/rest-apis.html)