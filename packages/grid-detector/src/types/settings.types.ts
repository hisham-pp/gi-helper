import type { PixelRect } from "./geometry.types";

/**
 * Configurable runtime settings for the inventory grid detection engine.
 */
export interface DetectionSettings {
  /**
   * Sensitivity threshold in 0–1. Higher values lower the edge threshold so faint
   * card borders are picked up, at the cost of more false candidates.
   */
  sensitivity: number;

  /** Smallest accepted card side in original image pixels. */
  minCardSize: number;

  /** Largest accepted card side as a fraction of the image side (0–1). */
  maxCardSizeRatio: number;

  /** Accepted card aspect ratios (width / height). */
  minAspectRatio: number;
  maxAspectRatio: number;

  /** Cards below this confidence (0–1) are dropped from the result. */
  minConfidence: number;

  /** Allowed relative size difference between cards of the same grid (e.g. 0.12 = ±12%). */
  sizeTolerance: number;

  /** Allowed misalignment from the fitted lattice, as a fraction of the pitch. */
  alignmentTolerance: number;

  /** Fill lattice gaps whose borders have weaker-but-consistent evidence. */
  recoverMissedCards: boolean;

  /** Keep cards that are cut off by the image border or a scroll viewport. */
  includeClippedCards: boolean;

  /** Optional region of interest in original pixels; null = whole image. */
  region: PixelRect | null;

  /** Longest side of the internal analysis image. Larger = slower but more precise. */
  maxAnalysisSide: number;
}
