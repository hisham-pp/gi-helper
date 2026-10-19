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
 * and then kept once each. An artifact detail panel read beside the grid
 * (lib/artifact-panel) is attached to the card it describes before
 * stitching, so it travels with that card. Then each card becomes a GOOD
 * entry.
 */
import type { ArtifactPanelReading } from "@/lib/artifact-panel/read";
import type { SlotHighlight } from "@/lib/artifact-panel/engine/selection";
import { getArtifactSetById, getWeaponById, type ArtifactSetInfo, type WeaponInfo } from "@/lib/good/catalog";
import {
  ASCENSION_MAX_LEVEL,
  SLOT_NAMES,
  type GoodArtifact,
  type GoodCharacter,
  type GoodSubstat,
  type GoodWeapon,
  type SlotKey,
} from "@/lib/good/types";
import type { PixelRect } from "@/lib/grid-detector/types";
import type { CardRecognition, CardRecognitionStatus, MaterialCandidate, Rarity } from "@/lib/material-detector/types";

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
  /** Artifacts: what the detail panel showed for this card (main stat, substats, who wears it). */
  panel?: ArtifactPanelReading;
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
  const best = score(b) > score(a) ? b : a;
  // A panel read in either frame stays with the card.
  const panel = betterPanel(a.panel, b.panel);
  return panel === best.panel ? best : { ...best, panel };
}

