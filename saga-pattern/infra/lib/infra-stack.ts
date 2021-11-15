import * as cdk from "@aws-cdk/core";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as lambda from "@aws-cdk/aws-lambda";
import * as sfn from "@aws-cdk/aws-stepfunctions";
import * as apigateway from "@aws-cdk/aws-apigateway";
import * as tasks from "@aws-cdk/aws-stepfunctions-tasks";
import * as sns from "@aws-cdk/aws-sns";
import * as nodeLambda from "@aws-cdk/aws-lambda-nodejs";
import * as pythonLambda from "@aws-cdk/aws-lambda-python";
import * as path from "path";
import * as fs from "fs";
import { lambdaFactory } from "./lambda-creator";


export class InfraStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    
    // order table
    const orderTable = new dynamodb.Table(this, "SageExampleTable", {
      partitionKey: { name: "pk", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "sk", type: dynamodb.AttributeType.STRING },
      tableName: `orderTable`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // notification success topic
    const successTopic = new sns.Topic(this, "successTopic", {
      displayName: "Notification Success Topic",
    });

    // notification failure topic
    const failureTopic = new sns.Topic(this, "failureTopic", {
      displayName: "Notification Failure Topic",
    });

    // lambdas
    const layers = new lambda.LayerVersion(this, "layers", {
      code: lambda.Code.fromAsset("../../lambdas/layer"),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      compatibleRuntimes: [lambda.Runtime.PYTHON_3_8]
    })
    // const layers = new pythonLambda.PythonLayerVersion(this, "layers", {
    //   compatibleRuntimes: [lambda.Runtime.PYTHON_3_8],
    //   entry: '../../lambdas/layer',
    //   layerVersionName: "cloud-octo-shared",
    // });
    // 1.
    const createOrderLambda = lambdaFactory(
      this,
      "createOrderLambda",
      "createOrder",
      undefined,
      true,
      orderTable,
      [layers],
    );
    orderTable.grantWriteData(createOrderLambda);
    
    // 2.
    // const processPaymentLambda = lambdaFactory(
    //   this,
    //   "processPaymentLambda",
    //   "processPayment",
    //   undefined,
    //   true,
    //   undefined,
    //   [layers]
    // );
    // // 2. Failed
    // const setOrderFailedLambda = lambdaFactory(
    //   this,
    //   "setOrderFailedLambda",
    //   "setOrderFailed",
    //   undefined,
    //   true,
    //   orderTable,
    //   [layers]
    // );
    // // 3.
    // const updateCustomerAccountLambda = lambdaFactory(
    //   this,
    //   "updateCustomerAccountLambda",
    //   "updateCustomerAccount",
    //   undefined,
    //   true,
    //   undefined,
    //   [layers]
    // );
    // // 3. Failed
    // const refundCustomerLambda = lambdaFactory(
    //   this,
    //   "refundCustomerLambda",
    //   "setOrderFailedLambda",
    //   undefined,
    //   true,
    //   undefined,
    //   [layers]
    // );
    // // 4.
    // const setOrderCompletedLambda = lambdaFactory(
    //   this,
    //   "setOrderCompletedLambda",
    //   "setOrderCompleted",
    //   undefined,
    //   true,
    //   orderTable,
    //   [layers]
    // );

    // end failed state
    const orderFailed = new sfn.Fail(
      this,
      "Sorry, we could not place your order"
    );

    // notify failure
    const notifyFailure = new tasks.SnsPublish(this, "notifyFailure", {
      topic: failureTopic,
      message: {
        type: sfn.InputType.OBJECT,
        value: {
          literal: "literal",
          SomeInput: sfn.JsonPath.stringAt("$.someField"),
        },
      },
    })
      .addRetry({ maxAttempts: 1 })
      .next(orderFailed);

    // 1. Create Order
    const createOrder = new tasks.LambdaInvoke(this, "createOrder", {
      lambdaFunction: createOrderLambda,
      outputPath: "$.CreateOrderResult",
    }).addCatch(notifyFailure, {
      resultPath: "$.CreateOrderError",
    });

    // 2. process payment
    // const setOrderFailed = new tasks.LambdaInvoke(this, "setOrderFailed", {
    //   lambdaFunction: setOrderFailedLambda,
    //   outputPath: "$.SetOrderFailedResult",
    // })
    //   .addRetry({ maxAttempts: 1 })
    //   .next(notifyFailure);

    // const processPayment = new tasks.LambdaInvoke(this, "createOrder", {
    //   lambdaFunction: processPaymentLambda,
    //   outputPath: "$.ProcessPaymentResult",
    // }).addCatch(setOrderFailed, {
    //   resultPath: "$.ProcessPaymentError",
    // });

    // // refund customer
    // const refundCustomer = new tasks.LambdaInvoke(this, "refundCustomer", {
    //   lambdaFunction: refundCustomerLambda,
    //   outputPath: "$.RefundCustomerResult",
    // })
    //   .addRetry({ maxAttempts: 1 })
    //   .next(notifyFailure);

    // // 3. update customer account
    // const updateCustomerAccount = new tasks.LambdaInvoke(
    //   this,
    //   "updateCustomerAccount",
    //   {
    //     lambdaFunction: updateCustomerAccountLambda,
    //     outputPath: "$.UpdateCustomerResult",
    //   }
    // ).addCatch(refundCustomer, {
    //   resultPath: "$.UpdateCustomerError",
    // });

    // // 4. set order completed
    // const setOrderCompleted = new tasks.LambdaInvoke(
    //   this,
    //   "setOrderCompleted",
    //   {
    //     lambdaFunction: setOrderCompletedLambda,
    //     outputPath: "$.SetOrderCompletedResult",
    //   }
    // );

    // // 5. notify success
    // const notifySuccess = new tasks.SnsPublish(this, "notifySuccess", {
    //   topic: successTopic,
    //   message: {
    //     type: sfn.InputType.OBJECT,
    //     value: {
    //       literal: "literal",
    //       SomeInput: sfn.JsonPath.stringAt("$.someField"),
    //     },
    //   },
    // });

    // 6. order succeeded
    const orderSucceeded = new sfn.Succeed(this, "Your order has been placed!");

    const saga = new sfn.StateMachine(this, "Saga", {
      definition: sfn.Chain.start(createOrder),
      // .next(processPayment)
      // .next(updateCustomerAccount)
      // .next(setOrderCompleted)
      // .next(notifySuccess)
      // .next(orderSucceeded),
      timeout: cdk.Duration.minutes(5) as any,
    });
    // defines an AWS Lambda resource to connect to our API Gateway and kick
    // off our step function
    const startLambda = lambdaFactory(
      this,
      "startLambda",
      "startLambda",
      {
        STATE_MACHINE_ARN: saga.stateMachineArn
      },
      true,
      undefined,
      [layers],
    );

    saga.grantStartExecution(startLambda);

    /**
     * Simple API Gateway proxy integration
     *
     * defines an API Gateway REST API resource backed by our "stateMachineLambda" function.
     */
    new apigateway.LambdaRestApi(this, "SagaPattern", {
      handler: startLambda,
    });
  }
}