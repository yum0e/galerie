import { addCommonOptions } from "cli/add-common-options";
import { cli } from "./cli";

export const startLambdaCmd = cli
  .command("lambda")
  .description("Start the http server on AWS Lambda");
addCommonOptions(startLambdaCmd);

startLambdaCmd.action(() => {});
