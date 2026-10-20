/**
 * Card anatomy and sampling.
 *
 * A Genshin inventory card (measured on the reference screenshots, as
 * fractions of the card box; W = width, H = height ≈ 1.22 W):
 *
 *   ┌────────────┐  0
 *   │  artwork   │      The catalog icon (256² PNG) fills exactly this W × W
 *   │  (W × W)   │      square, over a rarity-coloured background. A "New"
 *   │   ★★★★     │      badge may cover its top-right corner.
 *   ├────────────┤  0.82 H  cream footer starts (= W / H)
 *   │     63     │      stars 0.715–0.835 H, centred; digits 0.865–0.958 H
 *   └────────────┘  1
 *
 * Everything is sampled into a canonical frame of `size × cardHeight(size)`
 * pixels, so a 60 px card from a small capture and a 300 px card from a 4K
 * screenshot are compared the same way.
 */
import type { PixelRect, RgbaImage } from "@gi/grid-detector";

/** Card height / width. */
export const CARD_ASPECT = 222 / 182;
/** Artwork rows used for matching: everything above the star row. */
export const ART_ROWS_FRACTION = 0.71;
export const STAR_BAND = { top: 0.7, bottom: 0.85 } as const;
export const FOOTER_TOP = 0.82;
/** Digits sit inside this band; slightly generous for loose boxes. */
export const DIGIT_BAND = {
  top: 0.845,
  bottom: 0.985,
  left: 0.06,
  right: 0.94,
} as const;

export const cardHeight = (size: number) => Math.round(size * CARD_ASPECT);
export const artRows = (size: number) =>
  Math.floor(cardHeight(size) * ART_ROWS_FRACTION);

/** Planar RGB image with channels in 0–1. */
export interface Frame {
  width: number;
  height: number;
  r: Float32Array;
  g: Float32Array;
  b: Float32Array;
}

/**
 * Small correction applied to a card box before sampling: a shift as a
 * fraction of the box width/height and a relative size (about the box
 * centre). Resolution-independent, so one alignment serves every frame.
 */
export interface Alignment {
  dx: number;
  dy: number;
  scale: number;
}

export const IDENTITY_ALIGNMENT: Alignment = { dx: 0, dy: 0, scale: 1 };

/**
 * Corrects a detected box to the card's fixed aspect ratio, anchored at the
 * bottom edge. A "New" badge overhangs the card's top edge and is often
 * included in the detected box (e.g. 182 × 230 instead of 182 × 222); the
 * footer's bottom border and the side borders are reliable. Boxes far from
 * the card shape (e.g. hand-drawn) are left alone.
 */
export function normalizeCardBox(box: PixelRect): PixelRect {
  const expected = box.width * CARD_ASPECT;
  if (Math.abs(box.height - expected) / expected > 0.12) return box;
  return {
    x: box.x,
    y: box.y + box.height - expected,
    width: box.width,
    height: expected,
  };
}

const isCream = (r: number, g: number, b: number) => {
  const { s, v } = rgbToHsv(r, g, b);
  return v > 0.72 && s < 0.2;
};

/**
 * Re-locates a card from its cream footer, the most distinctive part of a
 * card (the inventory page around it is dark). Searches the box grown by 15%
 * per side, so boxes that are off by up to ~15% (e.g. drawn by hand) still
 * land on the card. The footer's bottom and side edges give the card's width
 * and bottom; the height follows from the fixed aspect ratio. Returns null
 * when no single, card-sized footer is visible.
 */
