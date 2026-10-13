/**
 * Material recognition: identifies the catalog material, rarity and
 * quantity of every card found by the grid detector.
 *
 * - `MaterialScanClient` — browser API (Web Worker: decode → grids → recognition).
 * - `recognizeMaterials` — the pure engine (any RGBA buffer; used by tests).
 * - `createReferenceBank` — builds the reference templates from the atlas.
 */
export * from "./types";
export { DEFAULT_RECOGNITION_SETTINGS, resolveRecognitionSettings } from "./settings";
export { recognizeMaterials, aggregate, matchConfidence, type RecognitionInput } from "./engine/recognize";
export {
  createReferenceBank,
  validateManifest,
  FINE_SIZE,
  COARSE_SIZE,
  type AtlasManifest,
  type ReferenceBank,
} from "./engine/bank";
export {
  MaterialDetectionError,
  isMaterialDetectionError,
  toMaterialDetectionError,
  type MaterialDetectionErrorCode,
} from "./engine/errors";
export type { DigitTemplates } from "./engine/quantity";
export { MaterialScanClient, type ScanOptions } from "./client";
export { loadReferenceBank, ATLAS_IMAGE_URL, ATLAS_MANIFEST_URL } from "./browser";
export type { ScanProgress, ScanStage } from "./worker-protocol";
