import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";
import * as iam from "@aws-cdk/aws-iam";
import * as cognito from "@aws-cdk/aws-cognito";
import { RemovalPolicy } from "@aws-cdk/core";
import { HttpMethods } from "@aws-cdk/aws-s3";
import { BaseStackProps } from "./stack-props";

export class ImageBucketStack extends cdk.Stack {
  public siteBucket: s3.Bucket;

  constructor(scope: cdk.Construct, id: string, props: BaseStackProps) {
    super(scope, id, props);

    const imageBucket = new s3.Bucket(this, "images", {
      blockPublicAccess: {
        blockPublicAcls: true,
        ignorePublicAcls: true,
        blockPublicPolicy: true,
        restrictPublicBuckets: true
      },
      removalPolicy: RemovalPolicy.DESTROY,
      cors: [
        {
          allowedHeaders: ["*"],
          allowedMethods: [HttpMethods.GET, HttpMethods.HEAD],
          allowedOrigins: ["*"]
        }
      ]
    });

    const identityPool = new cognito.CfnIdentityPool(this, "identityPool", {
      identityPoolName: props.appName + "-identityPool",
      allowUnauthenticatedIdentities: true
    });

    const unauthPolicy = new iam.Policy(this, "unauthPolicy", {
      policyName: props.appName + "unauth-policy",
      statements: [
        new iam.PolicyStatement({
          actions: ["s3:ListBucket"],
          resources: [imageBucket.bucketArn]
        })
      ]
    });

    const unauthRole = new iam.Role(this, "unauthRole", {
      roleName: props.appName + "_unauth_role",
      assumedBy: new iam.FederatedPrincipal("cognito-identity.amazonaws.com", {
        StringEquals: {
          "cognito-identity.amazonaws.com:aud": identityPool.ref
        }
      })
    });

    unauthPolicy.attachToRole(unauthRole);

    new cdk.CfnOutput(this, "bucketName", {
      value: imageBucket.bucketName
    });
    new cdk.CfnOutput(this, "identityPoolId", {
      value: identityPool.ref
    });
  }
}
