import type {
  DetectionSettings,
  GridDetectionResult,
} from "../../grid-detector/types";
import type {
  MaterialRecognitionResult,
  RecognitionSettings,
} from "../../material-detector/types";
import type { ArtifactPanelScan } from "../../artifact-panel/types";

export type ScanStage =
  "decoding" | "detecting" | "loading-references" | "recognizing";

export interface ScanProgress {
  stage: ScanStage;
  /** Units completed within current stage. */
  done: number;
  /** Total units expected for current stage (0 if undetermined). */
  total: number;
}

/** Composite output of scanning a single screenshot image. */
export interface ScanResult {
  detection: GridDetectionResult;
  recognition: MaterialRecognitionResult;
  /** Artifact detail panel scan beside grid, if detected; null if absent. */
  panel?: ArtifactPanelScan | null;
}

/** Settings for configuring a single image scan pass. */
export interface ScanSettings {
  grid: Partial<DetectionSettings>;
  recognition: Partial<RecognitionSettings>;
  /** Look for an artifact detail panel (default true). */
  panel?: boolean;
}

/** Summary counts across scanned cards and categories. */
export interface ScanSummary {
  files: number;
  failedFiles: number;
  cards: number;
  materials: number;
  weapons: number;
  artifacts: number;
  characters: number;
  flagged: number;
  unknown: number;
  mora?: number | null;
}

export interface SingleScanOptions {
  signal?: AbortSignal;
  onProgress?: (progress: ScanProgress) => void;
}
