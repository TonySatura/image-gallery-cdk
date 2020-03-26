#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { ImageGalleryUiStack } from "./lib/image-gallery-ui-stack";
import { ImageGalleryStackProps } from "./lib/image-gallery-stack-props";
import { ImageGalleryPipelineStack } from "./lib/image-gallery-pipeline-stack";

const app = new cdk.App();
const appName = "image-gallery";
const stackProps: ImageGalleryStackProps = {
  appName: appName,
  repository: {
    owner: "TonySatura",
    name: "image-gallery-ng",
    branch: "master"
  },
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  },
  tags: {
    //   service: "n/a",
    name: appName,
    //   environment: "dev",
    //   platform: "awin",
    owner: "t.satura@icloud.com"
    //   application: "Proof of concept to test out CI/CD mechanisms",
    //   maid_offHours: "n/a",
    //   costCentre: "n/a",
    //   branch: branch,
    //   tagVersion: "1"
  }
};

const uiStack = new ImageGalleryUiStack(app, "ImageGalleryUiStack", stackProps);
const pipelineStack = new ImageGalleryPipelineStack(
  app,
  "ImageGalleryPipelineStack",
  stackProps,
  uiStack.siteBucket
);
