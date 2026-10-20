/**
 * Primary scanning pipeline orchestrator.
 * Coordinates: validate -> decode -> rasterize -> grid detection ->
 * resolve grid kind -> load reference banks -> card recognition ->
 * artifact panel capture.
 */
import { capturePanelScan } from "@gi/artifact-panel";
import {
  decodeImage,
  rasterizeForDetection,
  detectInventoryGrids,
  resolveDetectionSettings,
  validateImageDimensions,
  type DetectedGrid,
} from "@gi/grid-detector";
import {
  loadReferenceBank,
  loadReferenceBanks,
  decideGridKinds,
  recognizeCards,
  CARD_KINDS,
  type CardKind,
  type GridKindReading,
  type MaterialRecognitionResult,
  type RecognitionInput,
  type RecognitionSettings,
} from "@gi/image-scanner";
import type {
  ScanProgress,
  ScanResult,
  ScanSettings,
} from "../types/orchestration.types";

const now = () =>
  typeof performance !== "undefined" ? performance.now() : Date.now();
const round1 = (v: number) => Math.round(v * 10) / 10;

type ProgressCallback = (p: ScanProgress) => void;

/**
 * Starts preloading the material reference bank early while decoding and detecting,
 * unless caller explicitly requested another kind.
 */
function prefetch(settings: Partial<RecognitionSettings> | undefined) {
  const kind = settings?.kind ?? "auto";
  if (kind !== "auto" && kind !== "material") return;
  loadReferenceBank("material").catch(() => undefined);
}

/**
 * Recognises cards with the banks their grids require (based on detected text or icons).
 */
async function recognizeWithBanks(
  input: RecognitionInput,
  settings: Partial<RecognitionSettings> | undefined,
  onProgress: ProgressCallback,
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
      onProgress: (done, total) =>
        onProgress({ stage: "recognizing", done, total }),
    },
    banks,
    settings,
  );
}

/** Grid detection + recognition of one screenshot blob. */
export async function scanBlob(
  blob: Blob,
  name: string | undefined,
  settings: Partial<ScanSettings>,
  onProgress: ProgressCallback = () => {},
): Promise<ScanResult> {
  const t0 = now();
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
 * Grid detection + recognition of an already decoded ImageBitmap (e.g. from a video frame).
 * Caller retains ownership of the bitmap.
 */
export async function scanBitmap(
  bitmap: ImageBitmap,
  settings: Partial<ScanSettings>,
  onProgress: ProgressCallback = () => {},
): Promise<ScanResult> {
  const t0 = now();
  prefetch(settings.recognition);
  validateImageDimensions(bitmap.width, bitmap.height);
  return scanDecoded(bitmap, settings, onProgress, t0);
}

export async function scanDecoded(
  bitmap: ImageBitmap,
  settings: Partial<ScanSettings>,
  onProgress: ProgressCallback,
  t0: number,
): Promise<ScanResult> {
  const gridSettings = resolveDetectionSettings(settings.grid ?? {});
  const t1 = now();
  const full = rasterizeForDetection(bitmap, {
    region: null,
    maxAnalysisSide: gridSettings.maxAnalysisSide,
  });
  const forDetection = gridSettings.region
    ? rasterizeForDetection(bitmap, gridSettings)
    : full;
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
    {
      image: full.image,
      source: { width: bitmap.width, height: bitmap.height },
      grids: detection.grids,
    },
    settings.recognition,
    onProgress,
  );
  const panel =
    settings.panel === false
      ? null
      : capturePanelScan(
          full.image,
          bitmap.width / full.image.width,
          detection.grids,
          recognition.grids,
        );
  return { detection, recognition, panel };
}

/** Recognition only, for grids that were already detected (and optionally manually edited). */
export async function recognizeBlob(
  blob: Blob,
  name: string | undefined,
  grids: DetectedGrid[],
  settings: Partial<RecognitionSettings>,
  onProgress: ProgressCallback = () => {},
): Promise<MaterialRecognitionResult> {
  prefetch(settings);
  onProgress({ stage: "decoding", done: 0, total: 0 });
  const bitmap = await decodeImage(blob, name);
  try {
    const full = rasterizeForDetection(bitmap, {
      region: null,
      maxAnalysisSide: 1400,
    });
    return await recognizeWithBanks(
      {
        image: full.image,
        source: { width: bitmap.width, height: bitmap.height },
        grids,
      },
      settings,
      onProgress,
    );
  } finally {
    bitmap.close();
  }
}
