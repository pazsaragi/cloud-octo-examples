import AWS from "aws-sdk";
import { ENV } from "./constants";

AWS.config.update({
    region: process.env.AWS_REGION || 'eu-west-2',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

export const db = new AWS.DynamoDB();


  