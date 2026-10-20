import type {
  DetectionSettings,
  GridDetectionResult,
} from "../../grid-detector/types";
import type { ArtifactPanelScan } from "../../artifact-panel/types";
import type { MaterialRecognitionResult } from "./recognition.types";
import type { RecognitionSettings } from "./settings.types";

export * from "./rarity.types";
export * from "./quantity.types";
export * from "./mora.types";
export * from "./bank.types";
export * from "./settings.types";
export * from "./recognition.types";

/**
 * Composite scan result combining grid detection, card recognition, and artifact panel scanning.
 */
export interface ScanResult {
  detection: GridDetectionResult;
  recognition: MaterialRecognitionResult;
  /** Artifact detail panel beside grid, ready for OCR; null when absent. */
  panel?: ArtifactPanelScan | null;
}

/**
 * Unified settings for scanning a screenshot.
 */
export interface ScanSettings {
  grid: Partial<DetectionSettings>;
  recognition: Partial<RecognitionSettings>;
  /** Look for an artifact detail panel (default true). */
  panel?: boolean;
}
