import type { DetectionSettings, PixelRect } from "./types";

/**
 * Defaults tuned on the Genshin reference screenshots in
 * `public/samples/grid-test/` and on synthetic grids. None of them encode a
 * grid size, card size or screen resolution.
 */
export const DEFAULT_DETECTION_SETTINGS: DetectionSettings = {
  sensitivity: 0.5,
  minCardSize: 24,
  maxCardSizeRatio: 1,
  minAspectRatio: 0.35,
  maxAspectRatio: 1.35,
  minConfidence: 0.35,
  sizeTolerance: 0.12,
  alignmentTolerance: 0.08,
  recoverMissedCards: true,
  includeClippedCards: false,
  region: null,
  maxAnalysisSide: 1400,
};

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

const finiteOr = (v: unknown, fallback: number) =>
  typeof v === "number" && Number.isFinite(v) ? v : fallback;

function normalizeRegion(
  region: PixelRect | null | undefined,
): PixelRect | null {
  if (!region) return null;
  const x = Math.round(finiteOr(region.x, 0));
  const y = Math.round(finiteOr(region.y, 0));
  const width = Math.round(finiteOr(region.width, 0));
  const height = Math.round(finiteOr(region.height, 0));
  if (width <= 0 || height <= 0) return null;
  return { x, y, width, height };
}

/** Merges partial user settings over the defaults and clamps every field to a sane range. */
export function resolveDetectionSettings(
  partial: Partial<DetectionSettings> = {},
): DetectionSettings {
  const d = DEFAULT_DETECTION_SETTINGS;
  const minAspect = clamp(
    finiteOr(partial.minAspectRatio, d.minAspectRatio),
    0.1,
    10,
  );
  const maxAspect = clamp(
    finiteOr(partial.maxAspectRatio, d.maxAspectRatio),
    0.1,
    10,
  );
  return {
    sensitivity: clamp(finiteOr(partial.sensitivity, d.sensitivity), 0, 1),
    minCardSize: clamp(finiteOr(partial.minCardSize, d.minCardSize), 8, 4096),
    maxCardSizeRatio: clamp(
      finiteOr(partial.maxCardSizeRatio, d.maxCardSizeRatio),
      0.05,
      1,
    ),
    minAspectRatio: Math.min(minAspect, maxAspect),
    maxAspectRatio: Math.max(minAspect, maxAspect),
    minConfidence: clamp(
      finiteOr(partial.minConfidence, d.minConfidence),
      0,
      1,
    ),
    sizeTolerance: clamp(
      finiteOr(partial.sizeTolerance, d.sizeTolerance),
      0.02,
      0.4,
    ),
    alignmentTolerance: clamp(
      finiteOr(partial.alignmentTolerance, d.alignmentTolerance),
      0.03,
      0.4,
    ),
    recoverMissedCards: partial.recoverMissedCards ?? d.recoverMissedCards,
    includeClippedCards: partial.includeClippedCards ?? d.includeClippedCards,
    region: normalizeRegion(partial.region ?? d.region),
    maxAnalysisSide: Math.round(
      clamp(finiteOr(partial.maxAnalysisSide, d.maxAnalysisSide), 320, 4096),
    ),
  };
}
