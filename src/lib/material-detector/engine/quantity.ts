/**
 * Quantity reading: the count is printed in dark grey on the card's cream
 * footer, always in the same game font. A fixed font needs no general OCR
 * engine: glyphs are compared with one template per digit (averaged from
 * labelled reference cards by `scripts/build-digit-templates.ts`).
 *
 *   1. sample the digit band at a fixed height (32 px)
 *   2. Otsu threshold on luminance → ink mask; soft ink map for matching
 *   3. connected components on a common baseline (broken strokes merged)
 *   4. recognition-driven segmentation: neighbouring digits often touch, so
 *      a component is cut where the pieces best match digit templates
 *      (dynamic programming over the ink-projection minima)
 *   5. each piece scaled to 14 × 20 (aspect kept) → best template by correlation
 */
import type { PixelRect } from "../../grid-detector/types";
import type { RgbaImage } from "../../grid-detector/engine/image";
import type { QuantityReading } from "../types";
import { type Alignment, alignedRect, DIGIT_BAND, luminance, sampleRect } from "./card";

export const GLYPH_W = 14;
export const GLYPH_H = 20;
const BAND_H = 32;
/** Digit height / band height (0.093 H of 0.14 H). */
const DIGIT_HEIGHT_RATIO = 0.093 / (DIGIT_BAND.bottom - DIGIT_BAND.top);
/** Width / height of a typical (non-"1") digit, measured on the reference cards. */
const DIGIT_ASPECT = 0.78;
/** Narrowest and widest plausible single digit, relative to its height. */
const MIN_PIECE = 0.25;
const MAX_PIECE = 1.05;
/**
 * A piece must correlate better than this to be worth a cut. True digits
 * score 0.9–1.0 and runners-up 0.5–0.7 on the reference cards, so halves of
 * an "8" (each faintly "1"-like) don't pay for themselves, while two touching
 * digits — which match no single template — always do.
 */
const PIECE_COST = 0.8;
/**
 * In this font a "1" has wide side bearings and never touches its
 * neighbours, so a "1" produced by cutting a component is suspect: at low
 * resolution the halves of a blurred "0" or "8" each look like a "1".
 */
const CUT_ONE_PENALTY = 0.12;

export interface DigitTemplates {
  width: number;
  height: number;
  /** "0"–"9" → GLYPH_W × GLYPH_H ink values (0–1), row-major. */
  digits: Record<string, number[]>;
}

export interface Glyph {
  /** Bounds in band pixels (inclusive). */
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  /** Normalised ink image, GLYPH_W × GLYPH_H. */
  ink: Float32Array;
}

