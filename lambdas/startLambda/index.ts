import AWS from "aws-sdk";
import {APIGatewayProxyEventV2, APIGatewayProxyResult} from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';

const stepFunctions = new AWS.StepFunctions({
    region: 'eu-west-2'
});

export async function main(
    event: APIGatewayProxyEventV2, context: any, callback: any
  ): Promise<APIGatewayProxyResult> {
    console.log('event 👉', event);
    let order_status = 'processing';
    let order_id = uuidv4();
    let stateMachineArn = process.env.statemachine_arn;

    if(!stateMachineArn){
        console.error("Cannot find state machine ARN")
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'The holiday booking system is processing your order'
            })
        };
    }

    let input = {
        "order_id": order_id,
        "order_status": order_status,
    };
    
    const params: AWS.StepFunctions.StartExecutionInput = {
        stateMachineArn,
        input: JSON.stringify(input)
    };

    const response: APIGatewayProxyResult = await stepFunctions.startExecution(params).promise().then(() => {
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'The holiday booking system is processing your order'
            })
        };
    }).catch(e => {
        console.error(e)
        return {
            statusCode: 500,
            body: JSON.stringify({
            message: 'There was an error'
            })
        };
    });

    return response
}
