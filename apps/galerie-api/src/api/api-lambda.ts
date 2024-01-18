import { createHttpServer, createHttpServerParameters } from "./api";
import serverless, { Handler } from "serverless-http";
import { startLambdaCmd } from "cli";

let lambdaHandler: Handler;

type StartLambdaCmdOptions = createHttpServerParameters & { port: number };
let options: StartLambdaCmdOptions;

export const handler = async (event: string, context: any) => {
  if (!options) {
    // parse the command line options that have been passed in env variables in serverless.yaml
    await startLambdaCmd.parseAsync([], { from: "user" });
    // get the options to be able to instantiate the http server
    options = startLambdaCmd.opts<StartLambdaCmdOptions>();

    const httpServer = await createHttpServer(options);
    const app = httpServer.getApi();
    lambdaHandler = serverless(app, { provider: "aws" });
  }

  return lambdaHandler(event, context);
};
