import type { DetectedGrid } from "../grid-detector/types";
import type { MaterialDetectionErrorCode } from "./engine/errors";
import type { MaterialRecognitionResult, RecognitionSettings, ScanResult, ScanSettings } from "./types";

/** What the worker is doing; `done/total` count cards while recognising. */
export type ScanStage = "loading-references" | "decoding" | "detecting" | "recognizing";

export interface ScanProgress {
  stage: ScanStage;
  done: number;
  total: number;
}

export type ScanWorkerRequest =
  | { id: number; kind: "scan"; blob: Blob; name?: string; settings: Partial<ScanSettings> }
  | {
      id: number;
      kind: "recognize";
      blob: Blob;
      name?: string;
      grids: DetectedGrid[];
      settings: Partial<RecognitionSettings>;
    }
  | { id: number; kind: "preload" };

export type ScanWorkerResponse =
  | ({ id: number; type: "progress" } & ScanProgress)
  | { id: number; type: "done"; result: ScanResult | MaterialRecognitionResult | null }
  | { id: number; type: "error"; error: { code: MaterialDetectionErrorCode; message: string } };
