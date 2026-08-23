import { TRPCError } from "@trpc/server";

export class InvalidShareContentError extends Error {
  constructor(
    message = "Markdown content is invalid.",
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "InvalidShareContentError";
  }
}

export class ShareCreateFailureError extends Error {
  constructor(options?: ErrorOptions) {
    super("Could not create a share. Please try again.", options);
    this.name = "ShareCreateFailureError";
  }
}

export async function mapShareServiceErrors<T>(
  operation: () => Promise<T>,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof InvalidShareContentError) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: error.message,
        cause: error,
      });
    }

    if (error instanceof ShareCreateFailureError) {
      console.error("Failed to create share", error.cause ?? error);

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message,
        cause: error,
      });
    }

    throw error;
  }
}

type ShareNotFoundResult = {
  status: "not_found";
  message: string;
};

export function throwShareNotFound(result: ShareNotFoundResult): never {
  throw new TRPCError({
    code: "NOT_FOUND",
    message: result.message,
  });
}
