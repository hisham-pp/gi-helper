import {
  CARD_KINDS,
  DEFAULT_RECOGNITION_SETTINGS,
  RECOGNITION_SETTING_LIMITS,
} from "./constants/recognition.constants";
import type { RecognitionSettings } from "./types/settings.types";

export { DEFAULT_RECOGNITION_SETTINGS } from "./constants/recognition.constants";

const clamp = (v: number, lo: number, hi: number): number =>
  Math.min(hi, Math.max(lo, v));

const finiteOr = (v: unknown, fallback: number): number =>
  typeof v === "number" && Number.isFinite(v) ? v : fallback;

const boolOr = (v: unknown, fallback: boolean): boolean =>
  typeof v === "boolean" ? v : fallback;

/** Merges partial user settings over the defaults and clamps every field to a safe range. */
export function resolveRecognitionSettings(
  partial: Partial<RecognitionSettings> = {},
): RecognitionSettings {
  const d = DEFAULT_RECOGNITION_SETTINGS;
  const limits = RECOGNITION_SETTING_LIMITS;

  return {
    kind: (CARD_KINDS as readonly unknown[]).includes(partial.kind)
      ? partial.kind!
      : d.kind,
    shortlistSize: Math.round(
      clamp(
        finiteOr(partial.shortlistSize, d.shortlistSize),
        limits.shortlistSize.min,
        limits.shortlistSize.max,
      ),
    ),
    candidateCount: Math.round(
      clamp(
        finiteOr(partial.candidateCount, d.candidateCount),
        limits.candidateCount.min,
        limits.candidateCount.max,
      ),
    ),
    useRarity: boolOr(partial.useRarity, d.useRarity),
    useInventoryOrder: boolOr(partial.useInventoryOrder, d.useInventoryOrder),
    refineAlignment: boolOr(partial.refineAlignment, d.refineAlignment),
    readQuantity: boolOr(partial.readQuantity, d.readQuantity),
    readMora: boolOr(partial.readMora, d.readMora),
    minConfidence: clamp(
      finiteOr(partial.minConfidence, d.minConfidence),
      limits.minConfidence.min,
      limits.minConfidence.max,
    ),
  };
}
