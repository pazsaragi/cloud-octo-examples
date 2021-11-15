import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

// VPC
const vpc = new awsx.ec2.Vpc("main", {
    cidrBlock: "10.0.0.0/24"
})

// ECS cluster
const cluster = new awsx.ecs.Cluster("main", {
    name: 'cluster',
    vpc,
})

// Create a load balancer on port 80 and spin up two instances of Nginx.
const lb = new awsx.lb.ApplicationListener("alb", { port: 80 });

const ecrRepo = new awsx.ecr.Repository("repository", {
    lifeCyclePolicyArgs: {
        rules: [{
            selection: "any",
            maximumNumberOfImages: 2,
        }],
    },
})

const taskDefinition = new awsx.ecs.FargateTaskDefinition("task", {
    containers: {
        apigateway: {
            image: awsx.ecs.Image.fromDockerBuild(ecrRepo.repository, {
                context: "../services/backend",
                dockerfile: "../services/backend/Dockerfile",
                cacheFrom: { stages: [ "build" ]}
            })
        }
    }
})

const apigateway = new awsx.ecs.FargateService("apigateway", {
    cluster,
    taskDefinition,
    taskDefinitionArgs: {
        containers: {
            nginx: {
                image: "nginx",
                memory: 128,
                portMappings: [ lb ],
            },
        },
    },
    desiredCount: 2,
})

// Export the load balancer's address so that it's easy to access.
export const url = lb.endpoint.hostname;