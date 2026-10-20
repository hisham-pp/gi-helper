import type { PixelRect } from "./geometry.types";
import type { DetectionSettings } from "./settings.types";

/**
 * Origin source of a card bounding box:
 * - `detected`: Found directly through edge/rectangle candidate detection.
 * - `recovered`: Predicted by lattice structure and confirmed by edge evidence.
 * - `manual`: Added or adjusted by manual user interaction.
 */
export type CardSource = "detected" | "recovered" | "manual";

/**
 * A single card detected or recovered within a grid.
 */
export interface DetectedCard {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  /** Zero-based row inside its grid, or null when it could not be determined. */
  row: number | null;
  /** Zero-based column inside its grid, or null when it could not be determined. */
  column: number | null;
  /** Confidence score between 0 and 1. */
  confidence: number;
  source: CardSource;
  /**
   * True when the card is cut off by the image border or a scroll viewport.
   * In that case, the box covers only the visible portion.
   */
  clipped: boolean;
}

/**
 * A lattice slot position inside a grid that contains no card
 * (e.g., the tail of an incomplete final row).
 */
export interface GridSlot {
  row: number;
  column: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * A coherent 2D grid lattice of item cards.
 */
export interface DetectedGrid {
  id: string;
  bounds: PixelRect;
  rows: number;
  columns: number;
  /** Confidence score between 0 and 1. */
  confidence: number;
  cards: DetectedCard[];
  /** Typical card width in this grid. */
  cardWidth: number;
  /** Typical card height in this grid. */
  cardHeight: number;
  /** Distance between neighbouring card origins horizontally. */
  pitchX: number;
  /** Distance between neighbouring card origins vertically. */
  pitchY: number;
  /** Lattice positions inside grid bounds without an item card. Never counted as cards. */
  emptySlots: GridSlot[];
}

/**
 * Diagnostic metrics and stage timings for grid detection execution.
 */
export interface DetectionDiagnostics {
  analysisWidth: number;
  analysisHeight: number;
  /** Scale factor: analysis pixels per original pixel. */
  analysisScale: number;
  edgeThreshold: number;
  segmentCount: number;
  rawCandidateCount: number;
  filteredCandidateCount: number;
  sizeClusterCount: number;
  stageTimingsMs: Record<string, number>;
}

/**
 * Complete result output of the grid detection pipeline.
 */
export interface GridDetectionResult {
  imageWidth: number;
  imageHeight: number;
  grids: DetectedGrid[];
  totalDetectedCards: number;
  processingTimeMs: number;
  /** Non-fatal diagnostic warnings (e.g., "No reliable grid found"). */
  warnings: string[];
  settings: DetectionSettings;
  diagnostics: DetectionDiagnostics;
}
