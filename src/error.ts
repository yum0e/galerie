import { Result } from "neverthrow";

// Logic stolen from Farcaster core package
// https://github.com/farcasterxyz/hub-monorepo/blob/main/packages/core/src/errors.ts

interface APIErrorOpts {
  message: string;
  cause: Error | APIError;
  presentable: boolean;
}

export class APIError extends Error {
  public readonly errCode: APIErrorCode;

  /* Indicates if if error message can be presented to the user */
  public readonly presentable: boolean = false;

  constructor(
    errCode: APIErrorCode,
    context: Partial<APIErrorOpts> | string | Error,
  ) {
    let parsedContext: string | Error | Partial<APIErrorOpts>;

    if (typeof context === "string") {
      parsedContext = { message: context };
    } else if (context instanceof Error) {
      parsedContext = { cause: context, message: context.message };
    } else {
      parsedContext = context;
    }

    if (!parsedContext.message) {
      parsedContext.message = parsedContext.cause?.message || "";
    }

    super(parsedContext.message, { cause: parsedContext.cause });

    this.name = "APIError";
    this.errCode = errCode;
  }
}

export type APIErrorCode = "unauthorized" | "not_found" | "internal_error";

export type APIResult<T> = Result<T, APIError>;
export type APIAsyncResult<T> = Promise<APIResult<T>>;
