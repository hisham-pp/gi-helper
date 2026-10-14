/**
 * Scanning an uploaded file: validate → decode → rasterise → detect grids →
 * recognise materials. Shared by the Web Worker and the main-thread
 * fallback so both report the same timings and the same client-safe errors.
 */
import { decodeImage, rasterizeForDetection } from "../grid-detector/browser";
import { detectInventoryGrids } from "../grid-detector/engine/detect";
import { resolveDetectionSettings } from "../grid-detector/settings";
import { validateImageDimensions } from "../grid-detector/validation";
import type { DetectedGrid } from "../grid-detector/types";
import { loadReferenceBank } from "./browser";
import { recognizeMaterials } from "./engine/recognize";
import type { MaterialRecognitionResult, RecognitionSettings, ScanResult, ScanSettings } from "./types";
import type { ScanProgress } from "./worker-protocol";

const now = () => (typeof performance !== "undefined" ? performance.now() : Date.now());
const round1 = (v: number) => Math.round(v * 10) / 10;

type Progress = (p: ScanProgress) => void;

/** Grid detection + recognition of one screenshot. */
export async function scanBlob(
  blob: Blob,
  name: string | undefined,
  settings: Partial<ScanSettings>,
  onProgress: Progress = () => {},
): Promise<ScanResult> {
  const t0 = now();
  // References download while the screenshot is decoded and searched for grids.
  const bankPromise = loadReferenceBank();
  bankPromise.catch(() => undefined);
  onProgress({ stage: "decoding", done: 0, total: 0 });
  const bitmap = await decodeImage(blob, name);
  try {
    return await scanDecoded(bitmap, settings, onProgress, bankPromise, t0);
  } finally {
    bitmap.close();
  }
}

/**
 * Grid detection + recognition of an already decoded image, e.g. a video
 * frame. The caller keeps ownership of the bitmap.
 */
export async function scanBitmap(
  bitmap: ImageBitmap,
  settings: Partial<ScanSettings>,
  onProgress: Progress = () => {},
): Promise<ScanResult> {
  const t0 = now();
  const bankPromise = loadReferenceBank();
  bankPromise.catch(() => undefined);
  validateImageDimensions(bitmap.width, bitmap.height);
  return scanDecoded(bitmap, settings, onProgress, bankPromise, t0);
}

async function scanDecoded(
  bitmap: ImageBitmap,
  settings: Partial<ScanSettings>,
  onProgress: Progress,
  bankPromise: ReturnType<typeof loadReferenceBank>,
  t0: number,
): Promise<ScanResult> {
  const gridSettings = resolveDetectionSettings(settings.grid ?? {});
  const t1 = now();
  const full = rasterizeForDetection(bitmap, { region: null, maxAnalysisSide: gridSettings.maxAnalysisSide });
  const forDetection = gridSettings.region ? rasterizeForDetection(bitmap, gridSettings) : full;
  const t2 = now();
  onProgress({ stage: "detecting", done: 0, total: 0 });
  const detection = detectInventoryGrids(forDetection, gridSettings);
  detection.diagnostics.stageTimingsMs = {
    decode: round1(t1 - t0),
    rasterize: round1(t2 - t1),
    ...detection.diagnostics.stageTimingsMs,
  };
  detection.processingTimeMs = round1(now() - t0);

  onProgress({ stage: "loading-references", done: 0, total: 0 });
  const bank = await bankPromise;
  const recognition = recognizeMaterials(
    {
      image: full.image,
      source: { width: bitmap.width, height: bitmap.height },
      grids: detection.grids,
      onProgress: (done, total) => onProgress({ stage: "recognizing", done, total }),
    },
    bank,
    settings.recognition,
  );
  return { detection, recognition };
}

/** Recognition only, for grids that were already detected (and possibly edited). */
export async function recognizeBlob(
  blob: Blob,
  name: string | undefined,
  grids: DetectedGrid[],
  settings: Partial<RecognitionSettings>,
  onProgress: Progress = () => {},
): Promise<MaterialRecognitionResult> {
  const bankPromise = loadReferenceBank();
  bankPromise.catch(() => undefined);
  onProgress({ stage: "decoding", done: 0, total: 0 });
  const bitmap = await decodeImage(blob, name);
  try {
    const full = rasterizeForDetection(bitmap, { region: null, maxAnalysisSide: 1400 });
    onProgress({ stage: "loading-references", done: 0, total: 0 });
    const bank = await bankPromise;
    return recognizeMaterials(
      {
        image: full.image,
        source: { width: bitmap.width, height: bitmap.height },
        grids,
        onProgress: (done, total) => onProgress({ stage: "recognizing", done, total }),
      },
      bank,
      settings,
    );
  } finally {
    bitmap.close();
  }
}
