import { createHttpServer } from ".";
import serverless from "serverless-http";
import { logger } from "../logger";

export const handler = async (event: string, context: any) => {
  const httpServer = createHttpServer({
    logger: logger.child({ component: "HttpAPIServer" }),
  });
  const app = httpServer.getApi();
  return serverless(app, { provider: "aws" })(event, context);
};
