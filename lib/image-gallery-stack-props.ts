import * as cdk from "@aws-cdk/core";

export interface ImageGalleryStackProps extends cdk.StackProps {
  appName: string;
  repository: {
    owner: string;
    name: string;
    branch: string;
  };
}
