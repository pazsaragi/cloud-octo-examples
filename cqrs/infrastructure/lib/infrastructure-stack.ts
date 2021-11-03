import * as cdk from '@aws-cdk/core';
import { DynamoStack } from './dynamodb-stack';
import * as lambda from '@aws-cdk/aws-lambda';
import * as sqs from '@aws-cdk/aws-sqs';
import { DynamoEventSource, SqsDlq } from '@aws-cdk/aws-lambda-event-sources';

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const environment = "dev";

    const commandTable = new DynamoStack(this, `commandDynamoStack`, {
      environment,
      tableName: 'command',
      stream: true
    });

    const queryTable = new DynamoStack(this, `queryDynamoStack`, {
      environment,
      tableName: 'query'
    });

    const deadLetterQueue = new sqs.Queue(this, 'deadLetterQueue');

    const commandService = new lambda.Function(this,
      "commandService-lambda",
      {
        runtime: lambda.Runtime.PYTHON_3_8,
        handler: "lambda_handler.handler",
        code: lambda.Code.fromAsset(`../services/commandService`, {
          bundling: {
            image: lambda.Runtime.PYTHON_3_8.bundlingImage,
            command: [
              "bash",
              "-c",
              "pip install -r requirements.txt -t /asset-output && cp -au . /asset-output",
            ],
          },
        }),
        functionName: "commandService",
        environment: {
          DYNAMODB_TABLE_NAME: commandTable.dbTable.tableName,
        },
      }
    );

    const queryService = new lambda.Function(this,
      "queryService-lambda",
      {
        runtime: lambda.Runtime.PYTHON_3_8,
        handler: "lambda_handler.handler",
        code: lambda.Code.fromAsset(`../services/queryService`, {
          bundling: {
            image: lambda.Runtime.PYTHON_3_8.bundlingImage,
            command: [
              "bash",
              "-c",
              "pip install -r requirements.txt -t /asset-output && cp -au . /asset-output",
            ],
          },
        }),
        functionName: "queryService",
        environment: {
          DYNAMODB_TABLE_NAME: queryTable.dbTable.tableName,
        },
      }
    );

    const syncService = new lambda.Function(this,
      "syncService-lambda",
      {
        runtime: lambda.Runtime.PYTHON_3_8,
        handler: "lambda_handler.handler",
        code: lambda.Code.fromAsset(`../services/syncService`, {
          bundling: {
            image: lambda.Runtime.PYTHON_3_8.bundlingImage,
            command: [
              "bash",
              "-c",
              "pip install -r requirements.txt -t /asset-output && cp -au . /asset-output",
            ],
          },
        }),
        functionName: "syncService",
        environment: {
          DYNAMODB_TABLE_NAME: queryTable.dbTable.tableName,
        },
      }
    );

    commandTable.dbTable.grantWriteData(commandService);
    queryTable.dbTable.grantReadData(queryService);
    queryTable.dbTable.grantWriteData(syncService);

    syncService.addEventSource(new DynamoEventSource(commandTable.dbTable, {
      startingPosition: lambda.StartingPosition.TRIM_HORIZON,
      batchSize: 5,
      bisectBatchOnError: true,
      onFailure: new SqsDlq(deadLetterQueue),
      retryAttempts: 10
    }));

  }
}
