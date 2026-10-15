/**
 * Scanning an uploaded file: validate → decode → rasterise → detect grids →
 * decide each grid's kind (materials, weapons, artifacts) → load those
 * reference banks → recognise the cards. Shared by the Web Worker and the
 * main-thread fallback so both report the same timings and the same
 * client-safe errors.
 */
import { decodeImage, rasterizeForDetection } from "../grid-detector/browser";
import { detectInventoryGrids } from "../grid-detector/engine/detect";
import { resolveDetectionSettings } from "../grid-detector/settings";
import { validateImageDimensions } from "../grid-detector/validation";
import type { DetectedGrid } from "../grid-detector/types";
import { loadReferenceBank, loadReferenceBanks } from "./browser";
import { decideGridKinds, recognizeCards, type RecognitionInput } from "./engine/recognize";
import {
  CARD_KINDS,
  type CardKind,
  type GridKindReading,
  type MaterialRecognitionResult,
  type RecognitionSettings,
  type ScanResult,
  type ScanSettings,
} from "./types";
import type { ScanProgress } from "./worker-protocol";

const now = () => (typeof performance !== "undefined" ? performance.now() : Date.now());
const round1 = (v: number) => Math.round(v * 10) / 10;

type Progress = (p: ScanProgress) => void;

/**
 * Starts loading the material bank early (while decoding and detecting)
 * unless the caller asked for another kind: most scans are materials, and
 * the bank is usually preloaded already.
 */
function prefetch(settings: Partial<RecognitionSettings> | undefined) {
  const kind = settings?.kind ?? "auto";
  if (kind !== "auto" && kind !== "material") return;
  loadReferenceBank("material").catch(() => undefined);
}

/**
 * Recognises with the banks the grids need: the kinds their text tells
 * (only those atlases are downloaded), or every kind when the text can't
 * tell and the icons must decide.
 */
async function recognizeWithBanks(
  input: RecognitionInput,
  settings: Partial<RecognitionSettings> | undefined,
  onProgress: Progress,
): Promise<MaterialRecognitionResult> {
  const kind = settings?.kind ?? "auto";
  const guesses = decideGridKinds(input, {}, { kind });
  const decided: Record<string, GridKindReading> = {};
  const needed = new Set<CardKind>();
  for (const g of guesses) {
    if (g.source === "text" && g.confidence === 0) {
      CARD_KINDS.forEach((k) => needed.add(k));
    } else {
      decided[g.gridId] = g;
      needed.add(g.kind);
    }
  }
  if (needed.size === 0) needed.add(kind === "auto" ? "material" : kind);
  onProgress({ stage: "loading-references", done: 0, total: 0 });
  const banks = await loadReferenceBanks(needed);
  return recognizeCards(
    {
      ...input,
      kinds: decided,
      onProgress: (done, total) => onProgress({ stage: "recognizing", done, total }),
    },
    banks,
    settings,
  );
}

/** Grid detection + recognition of one screenshot. */
export async function scanBlob(
  blob: Blob,
  name: string | undefined,
  settings: Partial<ScanSettings>,
  onProgress: Progress = () => {},
): Promise<ScanResult> {
  const t0 = now();
  // References download while the screenshot is decoded and searched for grids.
  prefetch(settings.recognition);
  onProgress({ stage: "decoding", done: 0, total: 0 });
  const bitmap = await decodeImage(blob, name);
  try {
    return await scanDecoded(bitmap, settings, onProgress, t0);
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
  prefetch(settings.recognition);
  validateImageDimensions(bitmap.width, bitmap.height);
  return scanDecoded(bitmap, settings, onProgress, t0);
}

async function scanDecoded(
  bitmap: ImageBitmap,
  settings: Partial<ScanSettings>,
  onProgress: Progress,
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

  const recognition = await recognizeWithBanks(
    { image: full.image, source: { width: bitmap.width, height: bitmap.height }, grids: detection.grids },
    settings.recognition,
    onProgress,
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
  prefetch(settings);
  onProgress({ stage: "decoding", done: 0, total: 0 });
  const bitmap = await decodeImage(blob, name);
  try {
    const full = rasterizeForDetection(bitmap, { region: null, maxAnalysisSide: 1400 });
    return await recognizeWithBanks(
      { image: full.image, source: { width: bitmap.width, height: bitmap.height }, grids },
      settings,
      onProgress,
    );
  } finally {
    bitmap.close();
  }
}
