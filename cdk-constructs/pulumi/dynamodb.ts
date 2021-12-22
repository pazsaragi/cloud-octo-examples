import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

export const ddbTable = new aws.dynamodb.Table("commandTable", {
    billingMode: "PAY_PER_REQUEST",
    hashKey: "pk",
    rangeKey: "sk",
    readCapacity: 1,
    writeCapacity: 1,
    streamEnabled: true,
    streamViewType: "NEW_IMAGE",
});


