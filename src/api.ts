import express from "express";
import http from "http";
import pinoHTTP from "pino-http";
import { logger } from "./logger.js";
import { CliOptions } from "./cli.js";
import { APIResult } from "./error.js";
import { ok } from "neverthrow";
import { Server } from "http";

const log = logger.child({ component: "HttpAPIServer" });

export class HttpAPIServer {
  app = express();
  server: Server;

  constructor() {
    this.app.use(
      pinoHTTP({
        logger,
      }),
    );

    this.initHandlers();

    this.server = http.createServer(this.app);
  }

  async start(cliOptions: CliOptions): Promise<APIResult<string>> {
    return new Promise((resolve) => {
      const port: number = cliOptions.port;
      this.server.listen(port, () => {
        log.info(`Server is listening on port ${port}`);

        resolve(ok(""));
      });
    });
  }

  async stop(): Promise<void> {
    this.server.close();
  }

  teardown(): Promise<void> {
    return this.stop();
  }

  initHandlers(): void {
    this.app.get("/", (_, res) => {
      res.send("Hello World!");
    });
  }
}
