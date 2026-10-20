/**
 * Typed, client-safe errors for scanning (grid detection + recognition).
 *
 * Grid detection errors keep their code, so callers handle one error type.
 * `message` is always written for end users; internal details stay on `cause`.
 */
import {
  isGridDetectionError,
  type GridDetectionErrorCode,
} from "../../grid-detector/engine/errors";

export type MaterialDetectionErrorCode =
  | GridDetectionErrorCode
  /** The reference icon bank could not be downloaded or decoded. */
  | "REFERENCES_UNAVAILABLE"
  /** The reference bank is malformed or from an incompatible version. */
  | "REFERENCES_INVALID";

export class MaterialDetectionError extends Error {
  readonly code: MaterialDetectionErrorCode;

  constructor(
    code: MaterialDetectionErrorCode,
    message: string,
    cause?: unknown,
  ) {
    super(message);
    this.name = "MaterialDetectionError";
    this.code = code;
    if (cause !== undefined) {
      (this as { cause?: unknown }).cause = cause;
    }
  }
}

export function isMaterialDetectionError(
  err: unknown,
): err is MaterialDetectionError {
  return (
    err instanceof MaterialDetectionError ||
    (typeof err === "object" &&
      err !== null &&
      (err as { name?: unknown }).name === "MaterialDetectionError" &&
      typeof (err as { code?: unknown }).code === "string")
  );
}

/** Converts any thrown value into a safe, user-facing `MaterialDetectionError`. */
export function toMaterialDetectionError(
  err: unknown,
  fallbackMessage = "Scanning failed unexpectedly. Please try another screenshot.",
): MaterialDetectionError {
  if (err instanceof MaterialDetectionError) return err;
  if (isMaterialDetectionError(err) || isGridDetectionError(err)) {
    return new MaterialDetectionError(err.code, err.message);
  }
  return new MaterialDetectionError("PROCESSING_FAILED", fallbackMessage, err);
}