export function snapToFooter(
  image: RgbaImage,
  box: PixelRect,
): PixelRect | null {
  const ex = box.width * 0.15;
  const ey = box.height * 0.15;
  const x0 = Math.max(0, box.x - ex);
  const y0 = Math.max(0, box.y - ey);
  const x1 = Math.min(image.width, box.x + box.width + ex);
  const y1 = Math.min(image.height, box.y + box.height + ey);
  if (x1 - x0 < 8 || y1 - y0 < 8) return null;
  const W = 120;
  const H = Math.max(8, Math.round((W * (y1 - y0)) / (x1 - x0)));
  const f = sampleRect(
    image,
    { x: x0, y: y0, width: x1 - x0, height: y1 - y0 },
    W,
    H,
  );
  const sx = (x1 - x0) / W;
  const sy = (y1 - y0) / H;
  const cream = new Uint8Array(W * H);
  for (let i = 0; i < cream.length; i++)
    cream[i] = isCream(f.r[i], f.g[i], f.b[i]) ? 1 : 0;

  // Footer rows: a run of rows that are mostly cream across the box's width.
  const boxL = Math.max(0, Math.round((box.x - x0) / sx));
  const boxR = Math.min(W, Math.round((box.x + box.width - x0) / sx));
  const minRow = 0.4 * (boxR - boxL);
  const runs: { top: number; bottom: number }[] = [];
  for (let y = 0; y < H; y++) {
    let n = 0;
    for (let x = 0; x < W; x++) n += cream[y * W + x];
    const on = n >= minRow;
    const last = runs[runs.length - 1];
    if (on && last && last.bottom === y) last.bottom = y + 1;
    else if (on) runs.push({ top: y, bottom: y + 1 });
  }
  // The footer nearest where this box expects it (its bottom ~9% of the height).
  const expected = (box.y + box.height * 0.91 - y0) / sy;
  const footer = runs
    .filter((r) => r.bottom - r.top >= 2)
    .sort(
      (a, b) =>
        Math.abs((a.top + a.bottom) / 2 - expected) -
        Math.abs((b.top + b.bottom) / 2 - expected),
    )[0];
  if (!footer) return null;

  // Footer columns, measured on the strip below the digits and above the
  // rounded bottom corners, where the footer is plain cream edge to edge.
  // Keep the run overlapping the box most.
  const rows = footer.bottom - footer.top;
  const stripTop = Math.min(
    footer.bottom - 2,
    Math.round(footer.bottom - 0.22 * rows),
  );
  const stripBottom = Math.max(
    stripTop + 1,
    Math.round(footer.bottom - 0.05 * rows),
  );
  const cols: { left: number; right: number }[] = [];
  for (let x = 0; x < W; x++) {
    let n = 0;
    for (let y = stripTop; y < stripBottom; y++) n += cream[y * W + x];
    const on = n >= 0.6 * (stripBottom - stripTop);
    const last = cols[cols.length - 1];
    if (on && last && last.right >= x - 1) last.right = x + 1;
    else if (on) cols.push({ left: x, right: x + 1 });
  }
  const overlap = (c: { left: number; right: number }) =>
    Math.min(c.right, boxR) - Math.max(c.left, boxL);
  const col = cols.sort((a, b) => overlap(b) - overlap(a))[0];
  if (!col) return null;

  const width = (col.right - col.left) * sx;
  const height = width * CARD_ASPECT;
  const footerH = rows * sy;
  // A footer is ~18% of the card's height and the card is roughly the box's size.
  if (width < box.width * 0.75 || width > box.width * 1.3) return null;
  if (footerH < height * 0.08 || footerH > height * 0.3) return null;
  const bottom = y0 + footer.bottom * sy;
  return { x: x0 + col.left * sx, y: bottom - height, width, height };
}

/** Applies an alignment to a card box. */
export function alignedRect(box: PixelRect, a: Alignment): PixelRect {
  const w = box.width * a.scale;
  const h = box.height * a.scale;
  return {
    x: box.x + (box.width - w) / 2 + a.dx * box.width,
    y: box.y + (box.height - h) / 2 + a.dy * box.height,
    width: w,
    height: h,
  };
}

/**
 * Area-average resample of an arbitrary (fractional) source rectangle into a
 * `w × h` frame. Pixels outside the image are clamped to the border.
 */
