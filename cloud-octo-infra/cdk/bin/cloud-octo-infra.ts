#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { CloudOctoInfraStack } from '../lib/cloud-octo-infra-stack';

const app = new cdk.App();
new CloudOctoInfraStack(app, 'CloudOctoProdStack', {});
