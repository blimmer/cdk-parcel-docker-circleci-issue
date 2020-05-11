import * as cdk from "@aws-cdk/core";
import * as nodelambda from "@aws-cdk/aws-lambda-nodejs";
import * as path from "path";

export class CdkParcelDockerCircleciIssueStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new nodelambda.NodejsFunction(this, "MyNodeLambda", {
      entry: path.join(__dirname, "index.ts"),
    });
  }
}