export function sampleRect(
  image: RgbaImage,
  rect: PixelRect,
  w: number,
  h: number,
): Frame {
  const { width: iw, height: ih, data } = image;
  const n = w * h;
  const r = new Float32Array(n);
  const g = new Float32Array(n);
  const b = new Float32Array(n);
  const fx = rect.width / w;
  const fy = rect.height / h;
  const inv = 1 / (255 * fx * fy);

  // Per-axis source spans: [first, last] index and edge weights.
  const xs0 = new Int32Array(w),
    xs1 = new Int32Array(w);
  const xw0 = new Float32Array(w),
    xw1 = new Float32Array(w);
  for (let x = 0; x < w; x++) {
    const a = rect.x + x * fx;
    const e = a + fx;
    xs0[x] = Math.floor(a);
    xs1[x] = Math.ceil(e) - 1;
    xw0[x] = Math.min(e, xs0[x] + 1) - a;
    xw1[x] = e - xs1[x];
  }
  const clampX = (v: number) => (v < 0 ? 0 : v >= iw ? iw - 1 : v);
  const clampY = (v: number) => (v < 0 ? 0 : v >= ih ? ih - 1 : v);

  for (let y = 0; y < h; y++) {
    const a = rect.y + y * fy;
    const e = a + fy;
    const y0 = Math.floor(a);
    const y1 = Math.ceil(e) - 1;
    for (let x = 0; x < w; x++) {
      let sr = 0,
        sg = 0,
        sb = 0;
      for (let sy = y0; sy <= y1; sy++) {
        const wy = sy === y0 ? Math.min(e, y0 + 1) - a : sy === y1 ? e - y1 : 1;
        const row = clampY(sy) * iw;
        const x0 = xs0[x],
          x1 = xs1[x];
        for (let sx = x0; sx <= x1; sx++) {
          const wx = sx === x0 ? xw0[x] : sx === x1 ? xw1[x] : 1;
          const wt = wx * wy;
          const p = (row + clampX(sx)) * 4;
          sr += data[p] * wt;
          sg += data[p + 1] * wt;
          sb += data[p + 2] * wt;
        }
      }
      const i = y * w + x;
      r[i] = sr * inv;
      g[i] = sg * inv;
      b[i] = sb * inv;
    }
  }
  return { width: w, height: h, r, g, b };
}

/** Samples a whole card into the canonical `size × cardHeight(size)` frame. */
export function sampleCard(
  image: RgbaImage,
  box: PixelRect,
  size: number,
  alignment: Alignment = IDENTITY_ALIGNMENT,
): Frame {
  return sampleRect(image, alignedRect(box, alignment), size, cardHeight(size));
}

/** 2× box downsample (used to derive the coarse frame from the fine one). */
export function halve(frame: Frame): Frame {
  const w = frame.width >> 1;
  const h = frame.height >> 1;
  const r = new Float32Array(w * h);
  const g = new Float32Array(w * h);
  const b = new Float32Array(w * h);
  const W = frame.width;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = 2 * y * W + 2 * x;
      const i = y * w + x;
      r[i] =
        (frame.r[p] + frame.r[p + 1] + frame.r[p + W] + frame.r[p + W + 1]) / 4;
      g[i] =
        (frame.g[p] + frame.g[p + 1] + frame.g[p + W] + frame.g[p + W + 1]) / 4;
      b[i] =
        (frame.b[p] + frame.b[p + 1] + frame.b[p + W] + frame.b[p + W + 1]) / 4;
    }
  }
  return { width: w, height: h, r, g, b };
}

export function rgbToHsv(
  r: number,
  g: number,
  b: number,
): { h: number; s: number; v: number } {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d > 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: max === 0 ? 0 : d / max, v: max };
}

export const luminance = (r: number, g: number, b: number) =>
  0.299 * r + 0.587 * g + 0.114 * b;

/** Pixels to ignore while matching (1 = ignore), e.g. a "New" badge. */
export type IgnoreMask = Uint8Array;

