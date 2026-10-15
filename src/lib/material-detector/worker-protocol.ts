import type { DetectedGrid } from "../grid-detector/types";
import type { MaterialDetectionErrorCode } from "./engine/errors";
import type { CardKind, MaterialRecognitionResult, RecognitionSettings, ScanResult, ScanSettings } from "./types";

/** What the worker is doing; `done/total` count cards while recognising. */
export type ScanStage = "loading-references" | "decoding" | "detecting" | "recognizing";

export interface ScanProgress {
  stage: ScanStage;
  done: number;
  total: number;
}

export type ScanWorkerRequest =
  | { id: number; kind: "scan"; blob: Blob; name?: string; settings: Partial<ScanSettings> }
  /** An already decoded image (a video frame); the worker closes its copy when done. */
  | { id: number; kind: "scan-frame"; bitmap: ImageBitmap; settings: Partial<ScanSettings> }
  | {
      id: number;
      kind: "recognize";
      blob: Blob;
      name?: string;
      grids: DetectedGrid[];
      settings: Partial<RecognitionSettings>;
    }
  /** Loads a reference bank ahead of the first scan (the material one by default). */
  | { id: number; kind: "preload"; bank?: CardKind };

export type ScanWorkerResponse =
  | ({ id: number; type: "progress" } & ScanProgress)
  | { id: number; type: "done"; result: ScanResult | MaterialRecognitionResult | null }
  | { id: number; type: "error"; error: { code: MaterialDetectionErrorCode; message: string } };
