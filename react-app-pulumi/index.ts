import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

// Create an AWS resource (S3 Bucket)
const bucket = new aws.s3.Bucket("react-app-pulumi", {
    website: {
        errorDocument: 'index.html',
        indexDocument: 'index.html',
    }
});

const originAccessIdentity = new aws.cloudfront.OriginAccessIdentity(
    'originAccessIdentity',
    {
      comment: `Access to ${bucket.bucketDomainName}`
    }
  );

const cdn = new aws.cloudfront.Distribution("app-dstribution", {
    comment: bucket.bucketDomainName,
    defaultCacheBehavior: {
        allowedMethods: ['GET', 'HEAD'],
        cachedMethods: ['GET', 'HEAD'],
        defaultTtl: 3600,
        forwardedValues: {
          cookies: {
            forward: 'none'
          },
          queryString: false
        },
        maxTtl: 86400,
        minTtl: 0,
        targetOriginId: bucket.arn,
        viewerProtocolPolicy: 'redirect-to-https'
      },
      defaultRootObject: 'index.html',
  enabled: true,
  isIpv6Enabled: true,
  origins: [
    {
      domainName: bucket.bucketRegionalDomainName,
      originId: bucket.arn,
      s3OriginConfig: {
        originAccessIdentity: originAccessIdentity.cloudfrontAccessIdentityPath
      }
    }
  ],
  priceClass: 'PriceClass_All',
  restrictions: {
    geoRestriction: {
      restrictionType: 'none'
    }
  },
  customErrorResponses: [
    { errorCode: 404, responseCode: 200, responsePagePath: '/index.html' },
    { errorCode: 403, responseCode: 200, responsePagePath: '/index.html' }
  ],
  viewerCertificate: {
    cloudfrontDefaultCertificate: true
  }
});


  function publicReadPolicyForBucket(bucketArn: string, originAccessArn:string) {
    return JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Sid: '1',
          Effect: 'Allow',
          Principal: {
            AWS: [`${originAccessArn}`]
          },
          Action: ['s3:GetObject'],
          Resource: [`${bucketArn}/*`]
        }
      ]
    });
  }
  
  const bucketPolicy = new aws.s3.BucketPolicy(`${bucket.bucketPrefix}-policy`, {
    bucket: bucket.bucket,
    policy: pulumi
      .all([bucket.arn, originAccessIdentity.iamArn])
      .apply(([bucketArn, originAccessArn]) =>
        publicReadPolicyForBucket(bucketArn, originAccessArn)
      )
  });
  
  // Optional, for future StackReference use
  export const bucketName = bucket.id;
  export const cloudfrontDistribution = cdn;