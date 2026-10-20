import type { DetectedGrid, GridDetectionResult } from "./grid.types";

/**
 * Grid studio session persistence models.
 */

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
  /** Original image file bytes. */
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
