#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { UiStack } from "./lib/ui.stack";
import {
  BaseStackProps,
  PipelineStackProps,
  UiStackProps,
  EnvironmentStage
} from "./lib/stack-props";
import { PipelineStack } from "./lib/pipeline.stack";

const app = new cdk.App();

const appName = "image-gallery";
const branch = "master";
const environmentStage = "production";

const stackProps: BaseStackProps = {
  appName: appName,
  stage: EnvironmentStage.PRODUCTION,
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

const uiStackProps = stackProps as UiStackProps;
const uiStack = new UiStack(app, appName + "-ui", uiStackProps);

const pipelineStackProps = stackProps as PipelineStackProps;
pipelineStackProps.siteBucket = uiStack.siteBucket;

const pipelineStack = new PipelineStack(
  app,
  appName + "-pipeline",
  pipelineStackProps
);