/**
 * Finds a "New" badge: a saturated orange-yellow rounded label in the
 * artwork's top-right corner. Its fill (hue ≈ 32–48°, s > 0.62, v > 0.72)
 * is far more saturated than even the 5★ background, and on the reference
 * screenshots badge cards cover ~70% of the probe area versus 0% for all
 * others. Returns the region to ignore, in frame pixels, or null.
 */
export function detectNewBadge(
  frame: Frame,
): { x0: number; y1: number } | null {
  const { width: w, height: h } = frame;
  const top = Math.round(h * 0.2);
  const left = Math.round(w * 0.4);
  let hits = 0;
  let probe = 0;
  let probeHits = 0;
  let x0 = w;
  let y1 = -1;
  for (let y = 0; y < top; y++) {
    for (let x = left; x < w; x++) {
      const i = y * w + x;
      const { h: hue, s, v } = rgbToHsv(frame.r[i], frame.g[i], frame.b[i]);
      const isBadge = hue >= 32 && hue <= 48 && s > 0.62 && v > 0.72;
      const inProbe =
        y >= Math.round(h * 0.02) &&
        y < Math.round(h * 0.15) &&
        x > w * 0.6 &&
        x < w * 0.92;
      if (inProbe) probe++;
      if (!isBadge) continue;
      hits++;
      if (inProbe) probeHits++;
      if (x < x0) x0 = x;
      if (y > y1) y1 = y;
    }
  }
  if (hits === 0 || probeHits / Math.max(1, probe) < 0.3) return null;
  // The badge has a dark outline and a soft shadow: ignore a margin around it.
  const margin = Math.max(1, Math.round(w / 32));
  return { x0: Math.max(0, x0 - margin), y1: Math.min(h - 1, y1 + margin * 2) };
}

export function badgeMask(
  width: number,
  rows: number,
  badge: { x0: number; y1: number } | null,
): IgnoreMask {
  const mask = new Uint8Array(width * rows);
  if (!badge) return mask;
  for (let y = 0; y <= Math.min(rows - 1, badge.y1); y++) {
    for (let x = badge.x0; x < width; x++) mask[y * width + x] = 1;
  }
  return mask;
}

/**
 * Corners of a weapon or artifact card that hold overlays rather than the
 * icon, as fractions of the card width: the refinement badge (weapons, newer
 * game versions) and the lock in the top-left corner, and the round avatar
 * of the character who has it equipped in the top-right corner, which
 * overhangs the card's top edge. Measured on PC and phone screenshots.
 */
export const EQUIPMENT_OVERLAYS = {
  topLeft: { right: 0.22, bottom: 0.42 },
  topRight: { left: 0.7, bottom: 0.27 },
} as const;

/** Marks the overlay corners of a weapon or artifact card as ignored (in place). */
export function addEquipmentOverlays(
  mask: IgnoreMask,
  width: number,
  rows: number,
): IgnoreMask {
  const { topLeft, topRight } = EQUIPMENT_OVERLAYS;
  const leftX = Math.ceil(topLeft.right * width);
  const leftY = Math.min(rows, Math.ceil(topLeft.bottom * width));
  const rightX = Math.floor(topRight.left * width);
  const rightY = Math.min(rows, Math.ceil(topRight.bottom * width));
  for (let y = 0; y < Math.max(leftY, rightY); y++) {
    if (y < leftY) mask.fill(1, y * width, y * width + leftX);
    if (y < rightY) mask.fill(1, y * width + rightX, (y + 1) * width);
  }
  return mask;
}

/** Scales a badge region found on a `fromW`-wide frame to a `toW`-wide frame. */
export function scaleBadge(
  badge: { x0: number; y1: number } | null,
  fromW: number,
  toW: number,
) {
  if (!badge) return null;
  const f = toW / fromW;
  return {
    x0: Math.floor(badge.x0 * f),
    y1: Math.ceil((badge.y1 + 1) * f) - 1,
  };
}
