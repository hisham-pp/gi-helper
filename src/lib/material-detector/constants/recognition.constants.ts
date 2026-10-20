import { CARD_KINDS, type CardKind } from "../types/bank.types";
import type { RecognitionSettings } from "../types/settings.types";

export { CARD_KINDS, type CardKind };

/**
 * Default card recognition settings.
 * Tuned on Genshin reference screenshots in public/samples/test-set-01.
 */
export const DEFAULT_RECOGNITION_SETTINGS: RecognitionSettings = {
  kind: "auto",
  shortlistSize: 12,
  candidateCount: 5,
  useRarity: true,
  useInventoryOrder: true,
  refineAlignment: true,
  readQuantity: true,
  readMora: true,
  minConfidence: 0.5,
};

/**
 * Valid operational clamping ranges for recognition settings.
 */
export const RECOGNITION_SETTING_LIMITS = {
  shortlistSize: { min: 2, max: 64 },
  candidateCount: { min: 1, max: 10 },
  minConfidence: { min: 0, max: 1 },
} as const;

/** Card geometry proportions relative to card width (W). Height ≈ 1.2198 W. */
export const CARD_ASPECT = 222 / 182;
/** Artwork rows used for matching: everything above the star row. */
export const ART_ROWS_FRACTION = 0.71;
export const STAR_BAND = { top: 0.7, bottom: 0.85 } as const;
export const FOOTER_TOP = 0.82;
/** Digits band in the footer; slightly generous to tolerate loose card detections. */
export const DIGIT_BAND = {
  top: 0.845,
  bottom: 0.985,
  left: 0.06,
  right: 0.94,
} as const;

/** Frame width of the full-resolution (fine) pass; equals the atlas tile size. */
export const FINE_SIZE = 64;
/** Frame width of the shortlist (coarse) pass. */
export const COARSE_SIZE = FINE_SIZE / 2;

export const ATLAS_FORMAT = "gi-material-atlas";
export const ATLAS_VERSION = 1;

/** Site paths of each kind's atlas (under public/). */
export const ATLAS_FILES: Record<
  CardKind,
  { manifest: string; image: string }
> = {
  material: {
    manifest: "/data/material-atlas.json",
    image: "/data/material-atlas.webp",
  },
  weapon: {
    manifest: "/data/weapon-atlas.json",
    image: "/data/weapon-atlas.webp",
  },
  artifact: {
    manifest: "/data/artifact-atlas.json",
    image: "/data/artifact-atlas.webp",
  },
  character: {
    manifest: "/data/character-atlas.json",
    image: "/data/character-atlas.webp",
  },
};

/** Star detection geometric constants */
export const STAR_GEOMETRY = {
  singleStarWidth: 0.143,
  pitchPerStar: 0.1565,
  rows: { top: 0.735, bottom: 0.83 } as const,
  frameWidth: 128,
} as const;

/** Digit template dimensions and band constants */
export const GLYPH_DIMENSIONS = {
  width: 14,
  height: 20,
  bandHeight: 32,
} as const;