/** Of two panel readings of one card, the one with fewer problems (the first on a tie). */
function betterPanel(a?: ArtifactPanelReading, b?: ArtifactPanelReading): ArtifactPanelReading | undefined {
  if (!a || !b) return a ?? b;
  return b.issues.length < a.issues.length ? b : a;
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

/** A scanned weapon as a GOOD weapon. */
export function toGoodWeapon(
  s: Pick<EquipmentSighting, "variant" | "level" | "refinement" | "locked">,
  info: WeaponInfo,
  details: { location?: string; ascension?: number } = {},
): GoodWeapon {
  const level = s.level ?? 1;
  const ascension = details.ascension !== undefined && details.ascension !== null
    ? details.ascension
    : weaponAscension(level, !!s.variant?.startsWith("awakened"), info.rarity);
  return {
    key: info.key,
    level,
    ascension,
    refinement: s.refinement ?? 1,
    location: details.location ?? "",
    lock: s.locked,
  };
}

/** What an artifact's detail panel adds to its card. */
export interface ArtifactDetails {
  substats?: GoodSubstat[];
  /** A +0 artifact's 4th substat, shown but not active yet (GOOD 3). */
  unactivatedSubstats?: GoodSubstat[];
  /** GOOD location key of the character wearing it. */
  location?: string;
}

/**
 * A scanned artifact as a GOOD artifact. The grid shows no substats, and the
 * main stat only for flowers and plumes: `mainStatKey` is "" until it's
 * chosen or read from the artifact's detail panel, which also gives the
 * substats and who wears it (`details`).
 */
export function toGoodArtifact(
  s: Pick<EquipmentSighting, "rarity" | "level" | "locked">,
  set: ArtifactSetInfo,
  slot: SlotKey,
  mainStatKey?: string | null,
  details: ArtifactDetails = {},
): GoodArtifact {
  const rarity = s.rarity && set.rarities.includes(s.rarity) ? s.rarity : Math.max(...set.rarities);
  const artifact: GoodArtifact = {
    setKey: set.key,
    slotKey: slot,
    level: Math.min(s.level ?? 0, rarity * 4),
    rarity,
    mainStatKey: mainStatKey ?? fixedMainStat(slot) ?? "",
    location: details.location ?? "",
    lock: s.locked,
    substats: (details.substats ?? []).map(({ key, value }) => ({ key, value })),
  };
  if (details.unactivatedSubstats?.length) {
    artifact.unactivatedSubstats = details.unactivatedSubstats.map(({ key, value }) => ({ key, value }));
  }
  return artifact;
}

/** Everything a panel reading says about an item, as one string: two equal keys are the same item. */
export function panelKey(r: ArtifactPanelReading): string {
  if (r.kind === "weapon") {
    return ["weapon", r.weaponId, r.rarity, r.level, r.levelCap, r.ascension, r.refinement, r.locked, r.location].join("|");
  }
  const stats = (list: { key: string; value: number }[]) => list.map((x) => `${x.key}=${x.value}`).join(",");
  return [r.setId, r.slot, r.rarity, r.level, r.mainStatKey, stats(r.substats), stats(r.unactivatedSubstats), r.locked, r.location].join("|");
}

/** "<set id>:<slot>" or "<weapon id>" of a panel reading, or null when not read. */
export const panelItem = (r: ArtifactPanelReading): string | null =>
  r.kind === "weapon" ? (r.weaponId ?? null) : r.setId && r.slot ? `${r.setId}:${r.slot}` : null;

/** A card for an item known only from its panel (its card wasn't detected, or no grid was). */
function panelCard(r: ArtifactPanelReading, box: PixelRect, gridId: string, row: number | null, column: number | null): CardRecognition {
  if (r.kind === "weapon") {
    const item = r.weaponId ?? null;
    const info = item ? getWeaponById(item) : undefined;
    const name = info?.name ?? "Weapon";
    const candidate: MaterialCandidate | null = item ? { id: item, name, rarity: (r.rarity ?? info?.rarity ?? 5) as Rarity, error: 0, confidence: 1 } : null;
    const clean = r.issues.length === 0;
    return {
      cardId: `panel-${row ?? "x"}-${column ?? "x"}`,
      gridId,
      kind: "weapon",
      row,
      column,
      box,
      matchedBox: box,
      status: !item ? "unknown" : clean ? "matched" : "uncertain",
      material: candidate,
      candidates: candidate ? [candidate] : [],
      rarity: { value: (r.rarity ?? info?.rarity ?? null) as Rarity | null, stars: r.rarity, background: null, confidence: r.rarity ? 1 : 0 },
      quantity: { value: null, text: "", confidence: 0 },
      level: { value: r.level, confidence: r.level !== null ? 1 : 0 },
      refinement: r.refinement != null ? { value: r.refinement, confidence: 1 } : null,
      locked: r.locked,
      hasNewBadge: false,
      orderAdjusted: false,
      confidence: !item ? 0 : clean ? 1 : 0.5,
    };
  }
  const item = panelItem(r);
  const set = r.setId ? getArtifactSetById(r.setId) : undefined;
  const name = (r.slot && set?.pieces[r.slot]) || (r.slot ? SLOT_NAMES[r.slot] : "Artifact");
  const candidate: MaterialCandidate | null = item ? { id: item, name, rarity: (r.rarity ?? 5) as Rarity, error: 0, confidence: 1 } : null;
  const clean = r.issues.length === 0;
  return {
    cardId: `panel-${row ?? "x"}-${column ?? "x"}`,
    gridId,
    kind: "artifact",
    row,
    column,
    box,
    matchedBox: box,
    status: !item ? "unknown" : clean ? "matched" : "uncertain",
    material: candidate,
    candidates: candidate ? [candidate] : [],
    rarity: { value: r.rarity as Rarity | null, stars: r.rarity, background: null, confidence: r.rarity ? 1 : 0 },
    quantity: { value: null, text: "", confidence: 0 },
    level: { value: r.level, confidence: r.level !== null ? 1 : 0 },
    refinement: null,
    locked: r.locked,
    hasNewBadge: false,
    orderAdjusted: false,
    confidence: !item ? 0 : clean ? 1 : 0.5,
  };
}

function panelSighting(r: ArtifactPanelReading, card: CardRecognition, source: number, row: number, column: number): EquipmentSighting {
  return {
    kind: r.kind === "weapon" ? "weapon" : "artifact",
    item: card.material?.id ?? null,
    rarity: r.rarity,
    level: r.level,
    refinement: r.refinement ?? null,
    locked: r.locked,
    status: card.status,
    confidence: card.confidence,
    candidates: card.candidates,
    source,
    row,
    column,
    card,
    panel: r,
  };
}

/** The artwork in a detail panel's top-right corner: the crop shown for an artifact seen only in its panel. */
export function panelArtBox(bounds: PixelRect): PixelRect {
  const w = bounds.width;
  return { x: bounds.x + w * 0.6, y: bounds.y + w * 0.13, width: w * 0.38, height: w * 0.43 };
}

/** A highlight this white around an empty slot means the selected card is there, undetected. */
const SELECTED_EMPTY_SLOT = 0.5;

/**
 * Attaches a detail panel reading to the card it describes, among one
 * frame's equipment rows: a card with the same item and level (if several,
 * the most highlighted one, i.e. the selected card). When the selected card
 * wasn't detected, its empty slot gets a card made from the panel. Otherwise
 * the reading comes back as `standalone`: an item seen only in its panel
 * (a full-screen detail view, or a grid that wasn't found).
 *
 * @param art the panel's box (the standalone card's crop)
 */
export function attachPanel(
  rows: readonly EquipmentSighting[][],
  reading: ArtifactPanelReading,
  highlights: readonly SlotHighlight[],
  source: number,
  art: PixelRect,
): { rows: EquipmentSighting[][]; standalone: EquipmentSighting | null } {
  const out = rows.map((r) => [...r]);
  const item = panelItem(reading);
  const score = (row: number, column: number) => highlights.find((h) => h.row === row && h.column === column)?.score ?? 0;
  if (item) {
    let best: { r: number; k: number; score: number } | null = null;
    for (let r = 0; r < out.length; r++) {
      for (let k = 0; k < out[r].length; k++) {
        const c = out[r][k];
        if (c.item !== item || c.panel) continue;
        if (c.level !== null && reading.level !== null && c.level !== reading.level) continue;
        if (c.rarity !== null && reading.rarity !== null && c.rarity !== reading.rarity) continue;
        const s = score(c.row, c.column);
        if (!best || s > best.score) best = { r, k, score: s };
      }
    }
    if (best) {
      out[best.r][best.k] = {
        ...out[best.r][best.k],
        ...(reading.level !== null ? { level: reading.level } : {}),
        ...(reading.refinement !== null && reading.refinement !== undefined ? { refinement: reading.refinement } : {}),
        panel: reading,
      };
      return { rows: out, standalone: null };
    }
    // The selected card is missing from the grid: its slot is empty and white-rimmed.
    const top = highlights[0];
    if (top?.empty && top.score >= SELECTED_EMPTY_SLOT) {
      const sighting = panelSighting(reading, panelCard(reading, top.box, top.gridId, top.row, top.column), source, top.row, top.column);
      const r = out.findIndex((row) => row[0]?.row === top.row);
      if (r >= 0) {
        out[r] = [...out[r], sighting].sort((a, b) => a.column - b.column);
      } else {
        const at = out.findIndex((row) => (row[0]?.row ?? Infinity) > top.row);
        out.splice(at < 0 ? out.length : at, 0, [sighting]);
      }
      return { rows: out, standalone: null };
    }
  }
  return { rows: out, standalone: panelSighting(reading, panelCard(reading, art, "panel", null, null), source, -1, -1) };
}

/**
 * Artifacts known only from their panel, once each: the same reading in
 * several frames (a recording dwelling on one artifact), or one a grid card
 * already carries, is dropped.
 */
export function uniquePanels(standalone: readonly EquipmentSighting[], cards: readonly EquipmentSighting[]): EquipmentSighting[] {
  const seen = new Set(cards.filter((c) => c.panel).map((c) => panelKey(c.panel!)));
  const out: EquipmentSighting[] = [];
  for (const s of standalone) {
    if (!s.panel) continue;
    const key = panelKey(s.panel);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
  }
  return out;
}
