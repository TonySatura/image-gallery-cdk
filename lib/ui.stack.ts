import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";
import * as s3deploy from "@aws-cdk/aws-s3-deployment";
import * as route53 from "@aws-cdk/aws-route53";
import * as acm from "@aws-cdk/aws-certificatemanager";
import * as route53targets from "@aws-cdk/aws-route53-targets/lib";
import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as codepipelineActions from "@aws-cdk/aws-codepipeline-actions";
import * as cloudfront from "@aws-cdk/aws-cloudfront";
import { UiStackProps } from "./stack-props";
import { RemovalPolicy } from "@aws-cdk/core";
import { PriceClass } from "@aws-cdk/aws-cloudfront";

export class UiStack extends cdk.Stack {
  public siteBucket: s3.Bucket;

  constructor(scope: cdk.Construct, id: string, props: UiStackProps) {
    super(scope, id, props);

    // const hostedZone = route53.HostedZone.fromLookup(this, "AwsomeList-RootDomainZone", {
    //     domainName: props.rootDomain
    // });

    const siteBucket = new s3.Bucket(this, "site", {
      blockPublicAccess: {
        blockPublicAcls: true,
        ignorePublicAcls: true,
        blockPublicPolicy: false,
        restrictPublicBuckets: false
      },
      websiteIndexDocument: "index.html",
      //websiteErrorDocument: "error.html",
      publicReadAccess: true,
      removalPolicy: RemovalPolicy.DESTROY
    });
    this.siteBucket = siteBucket;

    const siteDistribution = new cloudfront.CloudFrontWebDistribution(
      this,
      "site-distribution",
      {
        comment: "Website distribution for " + props.appName,
        priceClass: PriceClass.PRICE_CLASS_ALL,
        // aliasConfiguration: {
        //     acmCertRef: certificateArn,
        //     names: [uiSiteDomain],
        //     sslMethod: cloudfront.SSLMethod.SNI,
        //     securityPolicy: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2018
        // },
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: siteBucket
            },
            behaviors: [{ isDefaultBehavior: true }]
          }
        ],
        errorConfigurations: [
          {
            errorCode: 403,
            errorCachingMinTtl: 300,
            responsePagePath: "/index.html",
            responseCode: 200
          },
          {
            errorCode: 404,
            errorCachingMinTtl: 300,
            responsePagePath: "/index.html",
            responseCode: 200
          }
        ]
      }
    );

    new cdk.CfnOutput(this, "SiteURL", {
      value: "https://" + siteDistribution.domainName
    });
  }
}
