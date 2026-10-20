import type { DetectionSettings, PixelRect } from "./types";
import {
  DEFAULT_DETECTION_SETTINGS,
  GRID_SETTING_LIMITS,
} from "./constants/grid.constants";

export { DEFAULT_DETECTION_SETTINGS } from "./constants/grid.constants";

const clamp = (v: number, lo: number, hi: number): number =>
  Math.min(hi, Math.max(lo, v));

const finiteOr = (v: unknown, fallback: number): number =>
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

/** Merges partial user settings over the defaults and clamps every field to a safe range. */
export function resolveDetectionSettings(
  partial: Partial<DetectionSettings> = {},
): DetectionSettings {
  const d = DEFAULT_DETECTION_SETTINGS;
  const limits = GRID_SETTING_LIMITS;

  const minAspect = clamp(
    finiteOr(partial.minAspectRatio, d.minAspectRatio),
    limits.aspectRatio.min,
    limits.aspectRatio.max,
  );
  const maxAspect = clamp(
    finiteOr(partial.maxAspectRatio, d.maxAspectRatio),
    limits.aspectRatio.min,
    limits.aspectRatio.max,
  );

  return {
    sensitivity: clamp(
      finiteOr(partial.sensitivity, d.sensitivity),
      limits.sensitivity.min,
      limits.sensitivity.max,
    ),
    minCardSize: clamp(
      finiteOr(partial.minCardSize, d.minCardSize),
      limits.minCardSize.min,
      limits.minCardSize.max,
    ),
    maxCardSizeRatio: clamp(
      finiteOr(partial.maxCardSizeRatio, d.maxCardSizeRatio),
      limits.maxCardSizeRatio.min,
      limits.maxCardSizeRatio.max,
    ),
    minAspectRatio: Math.min(minAspect, maxAspect),
    maxAspectRatio: Math.max(minAspect, maxAspect),
    minConfidence: clamp(
      finiteOr(partial.minConfidence, d.minConfidence),
      limits.minConfidence.min,
      limits.minConfidence.max,
    ),
    sizeTolerance: clamp(
      finiteOr(partial.sizeTolerance, d.sizeTolerance),
      limits.sizeTolerance.min,
      limits.sizeTolerance.max,
    ),
    alignmentTolerance: clamp(
      finiteOr(partial.alignmentTolerance, d.alignmentTolerance),
      limits.alignmentTolerance.min,
      limits.alignmentTolerance.max,
    ),
    recoverMissedCards: partial.recoverMissedCards ?? d.recoverMissedCards,
    includeClippedCards: partial.includeClippedCards ?? d.includeClippedCards,
    region: normalizeRegion(partial.region ?? d.region),
    maxAnalysisSide: Math.round(
      clamp(
        finiteOr(partial.maxAnalysisSide, d.maxAnalysisSide),
        limits.maxAnalysisSide.min,
        limits.maxAnalysisSide.max,
      ),
    ),
  };
}
