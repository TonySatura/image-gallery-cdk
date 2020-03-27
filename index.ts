#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { UiStack } from "./lib/ui.stack";
import {
  BaseStackProps,
  PipelineStackProps,
  UiStackProps,
  EnvironmentStage,
  RepositoryProps
} from "./lib/stack-props";
import { PipelineStack } from "./lib/pipeline.stack";

//#region === Initialise stack props ===
const environment = EnvironmentStage.DEVELOPMENT;
const appName = "image-gallery-" + environment;
const domain = "satura.de";
const subdomain = "ig";

const repository: RepositoryProps = {
  owner: "TonySatura",
  name: "image-gallery-ng",
  branch: "master"
};

const baseStackProps: BaseStackProps = {
  appName: appName,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  },
  tags: {
    name: repository.name,
    environment: environment,
    owner: repository.owner,
    branch: repository.branch
  }
};
//#endregion

//#region === Create CDK app ===
const app = new cdk.App();

const uiStackProps = baseStackProps as UiStackProps;
uiStackProps.domain = domain;
uiStackProps.subdomain = subdomain;
const uiStack = new UiStack(app, appName + "-ui", uiStackProps);

const pipelineStackProps = baseStackProps as PipelineStackProps;
pipelineStackProps.repository = repository;
pipelineStackProps.siteBucket = uiStack.siteBucket;
new PipelineStack(app, appName + "-pipeline", pipelineStackProps);
//#endregion
