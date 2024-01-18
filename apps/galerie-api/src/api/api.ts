import express from "express";
import http from "http";
import { pinoHttp } from "pino-http";
import { APIResult } from "../error";
import { ok } from "neverthrow";
import { Server } from "http";
import pino from "pino";
import { logger as defaultLogger } from "../logger";
import { FileStore, Photo } from "../file-store";

export type HttpServer = {
  logger: pino.Logger<never>;
  getApi(): express.Express;
  start(params: { port: number }): Promise<APIResult<string>>;
  stop(): Promise<void>;
  teardown(): Promise<void>;
};

export type createHttpServerParameters = {
  fileStore: FileStore;
  logger?: pino.Logger<never> | undefined;
};

export const createHttpServer = async ({
  fileStore,
  logger = defaultLogger,
}: createHttpServerParameters): Promise<HttpServer> => {
  const app = express();

  app.use(
    pinoHttp({
      logger: logger,
    }),
  );

  await initHandlers(app, { fileStore });

  const server = http.createServer(app);

  return {
    logger,
    getApi: () => app,
    start: (params: { port: number }) =>
      start({ server, logger, port: params.port }),
    stop: () => stop(server),
    teardown: () => teardown(server),
  };
};

type initHandlersParameters = {
  fileStore: FileStore;
};

const initHandlers = async (
  app: express.Express,
  { fileStore }: initHandlersParameters,
): Promise<void> => {
  app.get("/health", (_, res) => {
    res.send({ status: "ok" });
  });

  app.post("/photos/upload", async (req, res) => {
    const photos = ["photo1"];

    const promisedUrls = photos.map((photo: Photo) => {
      const imageUrl = fileStore.save(photo);
      return imageUrl;
    });

    let photoUrls: string[] = [];
    for await (const photoUrl of promisedUrls) {
      photoUrls.push(photoUrl);
    }

    res.send({ photoUrls });
  });
};

export type StartParameters = {
  server: Server;
  logger: pino.Logger<never>;
  port: number;
};

export const start = (params: StartParameters): Promise<APIResult<string>> => {
  return new Promise((resolve) => {
    const port: number = params.port;
    params.server.listen(port, () => {
      params.logger.info(`Server is listening on port ${port}`);

      resolve(ok(""));
    });
  });
};

export const stop = (server: Server): Promise<void> => {
  return new Promise((resolve) => {
    server.close(() => {
      resolve();
    });
  });
};

export const teardown = async (server: Server): Promise<void> => {
  return stop(server);
};
