import * as cdk from "@aws-cdk/core";
import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as codepipelineActions from "@aws-cdk/aws-codepipeline-actions";
import * as iam from "@aws-cdk/aws-iam";
import { ImageGalleryStackProps } from "./image-gallery-stack-props";
import { GitHubTrigger } from "@aws-cdk/aws-codepipeline-actions";
import * as codebuild from "@aws-cdk/aws-codebuild";

export class ImageGalleryPipelineStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: ImageGalleryStackProps) {
    super(scope, id, props);

    if (props.siteBucket !== undefined) {
      const pipeline = new codepipeline.Pipeline(
        this,
        "image-gallery-pipeline",
        {
          pipelineName: "image-gallery-pipeline"
        }
      );

      //#region === SOURCE ===
      const sourceStage = pipeline.addStage({
        stageName: "Source"
      });

      const sourceArtifact = new codepipeline.Artifact();
      const oauth = cdk.SecretValue.secretsManager("GitHubToken");

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
      //#endregion

      //#region === BUILD ===
      const buildArtifact = new codepipeline.Artifact();

      const buildStage = pipeline.addStage({
        stageName: "Build",
        placement: {
          justAfter: sourceStage
        }
      });

      const codeBuildProject = new codebuild.PipelineProject(
        this,
        "image-gallery-codebuild"
      );

      const angularBuildAction = new codepipelineActions.CodeBuildAction({
        actionName: "AngularBuild",
        input: sourceArtifact,
        outputs: [buildArtifact],
        project: codeBuildProject
      });

      buildStage.addAction(angularBuildAction);
      //#endregion

      //#region === DEPLOY ===
      const deployStage = pipeline.addStage({
        stageName: "Deploy",
        placement: {
          justAfter: buildStage
        }
      });

      const s3deploy = new codepipelineActions.S3DeployAction({
        actionName: "S3Deploy",
        input: buildArtifact,
        bucket: props.siteBucket
      });

      deployStage.addAction(s3deploy);
      //#endregion
    }
  }
}
