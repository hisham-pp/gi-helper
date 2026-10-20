import type { DetectionErrorCode } from "../types";

export class DetectionError extends Error {
  readonly code: DetectionErrorCode;

  constructor(code: DetectionErrorCode, message: string, cause?: unknown) {
    super(message);
    this.name = "DetectionError";
    this.code = code;
    if (cause !== undefined) {
      (this as { cause?: unknown }).cause = cause;
    }
  }
}

export function isDetectionError(err: unknown): err is DetectionError {
  return (
    err instanceof DetectionError ||
    (typeof err === "object" &&
      err !== null &&
      (err as { name?: unknown }).name === "DetectionError" &&
      typeof (err as { code?: unknown }).code === "string")
  );
}
