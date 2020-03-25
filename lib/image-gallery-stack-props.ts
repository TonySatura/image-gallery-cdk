import * as cdk from "@aws-cdk/core";

export interface ImageGalleryStackProps extends cdk.StackProps {
  readonly branchName: string;
  readonly rootDomain: string;
  readonly baseDomain: string;
}