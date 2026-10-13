import type { RecognitionSettings } from "./types";

/**
 * Defaults tuned on the Genshin reference screenshots in
 * `public/samples/test-set-01/` (see docs/material-detector.md).
 */
export const DEFAULT_RECOGNITION_SETTINGS: RecognitionSettings = {
  shortlistSize: 12,
  candidateCount: 5,
  useRarity: true,
  useInventoryOrder: true,
  refineAlignment: true,
  readQuantity: true,
  minConfidence: 0.5,
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

const finiteOr = (v: unknown, fallback: number) =>
  typeof v === "number" && Number.isFinite(v) ? v : fallback;

const boolOr = (v: unknown, fallback: boolean) => (typeof v === "boolean" ? v : fallback);

/** Merges partial user settings over the defaults and clamps every field to a sane range. */
export function resolveRecognitionSettings(
  partial: Partial<RecognitionSettings> = {},
): RecognitionSettings {
  const d = DEFAULT_RECOGNITION_SETTINGS;
  return {
    shortlistSize: Math.round(clamp(finiteOr(partial.shortlistSize, d.shortlistSize), 2, 64)),
    candidateCount: Math.round(clamp(finiteOr(partial.candidateCount, d.candidateCount), 1, 10)),
    useRarity: boolOr(partial.useRarity, d.useRarity),
    useInventoryOrder: boolOr(partial.useInventoryOrder, d.useInventoryOrder),
    refineAlignment: boolOr(partial.refineAlignment, d.refineAlignment),
    readQuantity: boolOr(partial.readQuantity, d.readQuantity),
    minConfidence: clamp(finiteOr(partial.minConfidence, d.minConfidence), 0, 1),
  };
}
