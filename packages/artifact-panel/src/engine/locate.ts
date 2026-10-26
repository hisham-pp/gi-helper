/**
 * Finding the artifact detail panel in a screenshot or video frame: the
 * right-hand panel of the bag's Artifacts tab (or the full-screen view a
 * tap-through recording shows), without any OCR.
 *
 *   ┌────────────────────┐ -0.575 W  header bar in the rarity colour, piece name
 *   │ Name               │
 *   │ Slot               │ -0.41 W
 *   │ Main stat    [art] │ -0.24 W name, -0.16 W value
 *   │ ★★★★★              │ -0.06 W
 *   ├────────────────────┤ 0 = top of the cream body
 *   │ [+20]       [lock] │ +0.08 W
 *   │ · CRIT Rate+7.8%   │ substats from +0.15 W, 0.078 W apart
 *   │ Set Name:          │ green
 *   │ …                  │
 *   │ Equipped: Name     │ light yellow band (when equipped)
 *   └────────────────────┘
 *
 * The layout scales with the panel width W on every platform, so the panel
 * is found by its cream body (the largest cream area, much taller than the
 * card footers that share its colour) and everything else is placed from
 * the body's top edge and width.
 */
import type { RgbaImage } from "@gi/grid-detector";

export interface PanelGeometry {
  /** Left edge of the panel, in image pixels. */
  x: number;
  /** Panel width W; the layout scales with it. */
  width: number;
  /** Top edge of the cream body. */
  bodyTop: number;
  /** Bottom of the cream body (where the panel, or the screen, ends). */
  bodyBottom: number;
  /** The "Equipped: …" band under the body, when the item is equipped. */
  equipped: { top: number; bottom: number } | null;
  /** The dark level badge ("+20" for artifacts, "Lv. 80/80" for weapons) in the body's top-left corner. */
  badge: { x: number; y: number; width: number; height: number };
  /** Presumed kind from badge geometry (a weapon badge is much wider than "+20"). */
  kind?: "artifact" | "weapon";
}

/** Cream of the panel body (and of card footers): ~(236, 229, 216), a little darker in JPEGs. */
export function isCream(r: number, g: number, b: number): boolean {
  return r >= 212 && r <= 250 && g >= 203 && g <= 243 && b >= 188 && b <= 234 && r >= g && g >= b && r - b >= 8 && r - b <= 36;
}

/** The light yellow "Equipped" band: ~(255, 231, 189). */
export function isEquippedYellow(r: number, g: number, b: number): boolean {
  return r >= 240 && g >= 210 && g <= 242 && b >= 160 && b <= 212 && r - b >= 40;
}

/** Dark slate of the level badge: ~(60, 70, 85). */
function isBadgeDark(r: number, g: number, b: number): boolean {
  return r < 135 && g < 140 && b < 155 && b >= r - 15;
}

const px = (image: RgbaImage, x: number, y: number) => {
  const i = (Math.round(y) * image.width + Math.round(x)) * 4;
  return [image.data[i], image.data[i + 1], image.data[i + 2]] as const;
};

const median = (values: number[]) => {
  if (values.length === 0) return NaN;
  const s = [...values].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
};

interface Component {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  count: number;
}

/** 4-connected components of a boolean grid. */
function components(mask: Uint8Array, w: number, h: number): Component[] {
  const label = new Int32Array(w * h).fill(-1);
  const out: Component[] = [];
  const stack: number[] = [];
  for (let start = 0; start < w * h; start++) {
    if (!mask[start] || label[start] >= 0) continue;
    const c: Component = { x0: w, y0: h, x1: -1, y1: -1, count: 0 };
    label[start] = out.length;
    stack.push(start);
    while (stack.length > 0) {
      const i = stack.pop()!;
      const x = i % w;
      const y = (i - x) / w;
      c.count++;
      if (x < c.x0) c.x0 = x;
      if (x > c.x1) c.x1 = x;
      if (y < c.y0) c.y0 = y;
      if (y > c.y1) c.y1 = y;
      const next = [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, y > 0 ? i - w : -1, y < h - 1 ? i + w : -1];
      for (const n of next) {
        if (n >= 0 && mask[n] && label[n] < 0) {
          label[n] = out.length;
          stack.push(n);
        }
      }
    }
    out.push(c);
  }
  return out;
}

/**
 * The cream body of the panel: the largest cream area that is at least a
 * tenth of the image wide, at least half as tall as it is wide and mostly
 * cream (text leaves holes, card footers are far too flat).
 */
function findBody(image: RgbaImage): { x0: number; y0: number; x1: number; y1: number } | null {
  const step = Math.max(1, Math.round(Math.max(image.width, image.height) / 480));
  const w = Math.floor(image.width / step);
  const h = Math.floor(image.height / step);
  const mask = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const [r, g, b] = px(image, x * step + step / 2 - 0.5, y * step + step / 2 - 0.5);
      mask[y * w + x] = isCream(r, g, b) ? 1 : 0;
    }
  }
  let best: Component | null = null;
  for (const c of components(mask, w, h)) {
    const cw = c.x1 - c.x0 + 1;
    const ch = c.y1 - c.y0 + 1;
    if (cw < w * 0.1 || ch < cw * 0.45 || cw < 24) continue;
    if (c.count / (cw * ch) < 0.42) continue;
    if (!best || cw * ch > (best.x1 - best.x0 + 1) * (best.y1 - best.y0 + 1)) best = c;
  }
  if (!best) return null;
  return { x0: best.x0 * step, y0: best.y0 * step, x1: (best.x1 + 1) * step, y1: (best.y1 + 1) * step };
}

