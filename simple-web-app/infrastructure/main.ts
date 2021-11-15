import { Construct } from 'constructs'
import { App, TerraformStack, TerraformOutput, S3Backend } from 'cdktf'
import { AwsProvider } from './.gen/providers/aws'
import { BucketConstruct } from "./bucket";
import { CloudfrontConstruct } from "./cdn";
import { CertificateConstruct } from './certificate';
import { HostedZoneConstruct } from './zone';

class MyStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id)

    new AwsProvider(this, 'aws', {
      region: 'eu-west-2',
    });

    // To assign an ACM certificate
    // to a CloudFront distribution,
    // we must request the certificate
    // in the US East (N. Virginia) Region
    const awsUsEast1Provider = new AwsProvider(this, "aws_acm", {
      alias: "aws_acm",
      region: "us-east-1",
    });

    const awsS3BackendKey = process.env.KEY_TO_STATE
    const awsS3BackendBucket = process.env.STATE_FILE_BUCKET
    const awsS3BackendDynamodbTable = process.env.LOCK_TABLE_NAME

    new S3Backend(this, {
      key: awsS3BackendKey as string,
      bucket: awsS3BackendBucket as string,
      dynamodbTable: awsS3BackendDynamodbTable,
      encrypt: true,
      region: 'eu-west-2',
    })

    const bucketName = "simple-app-cdktf"

    const reactAppBucket = new BucketConstruct(this, "reactapp", {
      bucketName
    });

    const certificate = new CertificateConstruct(this, "cert", {
      awsUsEast1Provider,
      domainNames: ['*.cloudocto.com'],
      resourceNamesPrefix: 'app'
    })

    const cdn = new CloudfrontConstruct(this, "cdn", {
      bucketName,
      enableHttps: true,
      websiteS3Bucket: reactAppBucket.bucket,
      domainNames: ["app.cloudocto.com"],
      acmCertificate: certificate.acmCertificate
    });

    new HostedZoneConstruct(this, "hosted-zone", {
      domainName: 'cloudocto.com',
      cdnDomainName: cdn.cloudfrontDistribution.domainName
    })

    new TerraformOutput(this, "cloudfront_distribution_uri", {
      value: cdn.cloudfrontDistribution.domainName,
    })

    new TerraformOutput(this, "ssl_validation_dns_records", {
      value: certificate.validationDns,
    })
  }
}

const app = new App()
new MyStack(app, 'typescript-aws')
app.synth()