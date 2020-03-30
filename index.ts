#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { UiStack } from "./lib/ui.stack";
import { PipelineStack } from "./lib/pipeline.stack";
import {
  BaseStackProps,
  PipelineStackProps,
  UiStackProps,
  EnvironmentStage,
  RepositoryProps
} from "./lib/stack-props";
import { ImagesStack } from "./lib/images.stack";

const app = new cdk.App();
var branchName = app.node.tryGetContext("branch");
if (!branchName) {
  branchName = "master";
}

var appName = "image-gallery";
var domain = "satura.de";
var subdomain = "";

const repository: RepositoryProps = {
  owner: "TonySatura",
  name: "image-gallery-ng",
  branch: branchName
};

var environment = EnvironmentStage.PRODUCTION;
if (branchName !== "master") {
  appName = appName + "-" + branchName;
  subdomain = branchName;
  environment = EnvironmentStage.DEVELOPMENT;
}

const baseStackProps: BaseStackProps = {
  appName: appName,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  },
  tags: {
    name: appName,
    environment: environment,
    repository: repository.name,
    owner: repository.owner,
    branch: repository.branch
  }
};

const imagesStack = new ImagesStack(app, appName + "-images", baseStackProps);

const uiStackProps = baseStackProps as UiStackProps;
uiStackProps.domain = domain;
uiStackProps.subdomain = subdomain;
const uiStack = new UiStack(app, appName + "-ui", uiStackProps);

const pipelineStackProps = baseStackProps as PipelineStackProps;
pipelineStackProps.repository = repository;
pipelineStackProps.siteBucket = uiStack.siteBucket;
new PipelineStack(app, appName + "-pipeline", pipelineStackProps);
