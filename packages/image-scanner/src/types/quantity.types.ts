/**
 * Quantity and number recognition types for card footers.
 */

export interface QuantityReading {
  /** Parsed count, or null when no digits could be read. */
  value: number | null;
  /** Recognised characters; "?" marks a glyph that matched no digit well. */
  text: string;
  /** Weakest digit confidence score between 0 and 1. */
  confidence: number;
}

/**
 * A numeric reading parsed from a card footer (e.g. "Lv. 90", "+20", refinement rank).
 */
export interface NumberReading {
  /** Parsed integer, or null when unreadable. */
  value: number | null;
  /** Confidence score between 0 and 1. */
  confidence: number;
}

/**
 * Pre-compiled digit glyph templates used for font correlation.
 */
export interface DigitTemplates {
  width: number;
  height: number;
  /** "0"–"9" → GLYPH_W × GLYPH_H ink values (0–1), row-major. */
  digits: Record<string, number[]>;
  /**
   * The non-digit glyphs of weapon and artifact footers ("Lv. 90", "+20"):
   * "L", "v" and "+", same layout as `digits`.
   */
  symbols?: Record<string, number[]>;
}