/** The bounding box of the pixels matching `test` in a rectangle, or null when there are too few. */
export function boxOf(
  image: RgbaImage,
  rect: { x0: number; y0: number; x1: number; y1: number },
  test: (r: number, g: number, b: number) => boolean,
  minPixels = 4,
): { x0: number; y0: number; x1: number; y1: number; count: number } | null {
  const x0 = Math.max(0, Math.floor(rect.x0));
  const y0 = Math.max(0, Math.floor(rect.y0));
  const x1 = Math.min(image.width, Math.ceil(rect.x1));
  const y1 = Math.min(image.height, Math.ceil(rect.y1));
  let bx0 = Infinity;
  let by0 = Infinity;
  let bx1 = -Infinity;
  let by1 = -Infinity;
  let count = 0;
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * image.width + x) * 4;
      if (!test(image.data[i], image.data[i + 1], image.data[i + 2])) continue;
      count++;
      if (x < bx0) bx0 = x;
      if (x > bx1) bx1 = x;
      if (y < by0) by0 = y;
      if (y > by1) by1 = y;
    }
  }
  return count >= minPixels ? { x0: bx0, y0: by0, x1: bx1 + 1, y1: by1 + 1, count } : null;
}

/**
 * Locates an artifact detail panel, or returns null when the image shows
 * none (a material's or weapon's panel has no "+N" badge of this shape, so
 * it is rejected here, before any OCR).
 */
export function locateArtifactPanel(image: RgbaImage): PanelGeometry | null {
  const body = findBody(image);
  if (!body) return null;

  // Exact edges, measured on a few rows of the body's upper part.
  const coarseW = body.x1 - body.x0;
  const lefts: number[] = [];
  const rights: number[] = [];
  for (let k = 1; k <= 7; k++) {
    const y = Math.round(body.y0 + ((body.y1 - body.y0) * k) / 9);
    let l = Math.round(body.x0 + coarseW * 0.03);
    while (l > 0 && isCream(...px(image, l - 1, y))) l--;
    let r = Math.round(body.x1 - coarseW * 0.03);
    while (r < image.width - 1 && isCream(...px(image, r + 1, y))) r++;
    lefts.push(l);
    rights.push(r + 1);
  }
  const x = median(lefts);
  const width = median(rights) - x;
  if (!(width > 40)) return null;

  // The body's top edge, on its left margin (no text there).
  const tops: number[] = [];
  for (const f of [0.015, 0.025, 0.5, 0.65]) {
    const cx = x + width * f;
    let y = Math.max(0, Math.round(body.y0 - width * 0.05));
    const limit = Math.min(image.height - 1, Math.round(body.y0 + width * 0.08));
    while (y < limit && !isCream(...px(image, cx, y))) y++;
    if (y < limit) tops.push(y);
  }
  const bodyTop = median(tops);
  if (!Number.isFinite(bodyTop)) return null;
  // The top section must fit above the body.
  if (bodyTop < width * 0.4) return null;

  // Bottom: follow the left margin down until the cream ends.
  const marginX = x + width * 0.02;
  let bodyBottom = Math.round(bodyTop);
  let gap = 0;
  for (let y = bodyBottom; y < image.height; y++) {
    if (isCream(...px(image, marginX, y))) {
      bodyBottom = y + 1;
      gap = 0;
    } else if (++gap > width * 0.03) {
      break;
    }
  }
  if (bodyBottom - bodyTop < width * 0.45) return null;

  // The level badge: a dark box in the body's top-left corner, about as
  // tall as a line of text and narrow ("+20"; a weapon's "Lv. 90/90" is wider).
  const badgeBox = boxOf(
    image,
    { x0: x + width * 0.02, y0: bodyTop + width * 0.015, x1: x + width * 0.45, y1: bodyTop + width * 0.16 },
    isBadgeDark,
    Math.max(4, Math.round(width * width * 0.0005)),
  );
  if (!badgeBox) return null;
  const bw = badgeBox.x1 - badgeBox.x0;
  const bh = badgeBox.y1 - badgeBox.y0;
  if (bh < width * 0.025 || bh > width * 0.15 || bw < width * 0.035 || bw > width * 0.38) return null;
  if (badgeBox.count < bw * bh * 0.28) return null;

  // An "Equipped" band right under the body: rows mostly yellow (the name
  // and the avatar cover only part of each row).
  const bandRow = (y: number) => {
    let yellow = 0;
    for (let k = 0; k < 24; k++) if (isEquippedYellow(...px(image, x + width * (0.05 + (0.93 * k) / 23), y))) yellow++;
    return yellow >= 8;
  };
  let equipped: PanelGeometry["equipped"] = null;
  let y = bodyBottom;
  // Usually right under it; on consoles or weapon lore descriptions a gap of background separates them.
  while (y < image.height && y < bodyBottom + width * 0.45 && !bandRow(y)) y++;
  if (y < image.height && bandRow(y)) {
    const top = y;
    let bottom = y + 1;
    // Rows through the text are less yellow: allow short runs of them.
    for (let misses = 0; y < image.height && misses <= width * 0.05; y++) {
      if (bandRow(y)) {
        bottom = y + 1;
        misses = 0;
      } else {
        misses++;
      }
    }
    if (bottom - top > width * 0.05) equipped = { top, bottom };
  }

  return {
    x,
    width,
    bodyTop,
    bodyBottom,
    equipped,
    badge: { x: badgeBox.x0, y: badgeBox.y0, width: bw, height: bh },
    kind: bw > width * 0.2 ? "weapon" : "artifact",
  };
}
