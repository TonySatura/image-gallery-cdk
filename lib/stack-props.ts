import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";

export interface BaseStackProps extends cdk.StackProps {
  appName: string;
  stage: EnvironmentStage;
  repository: RepositoryProps;
}

export interface UiStackProps extends BaseStackProps {}

export interface PipelineStackProps extends BaseStackProps {
  siteBucket: s3.Bucket;
}

export interface RepositoryProps {
  owner: string;
  name: string;
  branch: string;
}

export enum EnvironmentStage {
  DEV = "development",
  STAGING = "staging",
  PRODUCTION = "production"
}
