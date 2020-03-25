#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { ImageGalleryUiStack } from './lib/image-gallery-ui-stack'
import { ImageGalleryStackProps } from './lib/image-gallery-stack-props';

const app = new cdk.App();

const stackProps: ImageGalleryStackProps = {
    description: '',
    branchName: '',
    rootDomain: '',
    baseDomain: '',
    env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: "eu-central-1" },
    tags: {
    //   service: "n/a",
    //   name: "awsome-list",
    //   environment: "dev",
    //   platform: "awin",
      owner: "t.satura@icloud.com",
    //   application: "Proof of concept to test out CI/CD mechanisms",
    //   maid_offHours: "n/a",
    //   costCentre: "n/a",
    //   branch: branch,
    //   tagVersion: "1"
    }
  };

const uiStack = new ImageGalleryUiStack(app, 'ImageGalleryUiStack', stackProps);
