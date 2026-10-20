/**
 * Rarity types and readings for inventory items (1–5 stars).
 */

export type Rarity = 1 | 2 | 3 | 4 | 5;

export interface RarityReading {
  /** Final resolved rarity, or null when neither stars nor background could be determined. */
  value: Rarity | null;
  /** Stars counted directly under the artwork, or null when unreadable. */
  stars: number | null;
  /** Rarity implied by the artwork background hue/saturation. */
  background: Rarity | null;
  /** Confidence score between 0 and 1. */
  confidence: number;
}

export interface StarReading {
  count: number;
  /** Width of the star row as a fraction of the card width. */
  extent: number;
  /** Score between 0 and 1 indicating how cleanly the row fits expected star geometry. */
  quality: number;
}
