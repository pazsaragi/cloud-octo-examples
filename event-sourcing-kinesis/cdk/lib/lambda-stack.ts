import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";

interface Props {
  environment: string;
  name: string;
}

export class LambdaStack extends cdk.Construct {
  lambda: lambda.Function;
  constructor(scope: cdk.Construct, id: string, props: Props) {
    super(scope, id);

    this.lambda = new lambda.Function(this,
        props.name+"lambda",
        {
          runtime: lambda.Runtime.PYTHON_3_8,
          handler: "lambda_handler.handler",
          code: lambda.Code.fromAsset(`../services/${props.name}`, {
            bundling: {
              image: lambda.Runtime.PYTHON_3_8.bundlingImage,
              command: [
                "bash",
                "-c",
                "pip install -r requirements.txt -t /asset-output && cp -au . /asset-output",
              ],
            },
          }),
          functionName: props.name,
        }
      );

  }
}
