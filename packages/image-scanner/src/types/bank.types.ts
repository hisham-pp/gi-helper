import type { Rarity } from "./rarity.types";

export const CARD_KINDS = [
  "material",
  "weapon",
  "artifact",
  "character",
] as const;
export type CardKind = (typeof CARD_KINDS)[number];

/** One catalog item (material, weapon or artifact piece) that a reference bank can recognise. */
export interface ReferenceEntry {
  /** Unique per bank: the item id, plus a suffix for a variant (e.g. "amos-bow~awakened"). */
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

export interface AtlasManifest {
  format: string;
  version: number;
  /** The card kind the atlas is for; "material" when absent. */
  kind?: CardKind;
  /** Content hash of the atlas image; used for cache busting. */
  hash: string;
  tileSize: number;
  columns: number;
  /** Tile `i` (row-major) holds `entries[i]`. */
  entries: ReferenceEntry[];
}

/** One reference icon rendered into the artwork rows of a card frame. */
export interface Template {
  size: number;
  rows: number;
  /** Premultiplied colour, 0–1. */
  r: Float32Array;
  g: Float32Array;
  b: Float32Array;
  a: Float32Array;
  /** Background weight: 1 where the icon is fully transparent, fading to 0 by alpha 0.25. */
  w: Float32Array;
}

export interface ReferenceBank {
  kind: CardKind;
  version: string;
  entries: ReferenceEntry[];
  indexById: Map<string, number>;
  coarse: Template[];
  /** Built on first use; most references never reach the fine pass. */
  fine(index: number): Template;
}
