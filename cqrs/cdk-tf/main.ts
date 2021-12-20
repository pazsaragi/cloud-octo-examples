import { Construct } from "constructs";
import { App, TerraformStack } from "cdktf";
import { sqs, dynamodb, lambdafunction, iam } from './.gen/providers/aws'

const lambdaRolePolicy = {
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}

class CQRS extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    // role for lambda
    const dynamodbRole = new iam.IamRole(this, 'commandRole', {
      name: 'commandRole',
      assumeRolePolicy: JSON.stringify(lambdaRolePolicy),
      inlinePolicy: [{
        name: "AllowDynamoDB",
        policy: JSON.stringify({
          "Version": "2012-10-17",
          "Statement": [
            {
              "Action": [
                "dynamodb:Scan",
                "dynamodb:GetItem",
                "dynamodb:PutItem",
                "dynamodb:UpdateItem",
                "dynamodb:DeleteItem",
                "dynamodb:Query",
              ],
            }
          ]
        })
      }]
    });

    new iam.IamRolePolicyAttachment(this, "lambda-managed-policy", {
      policyArn: "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
      role: dynamodbRole.name
    });

    // command table
    const commandTable = new dynamodb.DynamodbTable(this, 'command', {
      name: 'command',
      streamEnabled: true,
    });

    // query table
    const queryTable = new dynamodb.DynamodbTable(this, 'query', {
      name: 'query',
    });

    // dead letter queue to process failed sync events
    const deadLetterQueue = new sqs.SqsQueue(this, 'deadLetterQueue');

    // command service
    const commandService = new lambdafunction.LambdaFunction(this, 'commandService', {
      functionName: 'commandService',
      role: dynamodbRole.arn,
    });

    // query service
    const queryService = new lambdafunction.LambdaFunction(this, 'queryService', {
      functionName: 'queryService',
      role: dynamodbRole.arn,
    });

    // sync service
    const syncService = new lambdafunction.LambdaFunction(this, 'syncService', {
      functionName: 'syncService',
      role: dynamodbRole.arn,
    });

    syncService.


  }
}

const app = new App();
new CQRS(app, "cqrs-cdktf");
app.synth();
