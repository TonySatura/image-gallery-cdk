import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";

export interface BaseStackProps extends cdk.StackProps {
  appName: string;
}

export interface UiStackProps extends BaseStackProps {
  domain: string;
  subdomain: string;
}

export interface PipelineStackProps extends BaseStackProps {
  repository: RepositoryProps;
  siteBucket: s3.Bucket;
}

export interface RepositoryProps {
  owner: string;
  name: string;
  branch: string;
}
