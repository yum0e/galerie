import { createHttpServer } from ".";
import serverless, { Handler } from "serverless-http";
import { logger } from "../logger";

let cachedLambdaHandler: Handler;

const getLambdaHandler = () => {
  if (!cachedLambdaHandler) {
    const httpServer = createHttpServer({
      logger: logger.child({ component: "HttpAPIServer" }),
    });
    const app = httpServer.getApi();
    cachedLambdaHandler = serverless(app, { provider: "aws" });
  }
  return cachedLambdaHandler;
};

export const handler = async (event: string, context: any) => {
  const lambdaHandler = getLambdaHandler();
  return lambdaHandler(event, context);
};
