/**
 * Detection from an uploaded file: validate → decode → rasterise → detect.
 * Shared by the Web Worker and the main-thread fallback so both report the
 * same timings and the same client-safe errors.
 */
import { decodeImage, rasterizeForDetection } from "./browser";
import { detectInventoryGrids } from "./engine/detect";
import { resolveDetectionSettings } from "./settings";
import type { DetectionSettings, GridDetectionResult } from "./types";

const now = () =>
  typeof performance !== "undefined" ? performance.now() : Date.now();
const round1 = (v: number) => Math.round(v * 10) / 10;

export async function detectFromBlob(
  blob: Blob,
  name: string | undefined,
  partialSettings: Partial<DetectionSettings>,
): Promise<GridDetectionResult> {
  const t0 = now();
  const settings = resolveDetectionSettings(partialSettings);
  const bitmap = await decodeImage(blob, name);
  try {
    const t1 = now();
    const input = rasterizeForDetection(bitmap, settings);
    const t2 = now();
    const result = detectInventoryGrids(input, settings);
    result.diagnostics.stageTimingsMs = {
      decode: round1(t1 - t0),
      rasterize: round1(t2 - t1),
      ...result.diagnostics.stageTimingsMs,
    };
    result.processingTimeMs = round1(now() - t0);
    return result;
  } finally {
    bitmap.close();
  }
}
