export interface GridCell {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GridConfig {
  columns: number;
  rows: number;
  startX: number;
  startY: number;
  cellWidth: number;
  cellHeight: number;
  gapX: number;
  gapY: number;
}

export interface DetailedCellSlice {
  row: number;
  col: number;
  index: number;
  cellRect: { x: number; y: number; width: number; height: number };
  iconRect: { x: number; y: number; width: number; height: number };
  starRect: { x: number; y: number; width: number; height: number };
  quantityRect: { x: number; y: number; width: number; height: number };
  cellBitmap: ImageBitmap;
  iconBitmap: ImageBitmap;
  starBitmap: ImageBitmap;
  quantityBitmap: ImageBitmap;
}

export interface GridDetectionResult {
  config: GridConfig;
  confidence: number; // 0 to 100
  method:
    | "single-item"
    | "periodic-edge-profile"
    | "card-contour-clustering"
    | "proportional-safe-zone"
    | "fallback-calibrated";
  gridBounds: { x: number; y: number; width: number; height: number };
  explanation: string;
  periodX: number;
  periodY: number;
  detectedCellsCount: number;
  isCalibrated: boolean;
}

export interface DetectionOptions {
  sensitivity?: "fast" | "balanced" | "deep";
  expectedAspectRatio?: number; // cell aspect ratio (default ~0.81)
  minConfidence?: number;
  targetCols?: number;
  targetRows?: number;
}

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
  dataUrl: string;
  width: number;
  height: number;
  detectedGrid: GridConfig;
  confidence: number;
  method: string;
  detectedCellsCount: number;
  isManuallyAdjusted: boolean;
  createdAt: number;
}
