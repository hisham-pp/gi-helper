import type { DetectionSettings } from "../types/settings.types";

/**
 * Default settings for the grid detection engine.
 * Tuned against Genshin reference screenshots and synthetic grids.
 * None of them encode a fixed grid size, card size, or screen resolution.
 */
export const DEFAULT_DETECTION_SETTINGS: DetectionSettings = {
  sensitivity: 0.5,
  minCardSize: 24,
  maxCardSizeRatio: 1,
  minAspectRatio: 0.35,
  maxAspectRatio: 1.35,
  minConfidence: 0.35,
  sizeTolerance: 0.12,
  alignmentTolerance: 0.08,
  recoverMissedCards: true,
  includeClippedCards: false,
  region: null,
  maxAnalysisSide: 1400,
};

/**
 * Valid operational clamping ranges for grid detection settings.
 */
export const GRID_SETTING_LIMITS = {
  sensitivity: { min: 0, max: 1 },
  minCardSize: { min: 8, max: 4096 },
  maxCardSizeRatio: { min: 0.05, max: 1 },
  aspectRatio: { min: 0.1, max: 10 },
  minConfidence: { min: 0, max: 1 },
  sizeTolerance: { min: 0.02, max: 0.4 },
  alignmentTolerance: { min: 0.03, max: 0.4 },
  maxAnalysisSide: { min: 320, max: 4096 },
} as const;

/** 40 MB max screenshot file size — protects browser tab from out-of-memory. */
export const MAX_FILE_BYTES = 40 * 1024 * 1024;

export const SUPPORTED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/bmp",
  "image/gif",
] as const;

export const EXTENSION_TO_MIME: Record<
  string,
  (typeof SUPPORTED_IMAGE_TYPES)[number]
> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  bmp: "image/bmp",
  gif: "image/gif",
};

/** Geometric limits for detection images (matching engine/image.ts constraints) */
export const GRID_IMAGE_LIMITS = {
  minSide: 64,
  maxSide: 8192,
  maxPixels: 100_000_000,
} as const;
