/**
 * Weapons, artifacts and characters read by the scanners, on their way to
 * the inventory.
 *
 * Materials are merged by id (each shows once in the bag), but the same
 * weapon or artifact can be owned many times. Overlapping screenshots and
 * the frames of a recording are therefore stitched by rows: a new frame's
 * first rows are matched against the rows read so far (same items, levels
 * and refinements in the same columns), and only the rows past the overlap
 * are added. Characters (the party setup's list) are stitched the same way
 * and then kept once each. Then each card becomes a GOOD entry.
 */
import type { ArtifactSetInfo, WeaponInfo } from "./good/catalog";
import {
  ASCENSION_MAX_LEVEL,
  type GoodArtifact,
  type GoodCharacter,
  type GoodWeapon,
  type SlotKey,
} from "./good/types";
import type { CardRecognition, CardRecognitionStatus, MaterialCandidate } from "./material-detector/types";

export type EquipmentKind = "weapon" | "artifact" | "character";

export const EQUIPMENT_KINDS: readonly EquipmentKind[] = ["weapon", "artifact", "character"];

/** One weapon, artifact or character card, as read in one screenshot or frame. */
export interface EquipmentSighting {
  kind: EquipmentKind;
  /** The catalog item: a weapon id, "<set id>:<slot>" or a character id; null when unidentified. */
  item: string | null;
  /** "awakened" (or "awakened-alt") when the weapon showed its awakened icon. */
  variant?: string;
  rarity: number | null;
  level: number | null;
  /** Weapons only. */
  refinement: number | null;
  locked: boolean;
  status: CardRecognitionStatus;
  /** 0–1 */
  confidence: number;
  candidates: MaterialCandidate[];
  /** The screenshot or frame it was read in, and where. */
  source: number;
  row: number;
  column: number;
  card: CardRecognition;
}

/** The weapon, artifact or character cards of one scan result, row by row (one list per kind). */
export function equipmentRows(cards: readonly CardRecognition[], source: number): Record<EquipmentKind, EquipmentSighting[][]> {
  const out: Record<EquipmentKind, EquipmentSighting[][]> = { weapon: [], artifact: [], character: [] };
  // Only the biggest grid of each kind: the bag shows one.
  for (const kind of EQUIPMENT_KINDS) {
    const own = cards.filter((c) => c.kind === kind && c.row !== null && c.column !== null);
    if (own.length === 0) continue;
    const byGrid = new Map<string, CardRecognition[]>();
    for (const c of own) byGrid.set(c.gridId, [...(byGrid.get(c.gridId) ?? []), c]);
    const grid = [...byGrid.values()].sort((a, b) => b.length - a.length)[0];
    const rows = new Map<number, EquipmentSighting[]>();
    for (const c of grid) {
      const sighting: EquipmentSighting = {
        kind,
        item: c.material?.id ?? null,
        ...(c.material?.variant ? { variant: c.material.variant } : {}),
        rarity: c.rarity.value,
        level: c.level?.value ?? null,
        refinement: c.refinement?.value ?? null,
        locked: c.locked ?? false,
        status: c.status,
        confidence: c.confidence,
        candidates: c.candidates,
        source,
        row: c.row!,
        column: c.column!,
        card: c,
      };
      rows.set(c.row!, [...(rows.get(c.row!) ?? []), sighting]);
    }
    out[kind] = [...rows.entries()].sort((a, b) => a[0] - b[0]).map(([, r]) => r.sort((a, b) => a.column - b.column));
  }
  return out;
}

/** Whether two readings can be the same card (unread values match anything). */
function sameCard(a: EquipmentSighting, b: EquipmentSighting): boolean {
  if (a.item !== null && b.item !== null && a.item !== b.item) return false;
  if (a.level !== null && b.level !== null && a.level !== b.level) return false;
  if (a.refinement !== null && b.refinement !== null && a.refinement !== b.refinement) return false;
  return true;
}

/** Whether two rows can be the same row: same length, every card compatible, at least one identified. */
function sameRow(a: EquipmentSighting[], b: EquipmentSighting[]): boolean {
  if (a.length !== b.length) return false;
  let anchored = false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].column !== b[i].column || !sameCard(a[i], b[i])) return false;
    if (a[i].item !== null && b[i].item !== null) anchored = true;
  }
  return anchored;
}

/** The better of two readings of one card: identified, then with a level, then the more confident. */
function better(a: EquipmentSighting, b: EquipmentSighting): EquipmentSighting {
  const score = (s: EquipmentSighting) =>
    (s.item !== null ? 4 : 0) + (s.status === "matched" ? 2 : 0) + (s.level !== null ? 1 : 0) + s.confidence;
  return score(b) > score(a) ? b : a;
}

/**
 * Stitches the rows of successive screenshots or frames (in scroll order)
 * into one list of cards.
 */
export class EquipmentStitcher {
  private readonly rows: EquipmentSighting[][] = [];

