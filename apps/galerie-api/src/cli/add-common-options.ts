import { Command, Option } from "commander";
import { FileStorageType, createFileStore } from "../file-store";
import { LoggerType } from "../logger";

export type RawCliOptions = {
  port: number;
  fileStorageType: FileStorageType;
};

/**
 * @param cmd Command to add options to.
 * @returns void.
 *
 * This function allows to add common options to a command. It is useful in the cli to be able to pass options to the lambda handler.
 * This function triggers a preAction hook to add the different stores and the logger to the command options.
 */
export const addCommonOptions = (cmd: Command): void => {
  cmd.addOption(
    new Option("-p, --port <port>", "Port to listen on")
      .default("8080")
      .env("G_PORT"), // G for galerie
  );
  cmd.addOption(
    new Option("--file-storage-type <type>", "Storage type")
      .choices(Object.values(FileStorageType))
      .default(FileStorageType.Local)
      .env("G_FILE_STORAGE_TYPE"),
  );
  cmd.addOption(
    new Option("--logger-type <logger-type>", "Logger type.")
      .choices(Object.values(LoggerType))
      .default(LoggerType.Stdout)
      .env("G_LOGGER_TYPE"),
  );
  cmd.hook("preAction", (cmd) => {
    const options = cmd.opts<RawCliOptions>();
    addStores(cmd, options);
  });
};

/**
 * @param cmd Command to add options to.
 * @param options Options passed to the command.
 * @returns void.
 *
 * This function allows to add stores to the command options.
 */
const addStores = (cmd: Command, options: RawCliOptions) => {
  // create file store and handle errors
  const fileStoreResult = createFileStore(options.fileStorageType);
  if (fileStoreResult.isErr()) {
    console.log(`Error creating file store: ${fileStoreResult.error}`);
    process.exit(1);
  }
  cmd.setOptionValue("fileStore", fileStoreResult.value);
};
