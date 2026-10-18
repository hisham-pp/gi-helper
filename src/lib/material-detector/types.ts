// ---------------------------------------------------------------------------
// Material recognition result types (all coordinates are ORIGINAL-image pixels)
// ---------------------------------------------------------------------------
import type { DetectionSettings, GridDetectionResult, PixelRect } from "../grid-detector/types";
import type { ArtifactPanelScan } from "../artifact-panel/types";

export type Rarity = 1 | 2 | 3 | 4 | 5;

/**
 * The kinds of card the recognizer knows, each with its own reference bank:
 * materials (Character Development Items and the Materials tab, with a count
 * under the icon), weapons ("Lv. 90" and a star row), artifacts ("+20") and
 * characters (the party setup's character list: "Lv. 90", no stars).
 */
export const CARD_KINDS = ["material", "weapon", "artifact", "character"] as const;
export type CardKind = (typeof CARD_KINDS)[number];

/** One catalog item (material, weapon or artifact piece) that a reference bank can recognise. */
export interface ReferenceEntry {
  /** Unique per bank: the item id, plus a suffix for a variant ("amos-bow~awakened"). */
  id: string;
  name: string;
  /** The rarity (for artifacts, the highest one the piece comes in). */
  rarity: Rarity;
  /** Position in Genshin's fixed inventory order (ascending on screen; materials only). */
  order: number;
  /** The item this tile shows, when `id` is a variant of it. */
  item?: string;
  /**
   * Another icon of the same item: "awakened" (a weapon from its second
   * ascension on), "alt" / "awakened-alt" (HoYoLAB's framing of the icon).
   */
  variant?: string;
  /** Every rarity the item comes in, when more than one (artifact pieces). */
  rarities?: Rarity[];
}

/** A catalog item a card may show (a material, a weapon or an artifact piece, by the card's kind). */
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

/** A number read from a card: a weapon's level ("Lv. 90"), an artifact's ("+20"), a refinement rank. */
export interface NumberReading {
  /** null when it could not be read. */
  value: number | null;
  /** 0–1 */
  confidence: number;
}

/** Which bag tab a grid shows, and how that was decided. */
export interface GridKindReading {
  gridId: string;
  kind: CardKind;
  /**
   * - `setting`: chosen by the caller
   * - `text`: the text under the cards ("Lv. 90", "+20" or a count)
   * - `icons`: the reference bank whose icons fit the cards best
   */
  source: "setting" | "text" | "icons";
  /** 0–1 */
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
  /** The bag tab the card's grid shows; `material` holds an item of this kind. */
  kind: CardKind;
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
  /** Best candidate (a material, weapon or artifact piece, by `kind`); null when `status` is "unknown". */
  material: MaterialCandidate | null;
  /** Best first; includes `material`. */
  candidates: MaterialCandidate[];
  rarity: RarityReading;
  /** The count under a material (empty for weapons and artifacts). */
  quantity: QuantityReading;
  /** Weapons: the level after "Lv."; artifacts: the enhancement level after "+". Null for materials. */
  level: NumberReading | null;
  /** Weapons: the refinement badge in the top-left corner. Null for other kinds. */
  refinement: NumberReading | null;
  /** Weapons and artifacts: whether the lock icon shows. Null for materials. */
  locked: boolean | null;
  /** A "New" badge covered part of the artwork and was ignored while matching. */
  hasNewBadge: boolean;
  /**
   * True when Genshin's inventory order picked a candidate other than the
   * visually best one (only ever between near-identical candidates).
   */
  orderAdjusted: boolean;
  /** 0–1 overall confidence (item, then quantity or level). */
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
  /** The kind of each grid that was recognised. */
  grids: GridKindReading[];
  /** Reading order: grid by grid, row-major. Clipped cards are skipped. */
  cards: CardRecognition[];
  /** Material cards aggregated per material (weapons and artifacts repeat, so they aren't). */
  items: RecognizedItem[];
  processingTimeMs: number;
  /** Non-fatal notes, e.g. "3 cards need review". */
  warnings: string[];
  settings: RecognitionSettings;
  diagnostics: RecognitionDiagnostics;
}

export interface RecognitionSettings {
  /** The bag tab the screenshot shows, or "auto" to tell from each grid. */
  kind: "auto" | CardKind;
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
  /** Read the quantity (or level) printed under each card. */
  readQuantity: boolean;
  /** Matches below this confidence (0–1) are reported as "uncertain". */
  minConfidence: number;
}

/** Grid detection plus recognition of one screenshot. */
export interface ScanResult {
  detection: GridDetectionResult;
  recognition: MaterialRecognitionResult;
  /**
   * The artifact detail panel beside the grid (or filling the screen), ready
   * to be read by src/lib/artifact-panel; null when there is none.
   */
  panel?: ArtifactPanelScan | null;
}

export interface ScanSettings {
  grid: Partial<DetectionSettings>;
  recognition: Partial<RecognitionSettings>;
  /** Look for an artifact detail panel (default true). */
  panel?: boolean;
}
