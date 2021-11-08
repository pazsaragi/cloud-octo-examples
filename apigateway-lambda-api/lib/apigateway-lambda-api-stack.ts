import * as cdk from "@aws-cdk/core";
import { MicroServiceStack } from "./microservice-construct";

/**
 * Creates an API that integrates directly with DynamoDB
 */
export class ApigatewayLambdaApiStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const orderService = new MicroServiceStack(this, "OrdersService", {
      serviceName: "Orders",
    });

    const productService = new MicroServiceStack(this, "ProductService", {
      serviceName: "Products",
    });
  }
}
