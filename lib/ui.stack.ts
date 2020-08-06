import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";
import * as cloudfront from "@aws-cdk/aws-cloudfront";
import { UiStackProps } from "./stack-props";

export class UiStack extends cdk.Stack {
  public readonly siteBucket: s3.Bucket;

  constructor(scope: cdk.Construct, id: string, props: UiStackProps) {
    super(scope, id, props);

    // const hostedZone = route53.HostedZone.fromLookup(this, "AwsomeList-RootDomainZone", {
    //     domainName: props.rootDomain
    // });

    this.siteBucket = new s3.Bucket(this, "site-", {
      blockPublicAccess: {
        blockPublicAcls: true,
        ignorePublicAcls: true,
        blockPublicPolicy: false,
        restrictPublicBuckets: false,
      },
      websiteIndexDocument: "index.html",
      publicReadAccess: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const siteDistribution = new cloudfront.CloudFrontWebDistribution(
      this,
      "site-distribution",
      {
        comment: "Website distribution for " + props.appName,
        priceClass: cloudfront.PriceClass.PRICE_CLASS_ALL,
        // aliasConfiguration: {
        //     acmCertRef: certificateArn,
        //     names: [uiSiteDomain],
        //     sslMethod: cloudfront.SSLMethod.SNI,
        //     securityPolicy: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2018
        // },
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: this.siteBucket,
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
