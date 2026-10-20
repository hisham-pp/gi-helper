import type { ArtifactPanelReading } from "../../artifact-panel/read";
import type { SlotHighlight } from "../../artifact-panel/engine/selection";
import { getArtifactSetById, getWeaponById } from "../../good/catalog";
import { SLOT_NAMES } from "../../good/types";
import type { PixelRect } from "../../grid-detector/types";
import type {
  CardRecognition,
  MaterialCandidate,
  Rarity,
} from "../../material-detector/types";
import { EQUIPMENT_KINDS } from "../constants/orchestration.constants";
import type {
  EquipmentKind,
  EquipmentSighting,
} from "../types/equipment.types";

/** The weapon, artifact or character cards of one scan result, row by row (one list per kind). */
export function equipmentRows(
  cards: readonly CardRecognition[],
  source: number,
): Record<EquipmentKind, EquipmentSighting[][]> {
  const out: Record<EquipmentKind, EquipmentSighting[][]> = {
    weapon: [],
    artifact: [],
    character: [],
  };
  // Only the biggest grid of each kind: the bag shows one.
  for (const kind of EQUIPMENT_KINDS) {
    const own = cards.filter(
      (c) => c.kind === kind && c.row !== null && c.column !== null,
    );
    if (own.length === 0) continue;
    const byGrid = new Map<string, CardRecognition[]>();
    for (const c of own)
      byGrid.set(c.gridId, [...(byGrid.get(c.gridId) ?? []), c]);
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
    out[kind] = [...rows.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([, r]) => r.sort((a, b) => a.column - b.column));
  }
  return out;
}

/** Whether two readings can be the same card (unread values match anything). */
function sameCard(a: EquipmentSighting, b: EquipmentSighting): boolean {
  if (a.item !== null && b.item !== null && a.item !== b.item) return false;
  if (a.level !== null && b.level !== null && a.level !== b.level) return false;
  if (
    a.refinement !== null &&
    b.refinement !== null &&
    a.refinement !== b.refinement
  )
    return false;
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
    (s.item !== null ? 4 : 0) +
    (s.status === "matched" ? 2 : 0) +
    (s.level !== null ? 1 : 0) +
    s.confidence;
  const best = score(b) > score(a) ? b : a;
  // A panel read in either frame stays with the card.
  const panel = betterPanel(a.panel, b.panel);
  return panel === best.panel ? best : { ...best, panel };
}

