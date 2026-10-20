import type { GridDetectionErrorCode } from "./engine/errors";
import type { DetectionSettings, GridDetectionResult } from "./types";

export interface WorkerRequest {
  id: number;
  blob: Blob;
  name?: string;
  settings: Partial<DetectionSettings>;
}

export type WorkerResponse =
  | { id: number; ok: true; result: GridDetectionResult }
  | {
      id: number;
      ok: false;
      error: { code: GridDetectionErrorCode; message: string };
    };
