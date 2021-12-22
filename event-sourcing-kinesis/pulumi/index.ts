import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";


const firehoseRole = new aws.iam.Role("firehoseRole", {assumeRolePolicy: `{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Action": "sts:AssumeRole",
        "Principal": {
          "Service": "firehose.amazonaws.com"
        },
        "Effect": "Allow",
        "Sid": ""
      }
    ]
  }
  `});
  const lambdaIam = new aws.iam.Role("lambdaIam", {assumeRolePolicy: `{
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
  `});

// command table
const commandTable = new aws.dynamodb.Table("commandTable", {
    billingMode: "PAY_PER_REQUEST",
    hashKey: "pk",
    rangeKey: "sk",
    readCapacity: 1,
    writeCapacity: 1,
    streamEnabled: true,
    streamViewType: "NEW_IMAGE",
});

// query table
const queryTable = new aws.dynamodb.Table("queryTable", {
    billingMode: "PAY_PER_REQUEST",
    hashKey: "pk",
    rangeKey: "sk",
    readCapacity: 1,
    writeCapacity: 1,
});

// event store
const eventStore = new aws.kinesis.Stream("eventStore", {
    name: "eventStore",
});

// events db
const eventDb = new aws.s3.Bucket("eventDb", { acl: "private" });

// 
new aws.kinesis.FirehoseDeliveryStream("deliveryStream", {
    // source of the delivery stream
    kinesisSourceConfiguration: {
        kinesisStreamArn: eventStore.arn,
        roleArn: firehoseRole.arn,
    },
    destination: "extended_s3",
    extendedS3Configuration: {
        bucketArn: eventDb.arn,
        roleArn: firehoseRole.arn,
        processingConfiguration: {
            enabled: true,
            processors: [{
                type: "Lambda",
                parameters: [{
                    parameterName: "LambdaArn",
                    parameterValue: pulumi.interpolate`${lambdaProcessor.arn}:$LATEST`,
                }]
            }]
        }
    }
});