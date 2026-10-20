/**
 * Stages 8–9 — Confidence calculation and result serialization.
 *
 * Converts lattices (analysis pixels, arbitrary row/column origin) into the
 * public result: original-image pixel boxes, zero-based rows/columns,
 * per-card and per-grid confidence.
 */
import type { DetectedCard, DetectedGrid, GridSlot } from "../types";
import type { CoordinateFrame } from "./image";
import type { Lattice, LatticeCard } from "./lattice";

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/**
 * Card confidence blends border evidence (quality), agreement with the
 * lattice, how the card was found and how much grid context supports it.
 */
export function cardConfidence(card: LatticeCard, gridSize: number): number {
  const evidence = 0.25 + 0.75 * card.quality;
  const alignment = 1 - 0.3 * card.misalignment;
  const source = card.clipped ? 0.75 : card.source === "recovered" ? 0.85 : 1;
  const context = gridSize >= 3 ? 1 : gridSize === 2 ? 0.9 : 0.85;
  return clamp01(evidence * alignment * source * context);
}

export function gridConfidence(cardConfs: number[], lat: Lattice): number {
  if (cardConfs.length === 0) return 0;
  const mean = cardConfs.reduce((a, b) => a + b, 0) / cardConfs.length;
  const regularity =
    1 -
    0.5 *
      (lat.cards.reduce((s, c) => s + c.misalignment, 0) / lat.cards.length);
  const full = lat.cards.filter((c) => !c.clipped).length;
  const size = Math.min(1, 0.6 + 0.1 * full);
  return clamp01(mean * regularity * size);
}

function toOriginal(
  frame: CoordinateFrame,
  left: number,
  top: number,
  right: number,
  bottom: number,
) {
  // Edge positions are pixel boundaries in analysis space: the card occupies
  // [left, right) × [top, bottom). Map boundaries, then round once.
  const x0 = Math.round(frame.region.x + left / frame.scaleX);
  const y0 = Math.round(frame.region.y + top / frame.scaleY);
  const x1 = Math.round(frame.region.x + right / frame.scaleX);
  const y1 = Math.round(frame.region.y + bottom / frame.scaleY);
  const cx0 = Math.max(0, Math.min(frame.sourceWidth, x0));
  const cy0 = Math.max(0, Math.min(frame.sourceHeight, y0));
  const cx1 = Math.max(0, Math.min(frame.sourceWidth, x1));
  const cy1 = Math.max(0, Math.min(frame.sourceHeight, y1));
  return {
    x: cx0,
    y: cy0,
    width: Math.max(1, cx1 - cx0),
    height: Math.max(1, cy1 - cy0),
  };
}

export function serializeLattices(
  lattices: Lattice[],
  frame: CoordinateFrame,
  minConfidence: number,
): DetectedGrid[] {
  const sx = 1 / frame.scaleX;
  const sy = 1 / frame.scaleY;

  // Reading order: top-to-bottom, then left-to-right.
  const ordered = [...lattices].sort((a, b) => {
    const ta = Math.min(...a.cards.map((c) => c.top));
    const tb = Math.min(...b.cards.map((c) => c.top));
    if (Math.abs(ta - tb) > 0.5 * Math.min(a.ch, b.ch)) return ta - tb;
    return (
      Math.min(...a.cards.map((c) => c.left)) -
      Math.min(...b.cards.map((c) => c.left))
    );
  });

  const grids: DetectedGrid[] = [];
  for (const lat of ordered) {
    const fullCount = lat.cards.filter((c) => !c.clipped).length;
    const scored = lat.cards
      .map((c) => ({ c, conf: cardConfidence(c, fullCount) }))
      .filter((s) => s.conf >= minConfidence);
    if (scored.length === 0) continue;

    let rMin = Infinity,
      rMax = -Infinity,
      cMin = Infinity,
      cMax = -Infinity;
    for (const { c } of scored) {
      rMin = Math.min(rMin, c.row);
      rMax = Math.max(rMax, c.row);
      cMin = Math.min(cMin, c.col);
      cMax = Math.max(cMax, c.col);
    }

    const confidence = gridConfidence(
      scored.map((s) => s.conf),
      { ...lat, cards: scored.map((s) => s.c) },
    );
    if (confidence < minConfidence) continue;

    const gridId = `grid-${grids.length + 1}`;
    scored.sort((a, b) => a.c.row - b.c.row || a.c.col - b.c.col);
    const cards: DetectedCard[] = scored.map(({ c, conf }) => {
      const box = toOriginal(frame, c.left, c.top, c.right, c.bottom);
      const row = c.row - rMin;
      const column = c.col - cMin;
      return {
        id: `${gridId}-r${row}c${column}`,
        ...box,
        row,
        column,
        confidence: Math.round(conf * 1000) / 1000,
        source: c.source,
        clipped: c.clipped,
      };
    });

    const occupied = new Set(scored.map(({ c }) => `${c.row},${c.col}`));
    const emptySlots: GridSlot[] = [];
    for (let r = rMin; r <= rMax; r++) {
      for (let col = cMin; col <= cMax; col++) {
        if (occupied.has(`${r},${col}`)) continue;
        const left = lat.x0 + col * lat.px;
        const top = lat.y0 + r * lat.py;
        if (
          left < 0 ||
          top < 0 ||
          left + lat.cw > frame.region.width * frame.scaleX + 1 ||
          top + lat.ch > frame.region.height * frame.scaleY + 1
        ) {
          continue;
        }
        emptySlots.push({
          row: r - rMin,
          column: col - cMin,
          ...toOriginal(frame, left, top, left + lat.cw, top + lat.ch),
        });
      }
    }

    const x0 = Math.min(...cards.map((c) => c.x));
    const y0 = Math.min(...cards.map((c) => c.y));
    const x1 = Math.max(...cards.map((c) => c.x + c.width));
    const y1 = Math.max(...cards.map((c) => c.y + c.height));

    grids.push({
      id: gridId,
      bounds: { x: x0, y: y0, width: x1 - x0, height: y1 - y0 },
      rows: rMax - rMin + 1,
      columns: cMax - cMin + 1,
      confidence: Math.round(confidence * 1000) / 1000,
      cards,
      cardWidth: Math.round(lat.cw * sx),
      cardHeight: Math.round(lat.ch * sy),
      pitchX: Math.round(lat.px * sx * 10) / 10,
      pitchY: Math.round(lat.py * sy * 10) / 10,
      emptySlots,
    });
  }
  return grids;
}
