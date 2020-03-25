import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";

export interface ImageGalleryStackProps extends cdk.StackProps {
    siteBucket?: s3.Bucket,
}