/** Of two panel readings of one card, the one with fewer problems (the first on a tie). */
function betterPanel(
  a?: ArtifactPanelReading,
  b?: ArtifactPanelReading,
): ArtifactPanelReading | undefined {
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
      for (let i = 0; i < overlap && fits; i++)
        fits = sameRow(this.rows[o + i], frameRows[i]);
      if (!fits) continue;
      for (let i = 0; i < overlap; i++) {
        this.rows[o + i] = this.rows[o + i].map((card, k) =>
          better(card, frameRows[i][k]),
        );
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
export function uniqueByItem(
  cards: readonly EquipmentSighting[],
): EquipmentSighting[] {
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

/** Everything a panel reading says about an item, as one string: two equal keys are the same item. */
export function panelKey(r: ArtifactPanelReading): string {
  if (r.kind === "weapon") {
    return [
      "weapon",
      r.weaponId,
      r.rarity,
      r.level,
      r.levelCap,
      r.ascension,
      r.refinement,
      r.locked,
      r.location,
    ].join("|");
  }
  const stats = (list: { key: string; value: number }[]) =>
    list.map((x) => `${x.key}=${x.value}`).join(",");
  return [
    r.setId,
    r.slot,
    r.rarity,
    r.level,
    r.mainStatKey,
    stats(r.substats),
    stats(r.unactivatedSubstats),
    r.locked,
    r.location,
  ].join("|");
}

/** "<set id>:<slot>" or "<weapon id>" of a panel reading, or null when not read. */
export const panelItem = (r: ArtifactPanelReading): string | null =>
  r.kind === "weapon"
    ? (r.weaponId ?? null)
    : r.setId && r.slot
      ? `${r.setId}:${r.slot}`
      : null;

/** A card for an item known only from its panel (its card wasn't detected, or no grid was). */
function panelCard(
  r: ArtifactPanelReading,
  box: PixelRect,
  gridId: string,
  row: number | null,
  column: number | null,
): CardRecognition {
  if (r.kind === "weapon") {
    const item = r.weaponId ?? null;
    const info = item ? getWeaponById(item) : undefined;
    const name = info?.name ?? "Weapon";
    const candidate: MaterialCandidate | null = item
      ? {
          id: item,
          name,
          rarity: (r.rarity ?? info?.rarity ?? 5) as Rarity,
          error: 0,
          confidence: 1,
        }
      : null;
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
      rarity: {
        value: (r.rarity ?? info?.rarity ?? null) as Rarity | null,
        stars: r.rarity,
        background: null,
        confidence: r.rarity ? 1 : 0,
      },
      quantity: { value: null, text: "", confidence: 0 },
      level: { value: r.level, confidence: r.level !== null ? 1 : 0 },
      refinement:
        r.refinement != null ? { value: r.refinement, confidence: 1 } : null,
      locked: r.locked,
      hasNewBadge: false,
      orderAdjusted: false,
      confidence: !item ? 0 : clean ? 1 : 0.5,
    };
  }
  const item = panelItem(r);
  const set = r.setId ? getArtifactSetById(r.setId) : undefined;
  const name =
    (r.slot && set?.pieces[r.slot]) ||
    (r.slot ? SLOT_NAMES[r.slot] : "Artifact");
  const candidate: MaterialCandidate | null = item
    ? {
        id: item,
        name,
        rarity: (r.rarity ?? 5) as Rarity,
        error: 0,
        confidence: 1,
      }
    : null;
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
    rarity: {
      value: r.rarity as Rarity | null,
      stars: r.rarity,
      background: null,
      confidence: r.rarity ? 1 : 0,
    },
    quantity: { value: null, text: "", confidence: 0 },
    level: { value: r.level, confidence: r.level !== null ? 1 : 0 },
    refinement: null,
    locked: r.locked,
    hasNewBadge: false,
    orderAdjusted: false,
    confidence: !item ? 0 : clean ? 1 : 0.5,
  };
}

function panelSighting(
  r: ArtifactPanelReading,
  card: CardRecognition,
  source: number,
  row: number,
  column: number,
): EquipmentSighting {
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
  return {
    x: bounds.x + w * 0.6,
    y: bounds.y + w * 0.13,
    width: w * 0.38,
    height: w * 0.43,
  };
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
  const score = (row: number, column: number) =>
    highlights.find((h) => h.row === row && h.column === column)?.score ?? 0;
  if (item) {
    let best: { r: number; k: number; score: number } | null = null;
    for (let r = 0; r < out.length; r++) {
      for (let k = 0; k < out[r].length; k++) {
        const c = out[r][k];
        if (c.item !== item || c.panel) continue;
        if (
          c.level !== null &&
          reading.level !== null &&
          c.level !== reading.level
        )
          continue;
        if (
          c.rarity !== null &&
          reading.rarity !== null &&
          c.rarity !== reading.rarity
        )
          continue;
        const s = score(c.row, c.column);
        if (!best || s > best.score) best = { r, k, score: s };
      }
    }
    if (best) {
      out[best.r][best.k] = {
        ...out[best.r][best.k],
        ...(reading.level !== null ? { level: reading.level } : {}),
        ...(reading.refinement !== null && reading.refinement !== undefined
          ? { refinement: reading.refinement }
          : {}),
        panel: reading,
      };
      return { rows: out, standalone: null };
    }
    // The selected card is missing from the grid: its slot is empty and white-rimmed.
    const top = highlights[0];
    if (top?.empty && top.score >= SELECTED_EMPTY_SLOT) {
      const sighting = panelSighting(
        reading,
        panelCard(reading, top.box, top.gridId, top.row, top.column),
        source,
        top.row,
        top.column,
      );
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
  return {
    rows: out,
    standalone: panelSighting(
      reading,
      panelCard(reading, art, "panel", null, null),
      source,
      -1,
      -1,
    ),
  };
}

/**
 * Artifacts known only from their panel, once each: the same reading in
 * several frames (a recording dwelling on one artifact), or one a grid card
 * already carries, is dropped.
 */
export function uniquePanels(
  standalone: readonly EquipmentSighting[],
  cards: readonly EquipmentSighting[],
): EquipmentSighting[] {
  const seen = new Set(
    cards.filter((c) => c.panel).map((c) => panelKey(c.panel!)),
  );
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
