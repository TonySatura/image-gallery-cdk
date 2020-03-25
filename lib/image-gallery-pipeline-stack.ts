
import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";
import * as s3deploy from "@aws-cdk/aws-s3-deployment";
import * as route53 from "@aws-cdk/aws-route53";
import * as acm from "@aws-cdk/aws-certificatemanager";
import * as route53targets from "@aws-cdk/aws-route53-targets/lib";
import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as codepipelineActions from "@aws-cdk/aws-codepipeline-actions";
import * as cloudfront from "@aws-cdk/aws-cloudfront";
import * as iam from "@aws-cdk/aws-iam";
import { ImageGalleryStackProps } from "./image-gallery-stack-props";
import { GitHubTrigger } from "@aws-cdk/aws-codepipeline-actions";
import * as codebuild from "@aws-cdk/aws-codebuild";

export class ImageGalleryPipelineStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props: ImageGalleryStackProps) {
        super(scope, id, props);


        if (props.siteBucket !== undefined) {

            const codeBuildRole = new iam.Role(this, 'image-gallery-codebuildRole', {
                assumedBy: new iam.ServicePrincipal('codebuild.amazonaws.com'),
                managedPolicies: [
                    iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3FullAccess'),
                    iam.ManagedPolicy.fromAwsManagedPolicyName('CloudFrontFullAccess')
                ]
            });

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

            // const deployStage = pipeline.addStage({
            //     stageName: 'Deploy',
            //     placement: {
            //         justAfter: buildStage
            //     }
            // });

            const sourceArtifact = new codepipeline.Artifact();
            const buildArtifact = new codepipeline.Artifact();
            const oauth = cdk.SecretValue.secretsManager("GitHubToken");

            // Actions
            const gitHubSourceAction = new codepipelineActions.GitHubSourceAction({
                actionName: "GitHubSource",
                owner: "TonySatura",
                repo: "image-gallery-ng",
                output: sourceArtifact,
                branch: "master",
                trigger: GitHubTrigger.WEBHOOK,
                oauthToken: oauth
            });
            sourceStage.addAction(gitHubSourceAction);

            const codeBuildProject = new codebuild.Project(this, "image-gallery-codebuild", {
                buildSpec: codebuild.BuildSpec.fromSourceFilename("buildspec.yml"),
                source: codebuild.Source.gitHub({
                    owner: "TonySatura",
                    repo: "image-gallery-ng",
                    webhook: true}),
                role: codeBuildRole
            });

            const angularBuildAction = new codepipelineActions.CodeBuildAction({
                actionName: "AngularBuild",
                input: sourceArtifact,
                outputs: [buildArtifact],
                project: codeBuildProject
            });
            buildStage.addAction(angularBuildAction);

            // const s3deploy = new codepipelineActions.S3DeployAction({
            //     actionName: "S3Deploy",
            //     input: buildArtifact,
            //     bucket: props.siteBucket
            // });
            // deployStage.addAction(s3deploy);
        }
    }
}