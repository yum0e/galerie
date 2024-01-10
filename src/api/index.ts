import express from "express";
import http from "http";
import { pinoHttp } from "pino-http";
import { CliOptions } from "../cli";
import { APIResult } from "../error";
import { ok } from "neverthrow";
import { Server } from "http";
import pino from "pino";
import { logger as defaultLogger } from "../logger";

export type HttpServer = {
  logger: pino.Logger<never>;
  getApi(): express.Express;
  start(cliOptions: CliOptions): Promise<APIResult<string>>;
  stop(): void;
  teardown(): Promise<void>;
};

export type createHttpServerParameters = {
  logger?: pino.Logger<never> | undefined;
};

export const createHttpServer = ({
  logger = defaultLogger,
}: createHttpServerParameters): HttpServer => {
  const app = express();

  app.use(
    pinoHttp({
      logger: logger,
    }),
  );

  initHandlers(app);

  const server = http.createServer(app);

  return {
    logger,
    getApi: () => app,
    start: (cliOptions: CliOptions) => start({ server, logger, cliOptions }),
    stop: () => stop(server),
    teardown: () => teardown(server),
  };
};

const initHandlers = (app: express.Express): void => {
  app.get("/hello", (_, res) => {
    res.send("Hello World!");
  });

  app.get("/health", (_, res) => {
    res.send({ status: "ok" });
  });
};

export type StartParameters = {
  server: Server;
  logger: pino.Logger<never>;
  cliOptions: CliOptions;
};

export const start = (params: StartParameters): Promise<APIResult<string>> => {
  return new Promise((resolve) => {
    const port: number = params.cliOptions.port;
    params.server.listen(port, () => {
      params.logger.info(`Server is listening on port ${port}`);

      resolve(ok(""));
    });
  });
};

export const stop = (server: Server): void => {
  server.close();
};

export const teardown = async (server: Server): Promise<void> => {
  return stop(server);
};
