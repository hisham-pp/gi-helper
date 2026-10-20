import type { PixelRect } from "../../grid-detector/types";
import type { CardKind } from "./bank.types";
import type { MoraReading } from "./mora.types";
import type { NumberReading, QuantityReading } from "./quantity.types";
import type { Rarity, RarityReading } from "./rarity.types";
import type { RecognitionSettings } from "./settings.types";

/**
 * A catalog candidate matched for a card.
 */
export interface MaterialCandidate {
  /** The item's id: a material id, a weapon id or "<set id>:<slot>". */
  id: string;
  name: string;
  rarity: Rarity;
  /** The icon variant that matched ("awakened", "alt", "awakened-alt"). */
  variant?: string;
  /**
   * Mean per-pixel colour error of the reference icon composited over the
   * card's own background (0 = identical; ~0.03–0.12 for a true match).
   */
  error: number;
  /** Confidence score between 0 and 1, relative to sibling candidates. */
  confidence: number;
}

/**
 * Resolution of which inventory bag tab a grid shows.
 */
export interface GridKindReading {
  gridId: string;
  kind: CardKind;
  /**
   * - `setting`: chosen by caller configuration
   * - `text`: the text below cards ("Lv. 90", "+20", or a count)
   * - `icons`: reference bank whose icons best fit the cards
   */
  source: "setting" | "text" | "icons";
  /** Confidence score between 0 and 1. */
  confidence: number;
}

/**
 * Categorical match status for card identification:
 * - `matched`: Clear best reference match found.
 * - `uncertain`: Plausible match that warrants user review (close runner-up or weak score).
 * - `unknown`: Nothing in the active catalog fits (different tab, obstructed, etc.).
 */
export type CardRecognitionStatus = "matched" | "uncertain" | "unknown";

/**
 * Comprehensive recognition reading for a single card.
 */
export interface CardRecognition {
  cardId: string;
  gridId: string;
  /** The bag tab kind the card's grid shows. */
  kind: CardKind;
  row: number | null;
  column: number | null;
  /** The original card box that was analysed (as detected or manually edited). */
  box: PixelRect;
  /**
   * Where the card was placed after aspect correction and alignment refinement:
   * the box whose top W × W square holds the matched icon.
   */
  matchedBox: PixelRect;
  status: CardRecognitionStatus;
  /** Best matched candidate; null when status is "unknown". */
  material: MaterialCandidate | null;
  /** Ranked candidates (best first, including material). */
  candidates: MaterialCandidate[];
  rarity: RarityReading;
  /** The quantity count under a material card (empty for equipment). */
  quantity: QuantityReading;
  /** Weapons: level after "Lv."; artifacts: enhancement level after "+". Null for materials. */
  level: NumberReading | null;
  /** Weapons: refinement badge in top-left corner. Null for other kinds. */
  refinement: NumberReading | null;
  /** Weapons and artifacts: whether lock icon is visible. Null for materials. */
  locked: boolean | null;
  /** Indicates a "New" badge covered part of the artwork and was masked out. */
  hasNewBadge: boolean;
  /**
   * True when Genshin canonical inventory order broke a near-tie between candidates.
   */
  orderAdjusted: boolean;
  /** Overall confidence score between 0 and 1. */
  confidence: number;
}

/**
 * One material aggregated over all cards that show it across frames/screenshots.
 */
export interface RecognizedItem {
  materialId: string;
  name: string;
  rarity: Rarity;
  /** Quantity from the highest-confidence reading, or null if none readable. */
  quantity: number | null;
  /** Card IDs showing this material. */
  cardIds: string[];
  confidence: number;
}

/**
 * Performance timings and diagnostic statistics for recognition.
 */
export interface RecognitionDiagnostics {
  referenceCount: number;
  bankVersion: string;
  /** Average fine-pass alignment evaluations per card. */
  alignmentEvaluations: number;
  stageTimingsMs: Record<string, number>;
}

/**
 * The complete output of the card recognition pass for an image.
 */
export interface MaterialRecognitionResult {
  imageWidth: number;
  imageHeight: number;
  /** The Mora count read from the bag header currency bar, if visible. */
  mora?: MoraReading | null;
  /** The determined kind for each detected grid. */
  grids: GridKindReading[];
  /** Recognized cards in grid-by-grid, row-major reading order. Clipped cards skipped. */
  cards: CardRecognition[];
  /** Aggregated material summaries (materials only; equipment is stitched). */
  items: RecognizedItem[];
  processingTimeMs: number;
  /** Non-fatal diagnostic warnings. */
  warnings: string[];
  settings: RecognitionSettings;
  diagnostics: RecognitionDiagnostics;
}