interface Box {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

/** The digit band of one card: soft ink map and the text components on it. */
export interface FooterText {
  width: number;
  height: number;
  /** 0 = footer background, 1 = full ink. */
  ink: Float32Array;
  /** Text components, left to right; each holds one or more touching digits. */
  components: Box[];
  /** Ink/background luminance contrast; ~0 when the band holds no text. */
  contrast: number;
}

function otsu(values: Float32Array): number {
  const bins = 64;
  const hist = new Float64Array(bins);
  for (const v of values) hist[Math.min(bins - 1, Math.max(0, Math.floor(v * bins)))]++;
  const total = values.length;
  let sum = 0;
  for (let i = 0; i < bins; i++) sum += i * hist[i];
  let sumB = 0, wB = 0, best = 0, threshold = 0.5;
  for (let i = 0; i < bins; i++) {
    wB += hist[i];
    if (wB === 0) continue;
    const wF = total - wB;
    if (wF === 0) break;
    sumB += i * hist[i];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    const between = wB * wF * (mB - mF) ** 2;
    if (between > best) {
      best = between;
      threshold = (i + 1) / bins;
    }
  }
  return threshold;
}

/** Area-average of a region of the ink map into GLYPH_W × GLYPH_H, keeping aspect. */
function normalizeGlyph(text: FooterText, b: Box): Float32Array {
  const { ink, width: bandW } = text;
  const out = new Float32Array(GLYPH_W * GLYPH_H);
  const gw = b.x1 - b.x0 + 1;
  const gh = b.y1 - b.y0 + 1;
  const dstW = Math.min(GLYPH_W, Math.max(1, gw * (GLYPH_H / gh)));
  const sx = gw / dstW; // source px per destination px (x)
  const sy = gh / GLYPH_H;
  const offset = (GLYPH_W - dstW) / 2;
  for (let y = 0; y < GLYPH_H; y++) {
    const a = b.y0 + y * sy;
    const e = a + sy;
    for (let x = 0; x < GLYPH_W; x++) {
      const ua = (x - offset) * sx;
      const xa = Math.max(0, ua);
      const xe = Math.min(gw, ua + sx);
      if (xe <= xa) continue;
      let s = 0, wsum = 0;
      for (let py = Math.floor(a); py < Math.ceil(e); py++) {
        const wy = Math.min(e, py + 1) - Math.max(a, py);
        if (wy <= 0) continue;
        for (let px = Math.floor(xa); px < Math.ceil(xe); px++) {
          const wx = Math.min(xe, px + 1) - Math.max(xa, px);
          if (wx <= 0) continue;
          s += ink[py * bandW + b.x0 + px] * wx * wy;
          wsum += wx * wy;
        }
      }
      // Partially covered destination pixels are diluted with background.
      out[y * GLYPH_W + x] = wsum > 0 ? (s / wsum) * ((xe - xa) / sx) : 0;
    }
  }
  return out;
}

/** Finds the text components printed in a card's footer. */
export function readFooterText(image: RgbaImage, box: PixelRect, alignment: Alignment): FooterText {
  const rect = alignedRect(box, alignment);
  const band: PixelRect = {
    x: rect.x + rect.width * DIGIT_BAND.left,
    y: rect.y + rect.height * DIGIT_BAND.top,
    width: rect.width * (DIGIT_BAND.right - DIGIT_BAND.left),
    height: rect.height * (DIGIT_BAND.bottom - DIGIT_BAND.top),
  };
  const H = BAND_H;
  const W = Math.max(8, Math.round((band.width / band.height) * H));
  const frame = sampleRect(image, band, W, H);
  const lum = new Float32Array(W * H);
  for (let i = 0; i < lum.length; i++) lum[i] = luminance(frame.r[i], frame.g[i], frame.b[i]);

  const threshold = otsu(lum);
  let bgSum = 0, bgN = 0, inkSum = 0, inkN = 0;
  for (const v of lum) {
    if (v >= threshold) {
      bgSum += v;
      bgN++;
    } else {
      inkSum += v;
      inkN++;
    }
  }
  const bg = bgN ? bgSum / bgN : 1;
  const fg = inkN ? inkSum / inkN : 0;
  const contrast = bg - fg;
  const ink = new Float32Array(W * H);
  const empty = { width: W, height: H, ink, components: [], contrast: Math.max(0, contrast) };
  // Cream footer ≈ 0.9, digits ≈ 0.3–0.4. Anything flat or dark has no text.
  if (contrast < 0.18 || inkN === 0 || bg < 0.55) return empty;

  const mask = new Uint8Array(W * H);
  for (let i = 0; i < lum.length; i++) {
    ink[i] = Math.min(1, Math.max(0, (bg - lum[i]) / contrast));
    mask[i] = lum[i] < threshold ? 1 : 0;
  }

  // Connected components (8-connectivity).
  const label = new Int32Array(W * H).fill(-1);
  const comps: (Box & { n: number })[] = [];
  const stack: number[] = [];
  for (let start = 0; start < mask.length; start++) {
    if (!mask[start] || label[start] >= 0) continue;
    const c = { x0: W, x1: -1, y0: H, y1: -1, n: 0 };
    label[start] = comps.length;
    stack.push(start);
    while (stack.length) {
      const p = stack.pop()!;
      const x = p % W;
      const y = (p - x) / W;
      c.n++;
      if (x < c.x0) c.x0 = x;
      if (x > c.x1) c.x1 = x;
      if (y < c.y0) c.y0 = y;
      if (y > c.y1) c.y1 = y;
      for (let dy = -1; dy <= 1; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= H) continue;
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx;
          if (xx < 0 || xx >= W) continue;
          const q = yy * W + xx;
          if (mask[q] && label[q] < 0) {
            label[q] = comps.length;
            stack.push(q);
          }
        }
      }
    }
    comps.push(c);
  }

  const digitH = H * DIGIT_HEIGHT_RATIO;
  // Merge pieces of one glyph (strokes split by thresholding): strong horizontal overlap.
  const parts = comps.filter((c) => c.n >= 3 && c.y1 - c.y0 + 1 >= digitH * 0.2).sort((a, b) => a.x0 - b.x0);
  const merged: Box[] = [];
  for (const c of parts) {
    const last = merged[merged.length - 1];
    if (last) {
      const overlap = Math.min(last.x1, c.x1) - Math.max(last.x0, c.x0) + 1;
      const minW = Math.min(last.x1 - last.x0, c.x1 - c.x0) + 1;
      if (overlap >= minW * 0.5) {
        last.x0 = Math.min(last.x0, c.x0);
        last.x1 = Math.max(last.x1, c.x1);
        last.y0 = Math.min(last.y0, c.y0);
        last.y1 = Math.max(last.y1, c.y1);
        continue;
      }
    }
    merged.push({ x0: c.x0, x1: c.x1, y0: c.y0, y1: c.y1 });
  }

  // Keep digit-sized components on a common baseline.
  let components = merged.filter((c) => {
    const h = c.y1 - c.y0 + 1;
    return h >= digitH * 0.6 && h <= digitH * 1.45;
  });
  if (components.length > 0) {
    const centres = components.map((c) => (c.y0 + c.y1) / 2).sort((a, b) => a - b);
    const midY = centres[Math.floor(centres.length / 2)];
    components = components.filter((c) => Math.abs((c.y0 + c.y1) / 2 - midY) <= digitH * 0.3);
  }
  return { width: W, height: H, ink, components, contrast };
}

