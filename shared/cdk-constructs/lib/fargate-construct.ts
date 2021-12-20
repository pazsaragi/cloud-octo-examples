import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as ecs from "@aws-cdk/aws-ecs";
import * as acm from "@aws-cdk/aws-certificatemanager";
import * as route53 from "@aws-cdk/aws-route53";
import * as elbv2 from "@aws-cdk/aws-elasticloadbalancingv2";
import * as ecsPatterns from "@aws-cdk/aws-ecs-patterns";

interface Props {
  serviceName: string;
  vpc: ec2.Vpc;
  environment: string;
  certificate: acm.ICertificate;
  zone: route53.IHostedZone;
  domainName: string;
}

/*
 * Construct that creates backend
 */
export class FargateBackendStack extends cdk.Construct {
  service: ecsPatterns.ApplicationLoadBalancedFargateService;
  constructor(scope: cdk.Construct, id: string, props: Props) {
    super(scope, id);
    const defaultId = `${props.environment}-${props.serviceName}`;

    this.service = new ecsPatterns.ApplicationLoadBalancedFargateService(this, defaultId+"-albfs", {
      certificate: props.certificate,
      desiredCount: 2,
      loadBalancerName: defaultId+"-lb",
      domainName: props.domainName,
      domainZone: props.zone,
      sslPolicy: elbv2.SslPolicy.RECOMMENDED,
      serviceName: defaultId+"-apigateway",
      vpc: props.vpc,
      publicLoadBalancer: true,
      redirectHTTP: true,
      cpu: 256,
      memoryLimitMiB: 512,
      taskImageOptions: {
        containerPort: 3000,
        logDriver: new ecs.AwsLogDriver({ streamPrefix: defaultId+"-apigateway", mode: ecs.AwsLogDriverMode.NON_BLOCKING }),
        image: ecs.ContainerImage.fromAsset('../services/apigateway'),
        environment:  {
              PORT: "3000",
        }
      }
    })
  }
}