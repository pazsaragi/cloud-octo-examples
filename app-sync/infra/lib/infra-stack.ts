import * as cdk from '@aws-cdk/core';
import * as appsync from '@aws-cdk/aws-appsync';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as lambda from '@aws-cdk/aws-lambda'
import * as cognito from '@aws-cdk/aws-cognito'
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';

// https://github.com/aws/aws-cdk/issues/6772#issuecomment-661376736
export class InfraStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const userPool = new cognito.UserPool(this, 'cdk-products-user-pool', {
      selfSignUpEnabled: true,
      accountRecovery: cognito.AccountRecovery.PHONE_AND_EMAIL,
      userVerification: {
        emailStyle: cognito.VerificationEmailStyle.CODE
      },
      autoVerify: {
        email: true
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true
        }
      }
    })

    const userPoolClient = new cognito.UserPoolClient(this, "UserPoolClient", {
      userPool
    })

    const api = new appsync.GraphqlApi(this, 'cdk-product-app', {
      name: "cdk-product-api",
      logConfig: {
        fieldLogLevel: appsync.FieldLogLevel.ALL,
      },
      schema: appsync.Schema.fromAsset('../graphql/schema.graphql'),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
          apiKeyConfig: {
            expires: cdk.Expiration.after(cdk.Duration.days(365)) as any
          }
        },
        additionalAuthorizationModes: [{
          authorizationType: appsync.AuthorizationType.USER_POOL,
          userPoolConfig: {
            userPool,
          }
        }]
      },
    })

    const productLambda = new NodejsFunction(this as any, 'AppSyncProductHandler', {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'handler',
      entry: './backend/main.ts',
      memorySize: 1024,
      bundling: {
        externalModules: [
          'aws-sdk', // Use the 'aws-sdk' available in the Lambda runtime
        ],
      },
    })
    
    // Set the new Lambda function as a data source for the AppSync API
    const lambdaDs = api.addLambdaDataSource('lambdaDatasource', productLambda)

    lambdaDs.createResolver({
      typeName: "Query",
      fieldName: "getProductById"
    })
    
    lambdaDs.createResolver({
      typeName: "Query",
      fieldName: "listProducts"
    })
    
    lambdaDs.createResolver({
      typeName: "Query",
      fieldName: "productsByCategory"
    })
    
    lambdaDs.createResolver({
      typeName: "Mutation",
      fieldName: "createProduct"
    })
    
    lambdaDs.createResolver({
      typeName: "Mutation",
      fieldName: "deleteProduct"
    })
    
    lambdaDs.createResolver({
      typeName: "Mutation",
      fieldName: "updateProduct"
    })
    
    const productTable = new dynamodb.Table(this, 'CDKProductTable', {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING,
      },
    })
    
    // Add a global secondary index to enable another data access pattern
    productTable.addGlobalSecondaryIndex({
      indexName: "productsByCategory",
      partitionKey: {
        name: "category",
        type: dynamodb.AttributeType.STRING,
      }
    })
    
    // Enable the Lambda function to access the DynamoDB table (using IAM)
    productTable.grantFullAccess(productLambda)
    
    // Create an environment variable that we will use in the function code
    productLambda.addEnvironment('PRODUCT_TABLE', productTable.tableName)
  }
}
