# 🌴 Cloud Octo Examples 🌴

> A mono repo of architectural patterns implemented as cloud infrastructure

## Examples 🌱

* [CQRS](cqrs/README.md)
    - [AWS CDK](cqrs/aws-cdk/infrastructure/README.md) ✅
    - TF ❌
    - CDK TF ❌
    - Pulumi ❌

## Projects

* CQRS [x]
* Event-sourcing with kinesis [x]
* Event-sourcing with EventBridge []
* Simple CRUD serverless Microservices [x]
* Saga Pattern [x]
* Single Table Design [x]
* graphql [x]
* DynamoDB Single-Table Design sync'd to sql Database []
* API Composition
* Database per service
* Serverless Everything 
* Graph Database
* Data Streaming
* Fine-grained EC2 (ansible, config management) []
* Secrets
* Transit Gateway
* EKS
* Kubernetes on EC2
* AppMesh
* Datalake
* Three-tier architecture [x]
* DynamoDB Dax []
* WAF auditing log to Kinesis Data Firehose
* LDAP
* Kafka
* RabbitMQ
* Cassandra
* Terraform vs CDK vs Pulumi vs Terraform CDK
* [Cloudwatch lambda dashboard](https://github.com/cdk-patterns/serverless/blob/main/the-cloudwatch-dashboard/typescript/lib/the-cloudwatch-dashboard-stack.ts)


## Pulumi vs Terraform vs CDK

* Recovering current state of infrastructure in pulumi is extremely cumbersome
* CDK state diffs are non-existent

## Inspiration

* See https://cdkpatterns.com/patterns/well-architected/
* See https://www.jeremydaly.com/serverless-microservice-patterns-for-aws
* See https://docs.aws.amazon.com/prescriptive-guidance/latest/modernization-data-persistence/enabling-patterns.html