import type { PixelRect } from "../../grid-detector/types";
import type {
  CardRecognitionStatus,
  MoraReading,
  ScanSettings,
} from "../../material-detector/types";
import type { ArtifactPanelReading } from "../../artifact-panel/read";
import type { ArtifactPanelScan } from "../../artifact-panel/types";
import type { EquipmentSighting } from "../../scanner/equipment";
import type { KeyframeOptions } from "./keyframes.types";
import type { MergedMaterial } from "./merge.types";

export type VideoScanErrorCode =
  | "EMPTY_FILE"
  | "UNSUPPORTED_FILE_TYPE"
  | "FILE_TOO_LARGE"
  | "DECODE_FAILED"
  | "VIDEO_TOO_LONG"
  | "IMAGE_TOO_SMALL"
  | "IMAGE_TOO_LARGE"
  | "CANCELLED";

export type VideoScanStage = "opening" | "scanning";

export interface VideoScanProgress {
  stage: VideoScanStage;
  /** Overall progress, 0–1 (never decreases). */
  fraction: number;
  duration: number;
  /** How far the motion analysis has got in seconds. */
  analysedTo: number;
  framesScanned: number;
  /** Frames picked so far, whether scanned yet or queued. */
  framesPicked: number;
}

/** A frame picked for scanning, as it moves through the processing queue. */
export interface VideoFrameEvent {
  /** Stable id of the frame (its sample index). */
  id: number;
  time: number;
  status: "queued" | "scanning" | "done" | "failed";
  /** Downscaled JPEG preview of the frame (provided with "scanning"). */
  preview?: Blob;
  /** Cards found in the frame, in original video pixels (provided with "done"). */
  cards?: { box: PixelRect; status: CardRecognitionStatus }[];
}

export interface VideoScanOptions {
  signal?: AbortSignal;
  onProgress?: (progress: VideoScanProgress) => void;
  onFrame?: (event: VideoFrameEvent) => void;
  /** Called once video metadata is parsed. */
  onOpen?: (info: { duration: number; width: number; height: number }) => void;
  keyframes?: Partial<KeyframeOptions>;
  settings?: Partial<ScanSettings>;
  /**
   * Reads an artifact detail panel (default: lazy-loaded browser OCR).
   */
  readPanel?: (scan: ArtifactPanelScan) => Promise<ArtifactPanelReading | null>;
}

export interface VideoMaterial extends MergedMaterial {
  /** The card cropped from the clearest frame agreeing with consensus (WebP blob). */
  crop: Blob | null;
}

/** A weapon, artifact or character recognized in the recording, after row stitching. */
export interface VideoEquipment extends EquipmentSighting {
  /** Timestamp (s) of the frame its final reading comes from. */
  time: number;
  /** The card cropped from that frame (WebP blob). */
  crop: Blob | null;
}

export interface VideoScanResult {
  duration: number;
  width: number;
  height: number;
  /** Total frames sampled for motion analysis. */
  framesAnalysed: number;
  framesScanned: number;
  failedFrames: number;
  /** Total card readings over all frames. */
  cardsRead: number;
  /** Total card readings that matched nothing in the active catalog. */
  unknownCards: number;
  /** Artifact detail panels read. */
  panelsRead: number;
  materials: VideoMaterial[];
  /** Weapons, artifacts and characters in list order. */
  equipment: VideoEquipment[];
  /** Best Mora reading from the bag header over all frames, if visible. */
  mora?: MoraReading | null;
  /** Scanned crop of the bag header Mora pill, if visible. */
  moraCrop?: Blob | null;
  processingTimeMs: number;
}
