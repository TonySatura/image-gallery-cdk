
import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";
import * as s3deploy from "@aws-cdk/aws-s3-deployment";
import * as route53 from "@aws-cdk/aws-route53";
import * as acm from "@aws-cdk/aws-certificatemanager";
import * as route53targets from "@aws-cdk/aws-route53-targets/lib";
import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as codepipelineActions from "@aws-cdk/aws-codepipeline-actions";
import * as cloudfront from "@aws-cdk/aws-cloudfront";
import { ImageGalleryStackProps } from "./image-gallery-stack-props";
import { GitHubTrigger } from "@aws-cdk/aws-codepipeline-actions";
import * as codebuild from "@aws-cdk/aws-codebuild";

export class ImageGalleryPipelineStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props: ImageGalleryStackProps) {
        super(scope, id, props);

        const pipeline = new codepipeline.Pipeline(this, "image-gallery-pipeline", {
            pipelineName: "image-gallery-pipeline"
        });

        const sourceStage = pipeline.addStage({
            stageName: 'Source'
        });

        const buildStage = pipeline.addStage({
            stageName: 'Build',
            placement: {
              justAfter: sourceStage
            }
        });

        const deployStage = pipeline.addStage({
            stageName: 'Deploy',
            placement: {
              justAfter: buildStage
            }
        });

        const sourceOutput = new codepipeline.Artifact();

        const oauth = cdk.SecretValue.secretsManager('arn:aws:secretsmanager:eu-central-1:262480117099:secret:GitHub-3oQJzL');
        const sourceAction = new codepipelineActions.GitHubSourceAction({
            actionName: "GitHub source",
            owner: "TonySatura",
            repo: "image-gallery-ng",
            output: sourceOutput,
            branch: "master",
            trigger: GitHubTrigger.WEBHOOK,
            oauthToken: oauth
        });
    }
}