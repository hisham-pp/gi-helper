/**
 * Which card of the grid the detail panel describes: the selected card has a
 * white outline (sometimes faint, and the grid detector often misses that
 * card, leaving an empty slot in the lattice). Each card and empty slot gets
 * a score: the share of white pixels in a thin ring just outside its box.
 */
import type { RgbaImage } from "../../grid-detector/engine/image";
import type { DetectedGrid } from "../../grid-detector/types";

export interface SlotHighlight {
  gridId: string;
  row: number;
  column: number;
  /** The card's box (or the empty slot's), in image pixels. */
  box: { x: number; y: number; width: number; height: number };
  /** No card was detected here. */
  empty: boolean;
  /** 0–1: share of white pixels around the box. */
  score: number;
}

function ringScore(image: RgbaImage, box: SlotHighlight["box"]): number {
  const inner = box.width * 0.005;
  const outer = box.width * 0.045;
  const mid = (inner + outer) / 2;
  let white = 0;
  let total = 0;
  for (let k = 0; k <= 50; k++) {
    const t = k / 50;
    const points = [
      [box.x + box.width * t, box.y - mid],
      [box.x + box.width * t, box.y + box.height + mid],
      [box.x - mid, box.y + box.height * t],
      [box.x + box.width + mid, box.y + box.height * t],
    ];
    for (const [px, py] of points) {
      const x = Math.round(px);
      const y = Math.round(py);
      if (x < 0 || y < 0 || x >= image.width || y >= image.height) continue;
      const i = (y * image.width + x) * 4;
      total++;
      if (Math.min(image.data[i], image.data[i + 1], image.data[i + 2]) >= 215) white++;
    }
  }
  return total > 0 ? white / total : 0;
}

/** Highlight scores of every card and empty slot of the given grids, highest first. */
export function slotHighlights(image: RgbaImage, grids: readonly DetectedGrid[]): SlotHighlight[] {
  const out: SlotHighlight[] = [];
  for (const g of grids) {
    for (const c of g.cards) {
      if (c.row === null || c.column === null || c.clipped) continue;
      const box = { x: c.x, y: c.y, width: c.width, height: c.height };
      out.push({ gridId: g.id, row: c.row, column: c.column, box, empty: false, score: ringScore(image, box) });
    }
    for (const s of g.emptySlots) {
      const box = { x: s.x, y: s.y, width: s.width, height: s.height };
      out.push({ gridId: g.id, row: s.row, column: s.column, box, empty: true, score: ringScore(image, box) });
    }
  }
  return out.sort((a, b) => b.score - a.score);
}