  /** Adds one frame's rows; returns how many rows were new. */
  add(frameRows: EquipmentSighting[][]): number {
    if (frameRows.length === 0) return 0;
    const n = this.rows.length;
    // The largest overlap: frame row 0 placed at merged row `o`, smallest `o` first.
    for (let o = 0; o < n; o++) {
      const overlap = Math.min(n - o, frameRows.length);
      let fits = true;
      for (let i = 0; i < overlap && fits; i++) fits = sameRow(this.rows[o + i], frameRows[i]);
      if (!fits) continue;
      for (let i = 0; i < overlap; i++) {
        this.rows[o + i] = this.rows[o + i].map((card, k) => better(card, frameRows[i][k]));
      }
      const fresh = frameRows.slice(overlap);
      this.rows.push(...fresh);
      return fresh.length;
    }
    // No overlap: a separate part of the bag.
    this.rows.push(...frameRows);
    return frameRows.length;
  }

  get size(): number {
    return this.rows.reduce((s, r) => s + r.length, 0);
  }

  /** Every card, row by row. */
  result(): EquipmentSighting[] {
    return this.rows.flat();
  }
}

/**
 * Each character once: owned characters are unique, so readings of the same
 * one (overlapping screenshots that didn't stitch) collapse into the best.
 * Unidentified cards are kept.
 */
export function uniqueByItem(cards: readonly EquipmentSighting[]): EquipmentSighting[] {
  const best = new Map<string, EquipmentSighting>();
  const out: EquipmentSighting[] = [];
  for (const c of cards) {
    if (c.item === null) {
      out.push(c);
      continue;
    }
    const prev = best.get(c.item);
    if (!prev) {
      best.set(c.item, c);
      out.push(c);
    } else if (better(prev, c) === c) {
      best.set(c.item, c);
      out[out.indexOf(prev)] = c;
    }
  }
  return out;
}

/**
 * A weapon's ascension from its level: the lowest whose cap reaches the
 * level (a weapon at 80 is taken as 80/80, not 80/90), and at least 2 when
 * the bag showed the awakened icon (which only appears from ascension 2).
 * 1-2★ weapons stop at level 70 (ascension 4).
 */
export function weaponAscension(level: number, awakened: boolean, rarity: number): number {
  const maxAscension = rarity <= 2 ? 4 : 6;
  let ascension = ASCENSION_MAX_LEVEL.findIndex((cap) => level <= cap);
  if (ascension < 0) ascension = maxAscension;
  if (awakened && ascension < 2 && level >= 40) ascension = 2;
  return Math.min(ascension, maxAscension);
}

/** A character's ascension from its level: the lowest whose cap reaches it (past 90: 6). */
export function characterAscension(level: number): number {
  const ascension = ASCENSION_MAX_LEVEL.findIndex((cap) => level <= cap);
  return ascension < 0 ? 6 : ascension;
}

/**
 * A scanned character as a GOOD character. The party setup only shows the
 * level: one already in the inventory keeps its constellation and talents
 * (and its ascension when it still fits the level); a new one starts at C0
 * with level-1 talents.
 */
export function toGoodCharacter(key: string, level: number, existing?: GoodCharacter): GoodCharacter {
  const cap = (a: number) => ASCENSION_MAX_LEVEL[a] ?? Infinity;
  const fits = existing && level <= cap(existing.ascension) && (existing.ascension === 0 || level >= cap(existing.ascension - 1));
  return {
    key,
    level,
    constellation: existing?.constellation ?? 0,
    ascension: fits ? existing!.ascension : characterAscension(level),
    talent: existing?.talent ?? { auto: 1, skill: 1, burst: 1 },
  };
}

/** The main stat a slot always has (flower: HP, plume: ATK); null for sands, goblet and circlet. */
export function fixedMainStat(slot: SlotKey): string | null {
  return slot === "flower" ? "hp" : slot === "plume" ? "atk" : null;
}

/** "gladiator-s-finale:flower" → set id and slot. */
export function splitArtifactItem(item: string): { setId: string; slot: SlotKey } {
  const [setId, slot] = item.split(":");
  return { setId, slot: slot as SlotKey };
}

/** A scanned weapon as a GOOD weapon (who holds it isn't read: no location). */
export function toGoodWeapon(
  s: Pick<EquipmentSighting, "variant" | "level" | "refinement" | "locked">,
  info: WeaponInfo,
): GoodWeapon {
  const level = s.level ?? 1;
  return {
    key: info.key,
    level,
    ascension: weaponAscension(level, !!s.variant?.startsWith("awakened"), info.rarity),
    refinement: s.refinement ?? 1,
    location: "",
    lock: s.locked,
  };
}

/**
 * A scanned artifact as a GOOD artifact. The grid shows no substats, and the
 * main stat only for flowers and plumes: `mainStatKey` is "" until it's
 * chosen or read from the artifact's detail panel.
 */
export function toGoodArtifact(
  s: Pick<EquipmentSighting, "rarity" | "level" | "locked">,
  set: ArtifactSetInfo,
  slot: SlotKey,
  mainStatKey?: string | null,
): GoodArtifact {
  const rarity = s.rarity && set.rarities.includes(s.rarity) ? s.rarity : Math.max(...set.rarities);
  return {
    setKey: set.key,
    slotKey: slot,
    level: Math.min(s.level ?? 0, rarity * 4),
    rarity,
    mainStatKey: mainStatKey ?? fixedMainStat(slot) ?? "",
    location: "",
    lock: s.locked,
    substats: [],
  };
}
