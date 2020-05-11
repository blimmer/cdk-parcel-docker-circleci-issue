#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { CdkParcelDockerCircleciIssueStack } from '../lib/cdk-parcel-docker-circleci-issue-stack';

const app = new cdk.App();
new CdkParcelDockerCircleciIssueStack(app, 'CdkParcelDockerCircleciIssueStack');
