# Event Sourcing Example

> This example implements this [pattern.](https://docs.aws.amazon.com/prescriptive-guidance/latest/modernization-data-persistence/service-per-team.html)

In event-sourcing, data is stored as a series of events instead of direct updates to the database. Then Microservices replay events in the event store to create their own data stores. This allows you to reconstruct the app's state for any point in time - creating an audit trail of events.

In this example, we will use a kinesis data stream as the event store. The event store captures application changes as events and persists them in s3.

![Kinesis Event Sourcing](https://docs.aws.amazon.com/prescriptive-guidance/latest/modernization-data-persistence/images/enabling-diagram4.png)

"""
The workflow consists of the following steps:

When the "/withdraw" or "/credit" microservices experience an event state change, they publish an event by writing a message into Kinesis Data Streams.

Other microservices, such as "/balance" or "/creditLimit," read a copy of the message, filter it for relevance, and forward it for further processing.

You should consider using this pattern if:

Events are used to completely rebuild the application's state.

You require events to be replayed in the system, and that an application's state can be determined at any point in time.

You want to be able to reverse specific events without having to start with a blank application state.

Your system requires a stream of events that can easily be serialized to create an automated log.

Your system requires heavy read operations but is light on write operations; heavy read operations can be directed to an in-memory database, which is kept updated with the events stream.

Important
If you use the event sourcing pattern, you must deploy the Saga pattern to maintain data consistency across microservices.

"""
