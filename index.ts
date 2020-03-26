#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { ImageGalleryUiStack } from "./lib/image-gallery-ui-stack";
import { ImageGalleryStackProps } from "./lib/image-gallery-stack-props";
import { ImageGalleryPipelineStack } from "./lib/image-gallery-pipeline-stack";

const app = new cdk.App();

const appName = "image-gallery";
const branch = "master";
const environmentStage = "production";

const stackProps: ImageGalleryStackProps = {
  appName: appName,
  repository: {
    owner: "TonySatura",
    name: "image-gallery-ng",
    branch: branch
  },
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  },
  tags: {
    name: appName,
    environment: environmentStage,
    owner: "t.satura@icloud.com",
    branch: branch
  }
};

const uiStack = new ImageGalleryUiStack(app, appName + "-ui", stackProps);
const pipelineStack = new ImageGalleryPipelineStack(
  app,
  appName + "-pipeline",
  stackProps,
  uiStack.siteBucket
);
