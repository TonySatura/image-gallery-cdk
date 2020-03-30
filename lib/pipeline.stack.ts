import * as cdk from "@aws-cdk/core";
import * as codebuild from "@aws-cdk/aws-codebuild";
import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as codepipelineActions from "@aws-cdk/aws-codepipeline-actions";
import { PipelineStackProps } from "./stack-props";
import { GitHubTrigger } from "@aws-cdk/aws-codepipeline-actions";

export class PipelineStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: PipelineStackProps) {
    super(scope, id, props);

    const pipeline = new codepipeline.Pipeline(this, "pipeline", {
      pipelineName: props.appName + "-pipeline"
    });

    //#region === SOURCE ===
    const sourceStage = pipeline.addStage({
      stageName: "Source"
    });

    const sourceArtifact = new codepipeline.Artifact("source");
    const oauth = cdk.SecretValue.secretsManager("GitHubToken");

    const gitHubSourceAction = new codepipelineActions.GitHubSourceAction({
      actionName: "GitHubSource",
      owner: props.repository.owner,
      repo: props.repository.name,
      output: sourceArtifact,
      branch: props.repository.branch,
      trigger: GitHubTrigger.WEBHOOK,
      oauthToken: oauth
    });

    sourceStage.addAction(gitHubSourceAction);
    //#endregion

    //#region === BUILD ===
    const buildArtifact = new codepipeline.Artifact("build");

    const buildStage = pipeline.addStage({
      stageName: "Build",
      placement: {
        justAfter: sourceStage
      }
    });

    const codeBuildProject = new codebuild.PipelineProject(
      this,
      props.appName + "-codebuild"
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
