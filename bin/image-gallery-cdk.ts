#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { ImageGalleryCdkStack } from '../lib/image-gallery-cdk-stack';

const app = new cdk.App();
new ImageGalleryCdkStack(app, 'ImageGalleryCdkStack');
