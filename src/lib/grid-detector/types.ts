// ---------------------------------------------------------------------------
// Grid detection result types (all coordinates are ORIGINAL-image pixels)
// ---------------------------------------------------------------------------

export interface PixelRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * How a card ended up in the result:
 * - `detected`  – found directly by rectangle detection.
 * - `recovered` – predicted by the grid lattice and confirmed by weaker edge evidence.
 * - `manual`    – added or adjusted by the user in the editor.
 */
export type CardSource = "detected" | "recovered" | "manual";

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
  /** 0–1 */
  confidence: number;
  source: CardSource;
  /**
   * True when the card is cut off by the image border or a scroll viewport.
   * The box then covers only the visible part.
   */
  clipped: boolean;
}

/** A lattice position inside a grid that has no card (e.g. the tail of a partial last row). */
export interface GridSlot {
  row: number;
  column: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DetectedGrid {
  id: string;
  bounds: PixelRect;
  rows: number;
  columns: number;
  /** 0–1 */
  confidence: number;
  cards: DetectedCard[];
  /** Typical card size in this grid. */
  cardWidth: number;
  cardHeight: number;
  /** Distance between neighbouring card origins. */
  pitchX: number;
  pitchY: number;
  /** Lattice positions inside the grid bounds without a card. Never counted as cards. */
  emptySlots: GridSlot[];
}

export interface DetectionDiagnostics {
  analysisWidth: number;
  analysisHeight: number;
  /** analysis pixels per original pixel */
  analysisScale: number;
  edgeThreshold: number;
  segmentCount: number;
  rawCandidateCount: number;
  filteredCandidateCount: number;
  sizeClusterCount: number;
  stageTimingsMs: Record<string, number>;
}

export interface GridDetectionResult {
  imageWidth: number;
  imageHeight: number;
  grids: DetectedGrid[];
  totalDetectedCards: number;
  processingTimeMs: number;
  /** Non-fatal notes, e.g. "No reliable grid found". */
  warnings: string[];
  settings: DetectionSettings;
  diagnostics: DetectionDiagnostics;
}

export interface DetectionSettings {
  /**
   * 0–1. Higher values lower the edge threshold so faint card borders are
   * picked up, at the cost of more false candidates (which later stages filter).
   */
  sensitivity: number;
  /** Smallest accepted card side, in original pixels. */
  minCardSize: number;
  /** Largest accepted card side as a fraction of the image side (0–1). */
  maxCardSizeRatio: number;
  /** Accepted card aspect ratios (width / height). */
  minAspectRatio: number;
  maxAspectRatio: number;
  /** Cards below this confidence (0–1) are dropped from the result. */
  minConfidence: number;
  /** Allowed relative size difference between cards of the same grid (0.12 = ±12%). */
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

// ---------------------------------------------------------------------------
// Grid studio session persistence
// ---------------------------------------------------------------------------

export interface GridSession {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

export interface SessionImage {
  id: string;
  sessionId: string;
  name: string;
  /** Original image bytes. */
  blob: Blob;
  width: number;
  height: number;
  /** Last automatic detection result (kept so manual edits can be reset). */
  detection: GridDetectionResult | null;
  /** Current grids including manual edits; null until detection has run. */
  grids: DetectedGrid[] | null;
  isManuallyAdjusted: boolean;
  createdAt: number;
}
