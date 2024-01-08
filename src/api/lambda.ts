import { HttpAPIServer } from "./index.js";
import serverless from "serverless-http";

export const handler = async (event: any, context: any) => {
  const httpServer = new HttpAPIServer();
  const app = httpServer.getApi();
  return serverless(app, { provider: "aws" })(event, context);
};