/** Column-ink minima inside a component: where touching digits can be cut. */
function cutCandidates(text: FooterText, c: Box): number[] {
  const h = c.y1 - c.y0 + 1;
  const proj: number[] = [];
  for (let x = c.x0; x <= c.x1; x++) {
    let s = 0;
    for (let y = c.y0; y <= c.y1; y++) s += text.ink[y * text.width + x];
    proj.push(s);
  }
  const minPiece = Math.max(2, Math.round(MIN_PIECE * h));
  const cuts: number[] = [];
  for (let i = minPiece; i <= proj.length - minPiece; i++) {
    const left = proj[i - 1];
    const here = proj[i];
    const right = i + 1 < proj.length ? proj[i + 1] : Infinity;
    if (here <= left && here <= right) cuts.push(c.x0 + i);
  }
  return cuts;
}

/** Trims empty columns and rows from a piece of a component. */
function tighten(text: FooterText, b: Box): Box | null {
  const colInk = (x: number) => {
    let s = 0;
    for (let y = b.y0; y <= b.y1; y++) s += text.ink[y * text.width + x];
    return s;
  };
  let { x0, x1 } = b;
  while (x0 < x1 && colInk(x0) < 0.5) x0++;
  while (x1 > x0 && colInk(x1) < 0.5) x1--;
  return x1 - x0 >= 0 ? { x0, x1, y0: b.y0, y1: b.y1 } : null;
}

/** Splits a component that may hold several touching digits by aspect alone (no templates). */
export function splitByAspect(text: FooterText, c: Box): Box[] {
  const w = c.x1 - c.x0 + 1;
  const h = c.y1 - c.y0 + 1;
  const n = Math.max(1, Math.round(w / (DIGIT_ASPECT * h)));
  if (n === 1) return [c];
  const cuts = cutCandidates(text, c);
  const pieces: Box[] = [];
  let left = c.x0;
  for (let k = 1; k < n; k++) {
    const target = c.x0 + (w * k) / n;
    const cut = cuts.length ? cuts.reduce((a, b) => (Math.abs(b - target) < Math.abs(a - target) ? b : a)) : Math.round(target);
    if (cut <= left) continue;
    pieces.push({ x0: left, x1: cut - 1, y0: c.y0, y1: c.y1 });
    left = cut;
  }
  pieces.push({ x0: left, x1: c.x1, y0: c.y0, y1: c.y1 });
  return pieces;
}

/** Normalised glyphs for template building (aspect-based splitting). */
export function extractGlyphs(image: RgbaImage, box: PixelRect, alignment: Alignment): Glyph[] {
  const text = readFooterText(image, box, alignment);
  return text.components
    .flatMap((c) => splitByAspect(text, c))
    .map((b) => tighten(text, b))
    .filter((b): b is Box => b !== null)
    .map((b) => ({ ...b, ink: normalizeGlyph(text, b) }));
}

