/**
 * Synthetic inventory cards drawn from a reference bank: rarity background,
 * catalog icon, star row, cream footer with the quantity (or "Lv. 90",
 * "+20") in the game's glyphs, and for weapons and artifacts the refinement
 * badge, lock and equipped avatar. Lets tests exercise every stage with
 * known answers (any item, quantity, badge, scale) without screenshots.
 */
import type { DetectedGrid, PixelRect, RgbaImage } from "../../src/lib/grid-detector";
import type { DigitTemplates, Rarity, ReferenceBank } from "../../src/lib/material-detector";
import digitTemplates from "../../src/data/digit-templates.json";

/** Background colours measured on the reference screenshots. */
const RARITY_BG: Record<Rarity, [number, number, number]> = {
  1: [0.406, 0.424, 0.44],
  2: [0.322, 0.474, 0.427],
  3: [0.349, 0.436, 0.556],
  4: [0.408, 0.376, 0.569],
  5: [0.606, 0.418, 0.194],
};
const CREAM: [number, number, number] = [0.91, 0.89, 0.85];
const INK: [number, number, number] = [0.29, 0.32, 0.38];
const STAR: [number, number, number] = [1, 0.8, 0.2];
const BADGE: [number, number, number] = [0.93, 0.66, 0.13];
const PAGE: [number, number, number] = [0.12, 0.13, 0.16];
const OVERLAY_BOX: [number, number, number] = [0.22, 0.2, 0.22];
const LOCK_PINK: [number, number, number] = [0.96, 0.52, 0.47];
const WHITE: [number, number, number] = [0.97, 0.97, 0.97];

export interface CardSpec {
  /** The bank entry drawn: a material id, "<weapon id>[~awakened]" or "<set id>:<slot>". */
  materialId: string;
  quantity: number;
  /** Footer text instead of the quantity, e.g. "Lv. 90", "+20" or "" (none). */
  footer?: string;
  /** Override the star count and background (defaults to the entry's rarity). */
  stars?: number;
  newBadge?: boolean;
  /** Weapons: the refinement badge in the top-left corner. */
  refinement?: number;
  /** A lock under the badge (or in its place without one). */
  locked?: boolean;
  /** The round avatar of the character who has it equipped (top-right). */
  equipped?: boolean;
}

export interface SyntheticScene {
  image: RgbaImage;
  grid: DetectedGrid;
  /** Exact card boxes, in reading order. */
  boxes: PixelRect[];
}

class Canvas {
  readonly data: Uint8ClampedArray;
  constructor(
    readonly width: number,
    readonly height: number,
  ) {
    this.data = new Uint8ClampedArray(width * height * 4);
  }
  set(x: number, y: number, c: readonly number[], alpha = 1) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return;
    const p = (y * this.width + x) * 4;
    for (let k = 0; k < 3; k++) this.data[p + k] = (this.data[p + k] * (1 - alpha) + c[k] * 255 * alpha);
    this.data[p + 3] = 255;
  }
  fill(x0: number, y0: number, w: number, h: number, c: readonly number[]) {
    for (let y = Math.round(y0); y < Math.round(y0 + h); y++)
      for (let x = Math.round(x0); x < Math.round(x0 + w); x++) this.set(x, y, c);
  }
}

/** Draws one card of width `W` (height W × 222/182) at (ox, oy). */
function drawCard(cv: Canvas, bank: ReferenceBank, spec: CardSpec, ox: number, oy: number, W: number) {
  const index = bank.indexById.get(spec.materialId);
  if (index === undefined) throw new Error(`unknown material ${spec.materialId}`);
  const entry = bank.entries[index];
  const H = Math.round((W * 222) / 182);
  // "stars: 0" draws no star row (the party setup's characters) over the entry's own background
  const rarity = (spec.stars || entry.rarity) as Rarity;
  const bg = RARITY_BG[rarity];
  // Background with a gentle vertical gradient, cream footer below the artwork.
  for (let y = 0; y < H; y++) {
    const shade = 1.06 - 0.12 * (y / H);
    for (let x = 0; x < W; x++) cv.set(ox + x, oy + y, y < W ? bg.map((v) => v * shade) : CREAM);
  }
  // Icon: the fine template (64 px) scaled to the W × W artwork square.
  const t = bank.fine(index);
  const f = t.size / W;
  for (let y = 0; y < W; y++) {
    const ty = Math.floor(y * f);
    if (ty >= t.rows) continue;
    for (let x = 0; x < W; x++) {
      const i = ty * t.size + Math.floor(x * f);
      const a = t.a[i];
      if (a <= 0) continue;
      cv.set(ox + x, oy + y, [t.r[i] / a, t.g[i] / a, t.b[i] / a], a);
    }
  }
  // Stars: touching squares, centred, like the game's star row.
  const n = spec.stars ?? entry.rarity;
  const pitch = 0.1565 * W;
  const starW = 0.143 * W;
  const x0 = ox + W * 0.503 - (starW + (n - 1) * pitch) / 2;
  for (let k = 0; k < n; k++) cv.fill(x0 + k * pitch, oy + 0.725 * H, starW, 0.11 * H, STAR);
  if (spec.newBadge) cv.fill(ox + 0.52 * W, oy + 0.01 * H, 0.46 * W, 0.15 * H, BADGE);
  // Overlays: refinement badge, then the lock below it (or in its place).
  const slot = (top: number) => cv.fill(ox + 0.035 * W, oy + top * W, 0.16 * W, 0.16 * W, OVERLAY_BOX);
  if (spec.refinement !== undefined) {
    slot(0.025);
    drawText(cv, String(spec.refinement), ox + 0.115 * W, oy + 0.05 * W, 0.11 * W, WHITE);
  }
  if (spec.locked) {
    const top = spec.refinement !== undefined ? 0.215 : 0.025;
    slot(top);
    cv.fill(ox + 0.07 * W, oy + (top + 0.06) * W, 0.09 * W, 0.08 * W, LOCK_PINK);
    cv.fill(ox + 0.085 * W, oy + (top + 0.025) * W, 0.06 * W, 0.04 * W, LOCK_PINK);
  }
  if (spec.equipped) {
    const cx = ox + 0.86 * W, cy = oy + 0.08 * W, r = 0.13 * W;
    for (let y = -r - 2; y <= r + 2; y++)
      for (let x = -r - 2; x <= r + 2; x++) {
        const d = Math.hypot(x, y);
        if (d <= r + 2) cv.set(Math.round(cx + x), Math.round(cy + y), d > r ? WHITE : [0.45, 0.3, 0.35]);
      }
  }
  drawText(cv, spec.footer ?? String(spec.quantity), ox + W / 2, oy + 0.865 * H, 0.093 * H, INK);
}

