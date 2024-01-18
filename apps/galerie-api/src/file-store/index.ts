import { err, ok } from "neverthrow";
import { APIError, APIResult } from "../error";
import { createLocalFileStore } from "./local";

export type Photo = string;

export enum FileStorageType {
  Local = "local",
  S3 = "s3",
}

export type FileStore = {
  type: FileStorageType;
  /** Saves the photography in the file storage and returns the url where the photography can be found */
  save(photo: Photo): Promise<string>;
};

export const createFileStore = (
  name: FileStorageType,
): APIResult<FileStore> => {
  if (name === "local") {
    return ok(createLocalFileStore());
  }
  if (name === "s3") {
    return err(new APIError("internal_error", "S3 file store not implemented"));
  }

  return err(new APIError("internal_error", `Unknown file store ${name}`));
};