function correlation(a: Float32Array, b: number[]): number {
  const n = a.length;
  let ma = 0, mb = 0;
  for (let i = 0; i < n; i++) {
    ma += a[i];
    mb += b[i];
  }
  ma /= n;
  mb /= n;
  let sab = 0, saa = 0, sbb = 0;
  for (let i = 0; i < n; i++) {
    const da = a[i] - ma;
    const db = b[i] - mb;
    sab += da * db;
    saa += da * da;
    sbb += db * db;
  }
  return saa > 0 && sbb > 0 ? sab / Math.sqrt(saa * sbb) : 0;
}

export interface DigitMatch {
  digit: string;
  score: number;
  runnerUp: number;
}

export function classifyGlyph(ink: Float32Array, templates: DigitTemplates): DigitMatch {
  let digit = "?";
  let score = -1;
  let runnerUp = -1;
  for (const [d, t] of Object.entries(templates.digits)) {
    const c = correlation(ink, t);
    if (c > score) {
      runnerUp = score;
      score = c;
      digit = d;
    } else if (c > runnerUp) {
      runnerUp = c;
    }
  }
  return { digit, score, runnerUp };
}

/**
 * Best segmentation of one component into digits: dynamic programming over
 * the cut candidates, maximising Σ (correlation − PIECE_COST). An extra cut
 * must therefore produce two pieces that each look like a digit.
 */
function segmentComponent(text: FooterText, c: Box, templates: DigitTemplates): DigitMatch[] {
  const h = c.y1 - c.y0 + 1;
  const positions = [c.x0, ...cutCandidates(text, c), c.x1 + 1];
  const memo = new Map<string, DigitMatch | null>();
  const last = positions.length - 1;
  const piece = (i: number, j: number): DigitMatch | null => {
    const k = `${i},${j}`;
    if (memo.has(k)) return memo.get(k)!;
    const w = positions[j] - positions[i];
    let result: DigitMatch | null = null;
    if (w >= MIN_PIECE * h && w <= MAX_PIECE * h) {
      const b = tighten(text, { x0: positions[i], x1: positions[j] - 1, y0: c.y0, y1: c.y1 });
      if (b) result = classifyGlyph(normalizeGlyph(text, b), templates);
    }
    memo.set(k, result);
    return result;
  };
  const gain = (i: number, j: number, m: DigitMatch) =>
    m.score - PIECE_COST - (m.digit === "1" && (i > 0 || j < last) ? CUT_ONE_PENALTY : 0);
  const best: { value: number; from: number }[] = positions.map(() => ({ value: -Infinity, from: -1 }));
  best[0] = { value: 0, from: -1 };
  for (let j = 1; j < positions.length; j++) {
    for (let i = 0; i < j; i++) {
      if (best[i].value === -Infinity) continue;
      const m = piece(i, j);
      if (!m) continue;
      const v = best[i].value + gain(i, j, m);
      if (v > best[j].value) best[j] = { value: v, from: i };
    }
  }
  const end = last;
  if (best[end].value === -Infinity) {
    // No plausible split (e.g. a smudge): classify the whole component.
    const b = tighten(text, c);
    return b ? [classifyGlyph(normalizeGlyph(text, b), templates)] : [];
  }
  const out: DigitMatch[] = [];
  for (let j = end; j > 0; j = best[j].from) out.unshift(piece(best[j].from, j)!);
  return out;
}

/** 0–1 confidence of a digit decision from its correlation and margin. */
function digitConfidence(m: DigitMatch): number {
  const fit = Math.min(1, Math.max(0, (m.score - 0.55) / 0.3));
  const margin = Math.min(1, Math.max(0, (m.score - m.runnerUp) / 0.15));
  return Math.sqrt(fit * margin);
}

export function readQuantity(
  image: RgbaImage,
  box: PixelRect,
  alignment: Alignment,
  templates: DigitTemplates,
): QuantityReading {
  const text = readFooterText(image, box, alignment);
  const digits = text.components.flatMap((c) => segmentComponent(text, c, templates));
  if (digits.length === 0 || digits.length > 5) return { value: null, text: "", confidence: 0 };
  let str = "";
  let confidence = 1;
  for (const d of digits) {
    str += d.score >= 0.45 ? d.digit : "?";
    confidence = Math.min(confidence, digitConfidence(d));
  }
  const value = /^\d+$/.test(str) && !(str.length > 1 && str[0] === "0") ? parseInt(str, 10) : null;
  return { value, text: str, confidence: value === null ? 0 : Math.round(confidence * 1000) / 1000 };
}
