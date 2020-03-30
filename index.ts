#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { ImagesStack } from "./lib/images.stack";
import { UiStack } from "./lib/ui.stack";
import { PipelineStack } from "./lib/pipeline.stack";
import {
  BaseStackProps,
  PipelineStackProps,
  UiStackProps,
  RepositoryProps
} from "./lib/stack-props";
import { MASTER, EnvironmentStage } from "./lib/constants";
import { config } from "./config";

const app = new cdk.App();

var branchName = app.node.tryGetContext("branch");
if (!branchName) {
  branchName = MASTER;
}

var appName = config.appBaseName;
var subdomain = "";
var environment = EnvironmentStage.PRODUCTION;

if (branchName !== MASTER) {
  appName = appName + "-" + branchName;
  subdomain = branchName;
  environment = EnvironmentStage.DEVELOPMENT;
}

const repository: RepositoryProps = {
  owner: config.gitHubUser,
  name: config.gitHubRepo,
  branch: branchName
};

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

new ImagesStack(app, appName + "-images", baseStackProps);

const uiStackProps = baseStackProps as UiStackProps;
uiStackProps.domain = config.domain;
uiStackProps.subdomain = subdomain;
const uiStack = new UiStack(app, appName + "-ui", uiStackProps);

const pipelineStackProps = baseStackProps as PipelineStackProps;
pipelineStackProps.repository = repository;
pipelineStackProps.siteBucket = uiStack.siteBucket;
new PipelineStack(app, appName + "-pipeline", pipelineStackProps);
