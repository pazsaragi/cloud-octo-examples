import * as cdk from '@aws-cdk/core';
import * as apigateway from '@aws-cdk/aws-apigateway';
import * as iam from '@aws-cdk/aws-iam';
import * as events from '@aws-cdk/aws-events';
import * as  logs from '@aws-cdk/aws-logs';
import * as targets from '@aws-cdk/aws-events-targets';

export class EventSourcingEventbridgeCdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // event bus
    const bus = new events.EventBus(this, "events-bus");

    // log all events
    const logRule = new events.Rule(this, "logger-rule", {
      description: "Logs all events",
      eventPattern: {
        region: [ "eu-west-2" ]
      },
      eventBus: bus
    });

    const logGroup = new logs.LogGroup(this, "log-group", {
      logGroupName: 'aws/events/allEvents'
    });

    logRule.addTarget(new targets.CloudWatchLogGroup(logGroup))

    // events api gateway
    const eventsApi = new apigateway.RestApi(this, 'events-api', {
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS // this is also the default
      }
    });

    eventsApi.root.addMethod("POST", 
      new apigateway.Integration({
        type: apigateway.IntegrationType.AWS,
        uri: `arn:aws:apigateway:${cdk.Aws.REGION}:events:path//`,
        integrationHttpMethod: "POST",
        options: {
          credentialsRole: new iam.Role(this, "ApiEventRole", {
            assumedBy: new iam.ServicePrincipal("apigateway"),
            inlinePolicies: {
              "putEvents": new iam.PolicyDocument({
                statements: [
                  new iam.PolicyStatement({
                    actions: ["events:PutEvents"],
                    resources: [bus.eventBusArn]
                  })
                ]
              })
            }
          }),
          requestParameters: {
            "integration.request.header.X-Amz-Target": "'AWSEvents.PutEvents'",
            "integration.request.header.Content-Type": "'application/x-amz-json-1.1'"
          },
          requestTemplates: {
            "application/json": `{"Entries": [{"Source": "com.amazon.alexa.english", "Detail": "{ \\"key1\\": \\"value1\\", \\"key2\\": \\"value2\\" }", "Resources": ["resource1", "resource2"], "DetailType": "myDetailType", "EventBusName": "${bus.eventBusName}"}]}`
          },
          integrationResponses: [{
            statusCode: "200",
            responseTemplates: {"application/json": ""}
          }]
        }
      }),
      {methodResponses: [{statusCode: "200"}]}
    );

    // routes to event bus

    // event rules determine the targets

    // all events stored in s3 glacier valut

    // event targets

    // schema registry

    // failed events stored in SQS DLQ for replay

    // /order microservice (apigateway, lambda, aurora db)
    const ordersApi = new apigateway.RestApi(this, 'orders-api', {
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS // this is also the default
      }
    });

    // /route microservice (apigateway, lambda, neptune db)
    const routesApi = new apigateway.RestApi(this, 'routes-api', {
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS // this is also the default
      }
    });

    // /shipment microservice (apigateway, lambda, dynamodb db)
    const shipmentsApi = new apigateway.RestApi(this, 'shipments-api', {
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS // this is also the default
      }
    });

  }
}
