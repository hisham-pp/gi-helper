// ---------------------------------------------------------------------------
// Material recognition result types (all coordinates are ORIGINAL-image pixels)
// ---------------------------------------------------------------------------
import type { DetectionSettings, GridDetectionResult, PixelRect } from "../grid-detector/types";

export type Rarity = 1 | 2 | 3 | 4 | 5;

/** One catalog material that the reference bank can recognise. */
export interface ReferenceEntry {
  id: string;
  name: string;
  rarity: Rarity;
  /** Position in Genshin's fixed inventory order (ascending on screen). */
  order: number;
}

export interface MaterialCandidate {
  id: string;
  name: string;
  rarity: Rarity;
  /**
   * Mean per-pixel colour error of the reference icon composited over the
   * card's own background (0 = identical; ~0.03–0.12 for a true match).
   */
  error: number;
  /** 0–1, relative to the other candidates of the same card. */
  confidence: number;
}

export interface RarityReading {
  /** Final rarity, or null when neither signal could be read. */
  value: Rarity | null;
  /** Stars counted under the artwork, or null when the star row is unreadable. */
  stars: number | null;
  /** Rarity implied by the artwork background colour. */
  background: Rarity | null;
  /** 0–1 */
  confidence: number;
}

export interface QuantityReading {
  /** Parsed count, or null when no digits could be read. */
  value: number | null;
  /** Recognised characters; "?" marks a glyph that matched no digit well. */
  text: string;
  /** 0–1, the weakest digit's confidence. */
  confidence: number;
}

/**
 * - `matched`   – a clear best reference.
 * - `uncertain` – a plausible match that should be reviewed (close runner-up or weak fit).
 * - `unknown`   – nothing in the catalog fits (another inventory tab, an obstruction…).
 */
export type CardRecognitionStatus = "matched" | "uncertain" | "unknown";

export interface CardRecognition {
  cardId: string;
  gridId: string;
  row: number | null;
  column: number | null;
  /** The card box that was analysed (as detected or edited). */
  box: PixelRect;
  /**
   * Where the card was found to be after aspect correction and alignment:
   * the box whose top W × W square holds the matched icon.
   */
  matchedBox: PixelRect;
  status: CardRecognitionStatus;
  /** Best candidate; null when `status` is "unknown". */
  material: MaterialCandidate | null;
  /** Best first; includes `material`. */
  candidates: MaterialCandidate[];
  rarity: RarityReading;
  quantity: QuantityReading;
  /** A "New" badge covered part of the artwork and was ignored while matching. */
  hasNewBadge: boolean;
  /**
   * True when Genshin's inventory order picked a candidate other than the
   * visually best one (only ever between near-identical candidates).
   */
  orderAdjusted: boolean;
  /** 0–1 overall confidence (material, then quantity). */
  confidence: number;
}

/** One material aggregated over all cards that show it. */
export interface RecognizedItem {
  materialId: string;
  name: string;
  rarity: Rarity;
  /** Quantity from the most confident reading, or null if none was readable. */
  quantity: number | null;
  /** Cards showing this material (more than one when screenshots overlap). */
  cardIds: string[];
  confidence: number;
}

export interface RecognitionDiagnostics {
  referenceCount: number;
  bankVersion: string;
  /** Average fine-pass alignment evaluations per card. */
  alignmentEvaluations: number;
  stageTimingsMs: Record<string, number>;
}

export interface MaterialRecognitionResult {
  imageWidth: number;
  imageHeight: number;
  /** Reading order: grid by grid, row-major. Clipped cards are skipped. */
  cards: CardRecognition[];
  items: RecognizedItem[];
  processingTimeMs: number;
  /** Non-fatal notes, e.g. "3 cards need review". */
  warnings: string[];
  settings: RecognitionSettings;
  diagnostics: RecognitionDiagnostics;
}

export interface RecognitionSettings {
  /** References kept from the coarse pass for full-resolution re-ranking. */
  shortlistSize: number;
  /** Alternatives reported per card (including the best). */
  candidateCount: number;
  /** Rank candidates with the rarity read from the stars and background. */
  useRarity: boolean;
  /**
   * Prefer, among near-identical candidates, the one that keeps Genshin's
   * fixed inventory order between neighbouring cards.
   */
  useInventoryOrder: boolean;
  /** Search a small shift/scale around each card box to compensate for loose boxes. */
  refineAlignment: boolean;
  /** Read the quantity printed under each card. */
  readQuantity: boolean;
  /** Matches below this confidence (0–1) are reported as "uncertain". */
  minConfidence: number;
}

/** Grid detection plus recognition of one screenshot. */
export interface ScanResult {
  detection: GridDetectionResult;
  recognition: MaterialRecognitionResult;
}

export interface ScanSettings {
  grid: Partial<DetectionSettings>;
  recognition: Partial<RecognitionSettings>;
}
