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
