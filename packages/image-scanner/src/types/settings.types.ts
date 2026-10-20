import type { CardKind } from "./bank.types";

/**
 * Settings controlling card recognition, matching algorithms, and OCR passes.
 */
export interface RecognitionSettings {
  /** The bag tab the screenshot shows, or "auto" to infer dynamically per grid. */
  kind: "auto" | CardKind;
  /** Number of references kept from the coarse pass for full-resolution fine re-ranking. */
  shortlistSize: number;
  /** Alternatives reported per card (including the top match). */
  candidateCount: number;
  /** Rank candidates taking into account rarity read from stars and background. */
  useRarity: boolean;
  /**
   * Prefer, among near-identical candidates, the one that preserves Genshin's
   * canonical inventory order between neighbouring cards.
   */
  useInventoryOrder: boolean;
  /** Search a small shift/scale window around each card box to compensate for loose detections. */
  refineAlignment: boolean;
  /** Read the quantity (or level) printed in the footer under each card. */
  readQuantity: boolean;
  /** Read the Mora count from the bag header currency bar when visible. */
  readMora: boolean;
  /** Matches below this confidence (0–1) are reported as "uncertain". */
  minConfidence: number;
}
