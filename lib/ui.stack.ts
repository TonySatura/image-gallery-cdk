import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";
import * as cloudfront from "@aws-cdk/aws-cloudfront";
import * as iam from "@aws-cdk/aws-iam";
import { UiStackProps } from "./stack-props";

export class UiStack extends cdk.Stack {
  public readonly siteBucket: s3.Bucket;

  constructor(scope: cdk.Construct, id: string, props: UiStackProps) {
    super(scope, id, props);

    this.siteBucket = new s3.Bucket(this, "site-", {
      websiteIndexDocument: "index.html",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const cloudfrontOAI = new cloudfront.OriginAccessIdentity(this, "-OAI", {
      comment: "OAI for " + props.appName + " website.",
    });

    const cloudfrontS3Access = new iam.PolicyStatement();
    cloudfrontS3Access.addActions("s3:GetBucket*");
    cloudfrontS3Access.addActions("s3:GetObject*");
    cloudfrontS3Access.addActions("s3:List*");
    cloudfrontS3Access.addResources(this.siteBucket.bucketArn);
    cloudfrontS3Access.addResources(`${this.siteBucket.bucketArn}/*`);
    cloudfrontS3Access.addCanonicalUserPrincipal(
      cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId
    );

    this.siteBucket.addToResourcePolicy(cloudfrontS3Access);

    const siteDistribution = new cloudfront.CloudFrontWebDistribution(
      this,
      "site-distribution",
      {
        comment: "Website distribution for " + props.appName,
        priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: this.siteBucket,
              originAccessIdentity: cloudfrontOAI,
            },
            behaviors: [{ isDefaultBehavior: true }],
          },
        ],
        errorConfigurations: [
          {
            errorCode: 403,
            errorCachingMinTtl: 300,
            responsePagePath: "/index.html",
            responseCode: 200,
          },
          {
            errorCode: 404,
            errorCachingMinTtl: 300,
            responsePagePath: "/index.html",
            responseCode: 200,
          },
        ],
      }
    );

    new cdk.CfnOutput(this, "SiteURL", {
      value: "https://" + siteDistribution.domainName,
    });
  }
}
