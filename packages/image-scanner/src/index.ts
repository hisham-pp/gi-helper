/**
 * Card recognition: identifies the catalog item, rarity and quantity (or
 * level, refinement and lock) of every card found by the grid detector, in
 * the bag's material, weapon and artifact tabs.
 *
 * - `MaterialScanClient` — browser API (Web Worker: decode → grids → recognition).
 * - `recognizeCards` — the pure engine with a bank per kind (any RGBA buffer; used by tests);
 *   `recognizeMaterials` with a single bank.
 * - `createReferenceBank` — builds the reference templates from an atlas.
 */
export * from "./types";
export * from "./constants";
export {
  DEFAULT_RECOGNITION_SETTINGS,
  resolveRecognitionSettings,
} from "./settings";
export {
  recognizeCards,
  recognizeMaterials,
  decideGridKinds,
  aggregate,
  matchConfidence,
  type RecognitionInput,
} from "./engine/recognize";
export { readMora, locateMoraHeader } from "./engine/mora";
export {
  ATLAS_FILES,
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
export * from "./react";
export {
  loadReferenceBank,
  loadReferenceBanks,
  ATLAS_IMAGE_URL,
  ATLAS_MANIFEST_URL,
} from "./browser";
export type { ScanProgress, ScanStage } from "./worker-protocol";
export * from "./const";
export * from "./utils";
