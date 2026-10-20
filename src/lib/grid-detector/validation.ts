/**
 * Upload validation for grid detection. Runs before any decoding so that
 * unsupported or oversized files fail fast with a clear message.
 */
import { GridDetectionError } from "./engine/errors";
import {
  MAX_IMAGE_PIXELS,
  MAX_IMAGE_SIDE,
  MIN_IMAGE_SIDE,
} from "./engine/image";
import {
  EXTENSION_TO_MIME,
  MAX_FILE_BYTES,
  SUPPORTED_IMAGE_TYPES,
} from "./constants/grid.constants";

export {
  MAX_FILE_BYTES,
  SUPPORTED_IMAGE_TYPES,
} from "./constants/grid.constants";

/** Accepts the declared MIME type, or infers it from the file name (clipboard blobs often lack one). */
export function resolveImageType(type: string, name?: string): string | null {
  const t = type.toLowerCase();
  if ((SUPPORTED_IMAGE_TYPES as readonly string[]).includes(t)) return t;
  if (t && t !== "application/octet-stream") return null;
  const ext = name?.split(".").pop()?.toLowerCase();
  return ext ? (EXTENSION_TO_MIME[ext] ?? null) : null;
}

export function validateImageFile(file: {
  type: string;
  size: number;
  name?: string;
}): void {
  if (file.size === 0) {
    throw new GridDetectionError("EMPTY_FILE", "The file is empty.");
  }
  if (!resolveImageType(file.type, file.name)) {
    throw new GridDetectionError(
      "UNSUPPORTED_FILE_TYPE",
      "Unsupported file type. Use a PNG, JPEG, WebP, BMP or GIF screenshot.",
    );
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new GridDetectionError(
      "FILE_TOO_LARGE",
      `The file is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). The limit is ${MAX_FILE_BYTES / 1024 / 1024} MB.`,
    );
  }
}

export function validateImageDimensions(width: number, height: number): void {
  if (width < MIN_IMAGE_SIDE || height < MIN_IMAGE_SIDE) {
    throw new GridDetectionError(
      "IMAGE_TOO_SMALL",
      `The image is too small (${width}×${height}px).`,
    );
  }
  if (
    width > MAX_IMAGE_SIDE ||
    height > MAX_IMAGE_SIDE ||
    width * height > MAX_IMAGE_PIXELS
  ) {
    throw new GridDetectionError(
      "IMAGE_TOO_LARGE",
      `The image is too large (${width}×${height}px). The limit is ${MAX_IMAGE_SIDE}px per side.`,
    );
  }
}
