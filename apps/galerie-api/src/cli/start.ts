import { cli, addCommonOptions } from ".";
import { logger } from "../logger";
import { createHttpServer, createHttpServerParameters } from "../api";

// Grace period before exiting the process after receiving a SIGINT or SIGTERM
const SHUTDOWN_GRACE_PERIOD_MS = 30_000;
let isExiting = false;

const startCmd = cli.command("start").description("Start the http server");
addCommonOptions(startCmd);
startCmd.action(
  async (serverParams: createHttpServerParameters & { port: number }) => {
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

    const httpServer = await createHttpServer(serverParams);
    await httpServer.start({ port: serverParams.port });

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
  },
);
