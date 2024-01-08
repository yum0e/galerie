import { Command } from "commander";
import { HttpAPIServer } from "./api/index.js";
import { logger } from "./logger.js";

export type CliOptions = {
  port: number;
};

// Grace period before exiting the process after receiving a SIGINT or SIGTERM
const SHUTDOWN_GRACE_PERIOD_MS = 30_000;
let isExiting = false;

const app = new Command();
app.name("auth-service").description("Authentication service").version("0.1.0");

app
  .command("start")
  .description("Start the authentication service")
  .option("-p, --port <port>", "Port to listen on", "3000")
  .action(async (cliOptions) => {
    const httpServer = new HttpAPIServer();

    const handleShutdownSignal = (signalName: string) => {
      logger.warn(`signal '${signalName}' received`);
      if (!isExiting) {
        isExiting = true;
        httpServer
          .teardown()
          .then(() => {
            logger.info("API stopped gracefully.");
            process.exit(0);
          })
          .catch((err) => {
            logger.error({ reason: `Error stopping API: ${err}` });
            process.exit(1);
          });

        setTimeout(() => {
          logger.fatal("Forcing exit after grace period");
          process.exit(1);
        }, SHUTDOWN_GRACE_PERIOD_MS);
      }
    };

    await httpServer.start(cliOptions);

    process.stdin.resume();

    process.on("SIGINT", () => {
      handleShutdownSignal("SIGINT");
    });

    process.on("SIGTERM", () => {
      handleShutdownSignal("SIGTERM");
    });

    process.on("SIGQUIT", () => {
      handleShutdownSignal("SIGQUIT");
    });

    process.on("uncaughtException", (err) => {
      logger.error({ reason: "Uncaught exception", err }, "shutting down API");

      handleShutdownSignal("uncaughtException");
    });

    process.on("unhandledRejection", (err) => {
      logger.error({ reason: "Unhandled Rejection", err }, "shutting down API");

      handleShutdownSignal("unhandledRejection");
    });
  });

app.parse(process.argv);
