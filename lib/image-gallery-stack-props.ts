import * as cdk from "@aws-cdk/core";

export interface ImageGalleryStackProps extends cdk.StackProps {
  appName: string;
  // TODO: Refactor modeling: Create subtypes
  repository: {
    owner: string;
    name: string;
    branch: string;
  };
}
