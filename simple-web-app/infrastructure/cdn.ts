import { Token } from 'cdktf'
import { Construct } from 'constructs'
import { CloudFront, ACM, S3 } from './.gen/providers/aws'

/**
 * Represents the properties of the CDN construct.
 * @property acmCertificate The ACM certificate created for your website.
 * @property domainNames The domain names covered by the ACM certificate.
 * @property enableHttps Do HTTPS needs to be enabled?
 * @property websiteS3Bucket The S3 bucket containing your website source code.
 */
export interface ICloudfrontConstructProps {
    acmCertificate: ACM.AcmCertificate;
    domainNames: string[];
    enableHttps: boolean;
    bucketName: string;
    websiteS3Bucket: S3.S3Bucket;
  }


export class CloudfrontConstruct extends Construct {
    cloudfrontDistribution: CloudFront.CloudfrontDistribution

    /**
     * 
     * @param scope The scope to attach the Bucket construct to.
     * @param id An unique id used to distinguish constructs.
     * @param props 
     */
    constructor(scope: Construct, id: string, props: ICloudfrontConstructProps) {
        super(scope, id)

        const websiteOriginID = props.bucketName

        this.cloudfrontDistribution = new CloudFront.CloudfrontDistribution(this, "cloudfront_distribution", {
            enabled: true,
            defaultRootObject: "index.html",
            aliases: props.enableHttps ? props.domainNames : undefined,
            origin: [{
              domainName: props.websiteS3Bucket.bucketRegionalDomainName,
              originId: websiteOriginID,
            }],
            customErrorResponse: [{
              // If the routing is managed by a SPA framework
              // all paths must be forwarded to "index.html".
              // If the object isn’t in the bucket, S3 returns a 403 error.
              // Must match "errorDocument" website bucket property.
              errorCode: 403,
              responseCode: 200,
              responsePagePath: "/index.html",
            }],
            defaultCacheBehavior: {
                allowedMethods: ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"],
                cachedMethods: ["GET", "HEAD"],
                targetOriginId: websiteOriginID,
                viewerProtocolPolicy: "redirect-to-https",
                forwardedValues: {
                    queryString: false,
                    cookies: {
                        forward: "none"
                    }
                }
            },
            restrictions: {
              geoRestriction: {
                restrictionType: "none",
              },
            },
            // HTTPS activation is a two-step process because
            // ACM certificates need to be "issued"
            // before attaching to a Cloudfront distribution
            viewerCertificate: props.enableHttps ? {
              acmCertificateArn: Token.asString(props.acmCertificate.id),
              sslSupportMethod: "sni-only",
            } : {
              cloudfrontDefaultCertificate: true,
            },
            dependsOn: [
              props.websiteS3Bucket,
            ],
          })
    
  }
}
