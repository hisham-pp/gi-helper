/**
 * The overlays of weapon and artifact cards, read from the card's top-left
 * corner (as fractions of the card width W, measured on PC and phone
 * screenshots):
 *
 *   ┌──┬─────────┐
 *   │R │      (☺)│   R: refinement badge (weapons): a light digit on a dark
 *   ├──┘         │      rounded box, yellow on brown for refinement 5;
 *   │🔒          │      x 0.03–0.20, y 0.02–0.19
 *   │            │   🔒: lock, a salmon padlock on a dark box: below the badge
 *   │            │      (y 0.21–0.38) on weapons, in the badge's place on artifacts
 *
 * The avatar of the character who has the item equipped (☺) overhangs the
 * top-right corner; it is masked while matching (card.ts) but not read.
 */
import type { PixelRect, RgbaImage } from "@gi/grid-detector";
import {
  type Alignment,
  alignedRect,
  luminance,
  rgbToHsv,
  sampleRect,
} from "./card";
import { correlation, type DigitTemplates, GLYPH_H, GLYPH_W } from "./quantity";

export interface RefinementReading {
  /** Refinement rank 1–5, or null when no badge could be read. */
  value: number | null;
  /** 0–1 */
  confidence: number;
}

export interface LockReading {
  locked: boolean;
  /** 0–1 */
  confidence: number;
}

const SLOT_X = { left: 0.03, right: 0.2 } as const;
/** The first slot holds the refinement badge (weapons) or the lock (artifacts). */
const SLOT_1 = { top: 0.02, bottom: 0.19 } as const;
/** Below the badge: the lock of a weapon. */
const SLOT_2 = { top: 0.21, bottom: 0.38 } as const;
/** Sampling resolution of one slot (square). */
const SLOT_PX = 24;

function sampleSlot(
  image: RgbaImage,
  box: PixelRect,
  alignment: Alignment,
  slot: { top: number; bottom: number },
) {
  const rect = alignedRect(box, alignment);
  const w = rect.width;
  return sampleRect(
    image,
    {
      x: rect.x + SLOT_X.left * w,
      y: rect.y + slot.top * w,
      width: (SLOT_X.right - SLOT_X.left) * w,
      height: (slot.bottom - slot.top) * w,
    },
    SLOT_PX,
    SLOT_PX,
  );
}

/** The padlock's salmon pink (≈ #f5857a), far from the orange 5★ background (hue 31–34°). */
const isLockPink = (r: number, g: number, b: number) => {
  const { h, s, v } = rgbToHsv(r, g, b);
  return (h <= 16 || h >= 348) && s >= 0.3 && s <= 0.8 && v >= 0.7;
};

/** Share of lock-pink pixels a slot needs: the padlock fills ~30% of its box. */
const LOCK_SHARE = 0.1;

function lockShare(
  image: RgbaImage,
  box: PixelRect,
  alignment: Alignment,
  slot: { top: number; bottom: number },
) {
  const f = sampleSlot(image, box, alignment, slot);
  let n = 0;
  for (let i = 0; i < f.r.length; i++)
    if (isLockPink(f.r[i], f.g[i], f.b[i])) n++;
  return n / f.r.length;
}

/** Whether the item is locked: a salmon padlock in either corner slot. */
export function readLock(
  image: RgbaImage,
  box: PixelRect,
  alignment: Alignment,
): LockReading {
  const share = Math.max(
    lockShare(image, box, alignment, SLOT_1),
    lockShare(image, box, alignment, SLOT_2),
  );
  const locked = share >= LOCK_SHARE;
  // Clear when far from the threshold either way.
  const distance = locked
    ? (share - LOCK_SHARE) / LOCK_SHARE
    : (LOCK_SHARE - share) / LOCK_SHARE;
  return {
    locked,
    confidence: Math.round(Math.min(1, 0.5 + distance) * 1000) / 1000,
  };
}

/**
 * Reads the refinement badge: a dark box (mean luminance well below the
 * card's background) holding one light digit. The digit is the bright class
 * of an Otsu split; it is cut to its bounds and compared with the quantity
 * digit templates (same game font), restricted to 1–5.
 */
export function readRefinement(
  image: RgbaImage,
  box: PixelRect,
  alignment: Alignment,
  templates: DigitTemplates,
): RefinementReading {
  const none = { value: null, confidence: 0 };
  const f = sampleSlot(image, box, alignment, SLOT_1);
  const n = SLOT_PX * SLOT_PX;
  const lum = new Float32Array(n);
  for (let i = 0; i < n; i++) lum[i] = luminance(f.r[i], f.g[i], f.b[i]);

  // Two classes: the box (dark: luminance ~0.22, or ~0.48 for the brown
  // refinement-5 box) and the digit (light). A padlock in this slot means an
  // artifact or an older card without a badge.
  let pink = 0;
  for (let i = 0; i < n; i++) if (isLockPink(f.r[i], f.g[i], f.b[i])) pink++;
  if (pink / n >= LOCK_SHARE) return none;
  const sorted = Float32Array.from(lum).sort();
  const lo = sorted[Math.floor(n * 0.3)];
  const hi = sorted[Math.floor(n * 0.97)];
  if (hi - lo < 0.2 || lo > 0.56) return none;
  const threshold = (lo + hi) / 2;

  // The digit: bright pixels, away from the slot's edges (the box's rim).
  let x0 = SLOT_PX,
    x1 = -1,
    y0 = SLOT_PX,
    y1 = -1,
    bright = 0;
  const margin = 2;
  for (let y = margin; y < SLOT_PX - margin; y++) {
    for (let x = margin; x < SLOT_PX - margin; x++) {
      if (lum[y * SLOT_PX + x] < threshold) continue;
      bright++;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
  if (bright < 6 || x1 < 0) return none;
  const gh = y1 - y0 + 1;
  const gw = x1 - x0 + 1;
  // A digit is taller than wide and fills a good part of the box's height.
  if (gh < SLOT_PX * 0.35 || gw > gh * 1.1) return none;

  // Normalise like a footer glyph: ink = brightness, height GLYPH_H, aspect kept.
  const ink = new Float32Array(GLYPH_W * GLYPH_H);
  const dstW = Math.min(GLYPH_W, Math.max(1, gw * (GLYPH_H / gh)));
  const offset = (GLYPH_W - dstW) / 2;
  for (let y = 0; y < GLYPH_H; y++) {
    const sy = Math.min(y1, y0 + Math.floor(((y + 0.5) * gh) / GLYPH_H));
    for (let x = 0; x < GLYPH_W; x++) {
      const u = (x + 0.5 - offset) / dstW;
      if (u < 0 || u >= 1) continue;
      const sx = Math.min(x1, x0 + Math.floor(u * gw));
      const v = lum[sy * SLOT_PX + sx];
      ink[y * GLYPH_W + x] = Math.min(1, Math.max(0, (v - lo) / (hi - lo)));
    }
  }
  let best = -1,
    second = -1,
    digit = 0;
  for (let d = 1; d <= 5; d++) {
    const t = templates.digits[String(d)];
    if (!t) continue;
    const c = correlation(ink, t);
    if (c > best) {
      second = best;
      best = c;
      digit = d;
    } else if (c > second) {
      second = c;
    }
  }
  if (best < 0.45) return none;
  const fit = Math.min(1, Math.max(0, (best - 0.45) / 0.35));
  const margin2 = Math.min(1, Math.max(0, (best - second) / 0.15));
  return {
    value: digit,
    confidence: Math.round(Math.sqrt(fit * margin2) * 1000) / 1000,
  };
}
