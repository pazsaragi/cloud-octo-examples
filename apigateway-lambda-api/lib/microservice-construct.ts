import * as cdk from "@aws-cdk/core";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as apigateway from "@aws-cdk/aws-apigateway";
import * as iam from "@aws-cdk/aws-iam";

interface Props {
  serviceName: string;
}

export class MicroServiceStack extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, props: Props) {
    super(scope, id);
    const { serviceName } = props;

    const dynamoTable = new dynamodb.Table(this, serviceName + "table", {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: `pk`,
        type: dynamodb.AttributeType.STRING,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      tableName: serviceName,
    });

    const deletePolicy = new iam.Policy(this, serviceName + "deletePolicy", {
      statements: [
        new iam.PolicyStatement({
          actions: ["dynamodb:DeleteItem"],
          effect: iam.Effect.ALLOW,
          resources: [dynamoTable.tableArn],
        }),
      ],
    });

    const getPolicy = new iam.Policy(this, serviceName + "getPolicy", {
      statements: [
        new iam.PolicyStatement({
          actions: ["dynamodb:GetItem"],
          effect: iam.Effect.ALLOW,
          resources: [dynamoTable.tableArn],
        }),
      ],
    });

    const putPolicy = new iam.Policy(this, serviceName + "putPolicy", {
      statements: [
        new iam.PolicyStatement({
          actions: ["dynamodb:PutItem"],
          effect: iam.Effect.ALLOW,
          resources: [dynamoTable.tableArn],
        }),
      ],
    });

    const scanPolicy = new iam.Policy(this, serviceName + "scanPolicy", {
      statements: [
        new iam.PolicyStatement({
          actions: ["dynamodb:Scan"],
          effect: iam.Effect.ALLOW,
          resources: [dynamoTable.tableArn],
        }),
      ],
    });

    const deleteRole = new iam.Role(this, serviceName + "deleteRole", {
      assumedBy: new iam.ServicePrincipal("apigateway.amazonaws.com"),
    });
    deleteRole.attachInlinePolicy(deletePolicy);
    const getRole = new iam.Role(this, serviceName + "getRole", {
      assumedBy: new iam.ServicePrincipal("apigateway.amazonaws.com"),
    });
    getRole.attachInlinePolicy(getPolicy);
    const putRole = new iam.Role(this, serviceName + "putRole", {
      assumedBy: new iam.ServicePrincipal("apigateway.amazonaws.com"),
    });
    putRole.attachInlinePolicy(putPolicy);
    const scanRole = new iam.Role(this, serviceName + "scanRole", {
      assumedBy: new iam.ServicePrincipal("apigateway.amazonaws.com"),
    });
    scanRole.attachInlinePolicy(scanPolicy);

    const api = new apigateway.RestApi(this, `${serviceName}Api`, {
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
      },
      restApiName: `${serviceName} Service`,
    });

    const errorResponses = [
      {
        selectionPattern: "400",
        statusCode: "400",
        responseTemplates: {
          "application/json": `{
            "error": "Bad input!"
          }`,
        },
      },
      {
        selectionPattern: "5\\d{2}",
        statusCode: "500",
        responseTemplates: {
          "application/json": `{
            "error": "Internal Service Error!"
          }`,
        },
      },
    ];

    const integrationResponses = [
      {
        statusCode: "200",
      },
      ...errorResponses,
    ];

    const allResources = api.root.addResource(serviceName.toLocaleLowerCase());

    const oneResource = allResources.addResource("{id}");

    const getAllIntegration = new apigateway.AwsIntegration({
      action: "Scan",
      options: {
        credentialsRole: scanRole,
        integrationResponses,
        requestTemplates: {
          "application/json": `{
              "TableName": "${serviceName}"
            }`,
        },
      },
      service: "dynamodb",
    });

    const createIntegration = new apigateway.AwsIntegration({
      action: "PutItem",
      options: {
        credentialsRole: putRole,
        integrationResponses: [
          {
            statusCode: "200",
            responseTemplates: {
              "application/json": `{
                "requestId": "$context.requestId"
              }`,
            },
          },
          ...errorResponses,
        ],
        requestTemplates: {
          "application/json": `{
              "Item": {
                "pk": {
                  "S": "$context.requestId"
                },
                "Name": {
                  "S": "$input.path('$.name')"
                }
              },
              "TableName": "${serviceName}"
            }`,
        },
      },
      service: "dynamodb",
    });

    const deleteIntegration = new apigateway.AwsIntegration({
      action: "DeleteItem",
      options: {
        credentialsRole: deleteRole,
        integrationResponses,
        requestTemplates: {
          "application/json": `{
              "Key": {
                "pk": {
                  "S": "$method.request.path.id"
                }
              },
              "TableName": "${serviceName}"
            }`,
        },
      },
      service: "dynamodb",
    });

    const getIntegration = new apigateway.AwsIntegration({
      action: "GetItem",
      options: {
        credentialsRole: getRole,
        integrationResponses,
        requestTemplates: {
          "application/json": `{
              "Key": {
                "pk": {
                  "S": "$method.request.path.id"
                }
              },
              "TableName": "${serviceName}"
            }`,
        },
      },
      service: "dynamodb",
    });

    const updateIntegration = new apigateway.AwsIntegration({
      action: "PutItem",
      options: {
        credentialsRole: putRole,
        integrationResponses,
        requestTemplates: {
          "application/json": `{
              "Item": {
                "pk": {
                  "S": "$method.request.path.id"
                },
                "Name": {
                  "S": "$input.path('$.name')"
                }
              },
              "TableName": "${serviceName}"
            }`,
        },
      },
      service: "dynamodb",
    });

    const methodOptions = {
      methodResponses: [
        { statusCode: "200" },
        { statusCode: "400" },
        { statusCode: "500" },
      ],
    };

    allResources.addMethod("GET", getAllIntegration, methodOptions);
    allResources.addMethod("POST", createIntegration, methodOptions);

    oneResource.addMethod("DELETE", deleteIntegration, methodOptions);
    oneResource.addMethod("GET", getIntegration, methodOptions);
    oneResource.addMethod("PUT", updateIntegration, methodOptions);
  }
}
