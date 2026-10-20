/**
 * Inventory grid detection.
 *
 * - `GridDetectionClient` — browser API (Web Worker, cancellation, validation).
 * - `detectInventoryGrids` — the pure engine (any RGBA buffer; used by tests).
 * - `editing` — manual corrections with undo/redo.
 * - `browser` — decoding and original-quality card crops.
 *
 * Item identification, rarity, quantity OCR etc. are deliberately out of
 * scope: they consume the card boxes produced here.
 */
export * from "./types";
export * from "./constants";
export {
  DEFAULT_DETECTION_SETTINGS,
  resolveDetectionSettings,
} from "./settings";
export { detectInventoryGrids, type DetectionInput } from "./engine/detect";
export {
  GridDetectionError,
  isGridDetectionError,
  toGridDetectionError,
  type GridDetectionErrorCode,
} from "./engine/errors";
export {
  type RgbaImage,
  MIN_IMAGE_SIDE,
  MAX_IMAGE_SIDE,
  MAX_IMAGE_PIXELS,
  validateRgbaImage,
} from "./engine/image";
export { GridDetectionClient, type DetectOptions } from "./client";
export {
  cropToBitmap,
  cropToBlob,
  decodeImage,
  rasterizeForDetection,
} from "./browser";
export {
  MAX_FILE_BYTES,
  SUPPORTED_IMAGE_TYPES,
  resolveImageType,
  validateImageDimensions,
  validateImageFile,
} from "./validation";
export * from "./editing";
export * from "./session-storage";
export * from "./const";
export * from "./utils";
