import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecr from '@aws-cdk/aws-ecr';
import * as ecs from '@aws-cdk/aws-ecs';
import * as ecsPatterns from '@aws-cdk/aws-ecs-patterns';
import * as ecrAssets from '@aws-cdk/aws-ecr-assets';
import * as path from "path";
import * as route53 from "@aws-cdk/aws-route53";

export class CloudOctoInfraStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const repository = new ecr.Repository(this, 'Repository', {
      imageScanOnPush: true,
      repositoryName: 'cloud-octo',
      lifecycleRules: [
        {
          maxImageCount: 3,
        }
      ]
    });

    const image = new ecrAssets.DockerImageAsset(this, 'CDKDockerImage', {
      directory: '../../services/monolith',
    });

    const vpc = new ec2.Vpc(this, 'VPC', {
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: "ingress",
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: "application",
          subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
        },
      ]
    });

    const cluster = new ecs.Cluster(this, 'Cluster', {
      vpc,
      clusterName: 'CloudOcto'
    });

    const loadBalancedFargateService = new ecsPatterns.ApplicationLoadBalancedFargateService(this, 'Service', {
      cluster,
      memoryLimitMiB: 512,
      cpu: 256,
      taskImageOptions: {
        image: ecs.ContainerImage.fromEcrRepository(repository),
        logDriver: new ecs.AwsLogDriver({ streamPrefix: "monolith", mode: ecs.AwsLogDriverMode.NON_BLOCKING }),
      },
    });
    
    loadBalancedFargateService.targetGroup.configureHealthCheck({
      path: "/",
    });
  }
}
