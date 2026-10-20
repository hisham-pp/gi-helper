/**
 * Typed, client-safe errors for the grid detection pipeline.
 *
 * `message` is always written for end users. Internal exception details are
 * never copied into it; they are kept on `cause` for console debugging only.
 */
export type GridDetectionErrorCode =
  | "UNSUPPORTED_FILE_TYPE"
  | "FILE_TOO_LARGE"
  | "EMPTY_FILE"
  | "DECODE_FAILED"
  | "INVALID_IMAGE"
  | "IMAGE_TOO_SMALL"
  | "IMAGE_TOO_LARGE"
  | "INVALID_REGION"
  | "CANCELLED"
  | "PROCESSING_FAILED";

export class GridDetectionError extends Error {
  readonly code: GridDetectionErrorCode;

  constructor(code: GridDetectionErrorCode, message: string, cause?: unknown) {
    super(message);
    this.name = "GridDetectionError";
    this.code = code;
    if (cause !== undefined) {
      (this as { cause?: unknown }).cause = cause;
    }
  }
}

export function isGridDetectionError(err: unknown): err is GridDetectionError {
  return (
    err instanceof GridDetectionError ||
    (typeof err === "object" &&
      err !== null &&
      (err as { name?: unknown }).name === "GridDetectionError" &&
      typeof (err as { code?: unknown }).code === "string")
  );
}

/** Converts any thrown value into a safe, user-facing `GridDetectionError`. */
export function toGridDetectionError(
  err: unknown,
  fallbackMessage = "Grid detection failed unexpectedly. Please try another screenshot.",
): GridDetectionError {
  if (err instanceof GridDetectionError) return err;
  if (isGridDetectionError(err)) {
    return new GridDetectionError(err.code, err.message);
  }
  return new GridDetectionError("PROCESSING_FAILED", fallbackMessage, err);
}
