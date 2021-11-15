import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as pyLambda from "@aws-cdk/aws-lambda-python";
import * as dynamodb from "@aws-cdk/aws-dynamodb";

/**
 * Create a lambda
 *
 * @param scope
 * @param id
 * @param lambdaFolder
 * @param environment
 * @param table
 * @returns
 */
export const lambdaFactory = (
  scope: cdk.Stack,
  id: string,
  lambdaFolder: string,
  environment:
    | {
        [key: string]: string;
      }
    | undefined,
  pythonLambda?: boolean,
  table?: dynamodb.Table,
  layers?: lambda.ILayerVersion[] | undefined,
  handler?: string,
  ) => {
    let fn;
    if(pythonLambda){
      fn = new pyLambda.PythonFunction(scope, id, {
        runtime: lambda.Runtime.PYTHON_3_8,
        entry: "../../lambdas/" + lambdaFolder,
        index: 'lambda_handler.py',
        environment: {
          ...environment,
          TABLE: table?.tableName || "",
          SERVICE_NAME: id
        },
        handler: handler || "handler",
        layers,
      })
    } else {
      fn = new lambda.Function(scope, id, {
        runtime: lambda.Runtime.NODEJS_12_X,
        code: lambda.Code.fromAsset("../../lambdas/" + lambdaFolder),
        handler: handler || "lambda_handler.handler",
        environment: {
          ...environment,
          TABLE: table?.tableName || "",
          SERVICE_NAME: id
        },
        layers,
      });
    }
  

  return fn;
};
