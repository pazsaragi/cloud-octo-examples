import * as cdk from '@aws-cdk/core';
import { DynamoStack } from '../../../cdk-constructs/dynamodb-stack';
import * as apigateway from '@aws-cdk/aws-apigateway';
import * as kinesis from '@aws-cdk/aws-kinesis';
import * as firehose from '@aws-cdk/aws-kinesisfirehose';
import { LambdaStack } from './lambda-stack';
import * as destinations from '@aws-cdk/aws-kinesisfirehose-destinations';
import * as s3 from '@aws-cdk/aws-s3';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as rds from '@aws-cdk/aws-rds';

/**
 * -> /credit and /withdraw endpoints 
 * -> lambda functions
 * -> publish events onto kinesis streams
 * -> events on stream persisted to s3
 * -> /balance and /credit lambda function reads from event store (either kinesis or s3) and write to aurora db
 * -> /balance and /credit endpoints point to lambdas that read latest state from aurora
 * 
 */
export class InfrastructureStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const environment = "dev";

    // 
    const commandTable = new DynamoStack(this, `commandDynamoStack`, {
      environment,
      tableName: 'command',
      stream: true
    });

    // event store
    const eventStore = new kinesis.Stream(this, "eventStore", {
      streamName: "eventStore"
    });

    const eventsDb = new s3.Bucket(this, "eventsDb")
    
    new firehose.DeliveryStream(this, 'deliveryStream', {
      sourceStream: eventStore,
      destinations: [new destinations.S3Bucket(eventsDb)],
    });

    // Api Gateways
    const withdrawGateway = new apigateway.RestApi(this, `withdrawGateway`, {
      restApiName: `withdrawGateway`,
    });

    const creditGateway = new apigateway.RestApi(this, `creditGateway`, {
      restApiName: `creditGateway`,
    });

    const balanceGateway = new apigateway.RestApi(this, `balanceGateway`, {
      restApiName: `balanceGateway`,
    });

    const creditLimitGateway = new apigateway.RestApi(this, `creditLimitGateway`, {
      restApiName: `creditLimitGateway`,
    });

    // 
    const withdrawService = new LambdaStack(this, "withdrawServiceStack", {
      environment,
      name: "withdrawService"
    });

    const creditService = new LambdaStack(this, "creditServiceStack", {
      environment,
      name: "creditService"
    });

    const balanceService = new LambdaStack(this, "balanceServiceStack", {
      environment,
      name: "balanceService"
    });

    const creditLimitService = new LambdaStack(this, "creditLimitServiceStack", {
      environment,
      name: "creditLimitService"
    });

    const queryService = new LambdaStack(this, "queryServiceStack", {
      environment,
      name: "queryService"
    });

    eventStore.grantWrite(withdrawService.lambda);
    eventStore.grantWrite(creditService.lambda);
    eventStore.grantRead(queryService.lambda);
    commandTable.dbTable.grantWriteData(withdrawService.lambda);
    commandTable.dbTable.grantWriteData(creditService.lambda);

    const vpc = new ec2.Vpc(this, 'auroravpc');

    const queryDb = new rds.ServerlessCluster(this, 'AnotherCluster', {
      engine: rds.DatabaseClusterEngine.AURORA_POSTGRESQL,
      parameterGroup: rds.ParameterGroup.fromParameterGroupName(this, 'ParameterGroup', 'default.aurora-postgresql10'),
      vpc,
      scaling: {
        autoPause: cdk.Duration.minutes(5) as any, // default is to pause after 5 minutes of idle time
        minCapacity: rds.AuroraCapacityUnit.ACU_8, // default is 2 Aurora capacity units (ACUs)
        maxCapacity: rds.AuroraCapacityUnit.ACU_32, // default is 16 Aurora capacity units (ACUs)
      }
    });

    queryDb.grantDataApiAccess(balanceService.lambda);
    queryDb.grantDataApiAccess(creditLimitService.lambda);
    queryDb.grantDataApiAccess(queryService.lambda);

  }
}
