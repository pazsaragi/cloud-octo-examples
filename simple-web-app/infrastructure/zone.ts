import { Construct } from "constructs"
import { Route53 } from './.gen/providers/aws'

/**
 * Represents the properties of the SSL construct.
 * @property awsUsEast1Provider The AWS US East 1 provider required to create ACM certificates for CloudFront.
 * @property domainNames The domain names that need to be covered by the ACM certificate.
 * @property resourceNamesPrefix An unique custom prefix used to avoid name colision with existing resources.
 */
export interface IHostedZoneProps {
    domainName: string;
    cdnDomainName: string;
}

/**
 * Represents the ACM certificate used to add SSL to your website.
 * @class
 * @extends Construct
 */
export class HostedZoneConstruct extends Construct {
  zone: Route53.Route53Zone
  cnameRecord: Route53.Route53Record
  /**
   * Creates a Hosted Zone construct.
   * @param scope The scope to attach the SSL construct to.
   * @param id An unique id used to distinguish constructs.
   * @param props The SSL construct properties.
   */
  constructor(scope: Construct, id: string, props: IHostedZoneProps) {
    super(scope, id)

    this.zone = new Route53.Route53Zone(scope, id+"zone", {
        name: props.domainName,
    })

    this.cnameRecord = new Route53.Route53Record(scope, id+"record", {
        name: 'app.'+props.domainName,
        type: 'A',
        zoneId: this.zone.id,
        alias: [
            {
                name: props.cdnDomainName,
                zoneId: this.zone.id,
                evaluateTargetHealth: false
            }
        ]
    })

  }
}