/**
 * Renders text from the recognizer's own glyph templates, centred at cx:
 * digits at full height; "v" and "+" (symbol templates) at two thirds of it,
 * "v" on the baseline and "+" centred; "." a small square; " " a gap.
 */
function drawText(cv: Canvas, text: string, cx: number, top: number, height: number, colour: readonly number[]) {
  const tpl = digitTemplates as DigitTemplates;
  const glyphW = tpl.width * (height / tpl.height);
  const advance = glyphW * 0.95;
  const left = cx - (advance * (text.length - 1) + glyphW) / 2;
  [...text].forEach((ch, k) => {
    const x0 = left + k * advance;
    if (ch === " ") return;
    if (ch === ".") {
      cv.fill(x0 + glyphW * 0.2, top + height * 0.82, height * 0.16, height * 0.16, colour);
      return;
    }
    const short = ch === "v" || ch === "+";
    const h = short ? height * 0.68 : height;
    const y0 = top + (ch === "v" ? height - h : ch === "+" ? (height - h) / 2 : 0);
    const g = (tpl.digits[ch] ?? tpl.symbols?.[ch])!;
    const scale = h / tpl.height;
    const w = tpl.width * scale;
    for (let y = 0; y < Math.ceil(h); y++) {
      for (let x = 0; x < Math.ceil(w); x++) {
        const v = g[Math.min(tpl.height - 1, Math.floor(y / scale)) * tpl.width + Math.min(tpl.width - 1, Math.floor(x / scale))];
        if (v > 0.05) cv.set(Math.round(x0 + (glyphW - w) / 2 + x), Math.round(y0 + y), colour, Math.min(1, v * 1.2));
      }
    }
  });
}

/** A grid of cards on a dark page, with the exact boxes as a detected grid. */
export function renderCards(
  bank: ReferenceBank,
  cards: CardSpec[],
  { cardWidth = 160, columns = Math.min(cards.length, 7), gap = 0.2 } = {},
): SyntheticScene {
  const W = cardWidth;
  const H = Math.round((W * 222) / 182);
  const pitchX = Math.round(W * (1 + gap));
  const pitchY = Math.round(H * (1 + gap));
  const rows = Math.ceil(cards.length / columns);
  const margin = Math.round(W * 0.3);
  const cv = new Canvas(margin * 2 + pitchX * columns, margin * 2 + pitchY * rows);
  cv.fill(0, 0, cv.width, cv.height, PAGE);
  const boxes: PixelRect[] = [];
  cards.forEach((spec, k) => {
    const x = margin + (k % columns) * pitchX;
    const y = margin + Math.floor(k / columns) * pitchY;
    drawCard(cv, bank, spec, x, y, W);
    boxes.push({ x, y, width: W, height: H });
  });
  const grid: DetectedGrid = {
    id: "grid-1",
    bounds: { x: margin, y: margin, width: pitchX * columns, height: pitchY * rows },
    rows,
    columns,
    confidence: 1,
    cards: boxes.map((b, k) => ({
      id: `card-${k}`,
      ...b,
      row: Math.floor(k / columns),
      column: k % columns,
      confidence: 1,
      source: "detected" as const,
      clipped: false,
    })),
    cardWidth: W,
    cardHeight: H,
    pitchX,
    pitchY,
    emptySlots: [],
  };
  return { image: { width: cv.width, height: cv.height, data: cv.data }, grid, boxes };
}
