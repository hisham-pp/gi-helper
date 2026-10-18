export interface DetectedItem {
  id: string;
  name: string;
  quantity: number;
  rarity?: number;
}

export interface ReviewCandidate {
  id: string;
  name: string;
  rarity?: number;
  confidence: number;
}

export interface ScannedReviewItem {
  id: string;
  materialId: string;
  name: string;
  quantity: number;
  rarity?: number;
  imageSnippet: string;
  sourceImageName: string;
  row?: number;
  col?: number;
  candidates?: ReviewCandidate[];
  /** Why this slot should be double-checked (e.g. a close runner-up or an unreadable quantity). */
  reviewReason?: string;
}

/** A weapon, artifact or character in the post-scan review (see lib/scan-equipment.ts). */
export interface EquipmentReviewItem {
  id: string;
  kind: "weapon" | "artifact" | "character";
  /** A weapon id, "<set id>:<slot>" or a character id; null when the scanner couldn't tell. */
  item: string | null;
  /** The weapon's, piece's or character's name ("Unidentified" without an item). */
  name: string;
  rarity?: number;
  /** "awakened" when the weapon showed its awakened icon (ascension 2+). */
  variant?: string;
  level: number;
  /** Weapons: 1–5. */
  refinement: number;
  locked: boolean;
  /** Artifacts: the GOOD main stat key ("" until chosen for sands, goblets and circlets). */
  mainStatKey: string;
  /** Artifacts: the main stat value the detail panel showed (46.6 for 46.6%). */
  mainStatValue?: number;
  /** Artifacts: substats from the detail panel, or entered in the review. */
  substats?: { key: string; value: number }[];
  /** Artifacts: a +0 artifact's 4th substat, shown but not active yet. */
  unactivatedSubstats?: { key: string; value: number }[];
  /** Artifacts: GOOD location key of the character wearing it, from the detail panel ("" when not read). */
  location?: string;
  /** Artifacts: the detail panel was read for this card. */
  fromPanel?: boolean;
  /** The Traveler's element ("Anemo", "Geo"…): GOOD keeps one Traveler per element. */
  element?: string;
  imageSnippet: string;
  sourceImageName: string;
  candidates?: ReviewCandidate[];
  /** Why this card should be double-checked. */
  reviewReason?: string;
}

export interface ProcessScanResult {
  items: DetectedItem[];
  reviewItems: ScannedReviewItem[];
}

export interface MaterialItem {
  id: string;
  name: string;
  description: string;
  type: string;
  rarity?: number;
  image: string;
  sortRank?: number;
  order: number;
  family?: string;
  /** Materials-tab items (other-materials.json) carry their category. */
  category?: string;
  /** Region of a local specialty. */
  region?: string;
}
