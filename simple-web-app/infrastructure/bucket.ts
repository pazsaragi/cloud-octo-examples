import { Construct } from 'constructs'
import { IAM, S3 } from './.gen/providers/aws'


export interface IBucketConstructProps {
    bucketName: string;
}


export class BucketConstruct extends Construct {

    bucket: S3.S3Bucket

    /**
     * 
     * @param scope The scope to attach the Bucket construct to.
     * @param id An unique id used to distinguish constructs.
     * @param props 
     */
    constructor(scope: Construct, id: string, props: IBucketConstructProps) {
        super(scope, id)

        this.bucket = new S3.S3Bucket(scope, id+"bucket", {
            bucket: props.bucketName,
            policy: new IAM.DataAwsIamPolicyDocument(this, "s3_bucket_policy", {
                statement: [{
                  actions: ["s3:GetObject"],
                  resources: [
                    `arn:aws:s3:::${props.bucketName}/*`,
                  ],
                  principals: [{
                    identifiers: ["*"],
                    type: "*",
                  }],
                }],
              }).json,
            website: {
                indexDocument: 'index.html',
                errorDocument: 'index.html'
            },
            forceDestroy: true
        });



    
  }
}
