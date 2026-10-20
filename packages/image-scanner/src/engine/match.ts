/**
 * Icon matching by compositing.
 *
 * For a candidate icon with premultiplied colour I and alpha α, the card's
 * artwork should look like  I + (1 − α) × B,  where B is the card's own
 * rarity background. B is estimated per row from the pixels the candidate
 * leaves uncovered (smoothed over a few rows, since the background is a
 * vertical gradient), so the comparison needs no knowledge of the rarity
 * colours and is immune to the background pattern.
 *
 * The error therefore checks three things at once: the icon's colours, its
 * silhouette (a pixel the icon doesn't cover must look like background), and
 * that nothing else is drawn (an unexplained shape costs error). Per-pixel
 * errors are truncated so an overlay (badge, highlight) cannot dominate.
 */
import type { Template } from "./bank";
import { type Frame, type IgnoreMask } from "./card";

/** Sum of absolute RGB differences above this counts as an outlier. */
const TRUNCATE = 0.75;

/** Scratch buffers, reused across calls (the engine is single-threaded). */
let scratch = new Float32Array(0);
function rowBuffers(rows: number) {
  if (scratch.length < rows * 8) scratch = new Float32Array(rows * 8);
  scratch.fill(0, 0, rows * 8);
  return scratch;
}

/**
 * Mean truncated colour error of the candidate composited over the card's
 * estimated background, over the artwork rows that `mask` doesn't ignore.
 * When `residual` is given, the per-pixel error is written to it (-1 for
 * ignored pixels).
 */
export function compositeError(
  card: Frame,
  t: Template,
  mask: IgnoreMask,
  residual?: Float32Array,
): number {
  const W = t.size;
  const rows = t.rows;
  const radius = Math.max(2, Math.round(W / 20));
  const buf = rowBuffers(rows);
  // buf layout: [sumR, sumG, sumB, sumW] × rows, then smoothed [R, G, B, ok] × rows
  let totR = 0,
    totG = 0,
    totB = 0,
    totW = 0;
  for (let y = 0; y < rows; y++) {
    let sr = 0,
      sg = 0,
      sb = 0,
      sw = 0;
    const base = y * W;
    for (let x = 0; x < W; x++) {
      const i = base + x;
      const w = t.w[i];
      if (w === 0 || mask[i]) continue;
      sr += w * card.r[i];
      sg += w * card.g[i];
      sb += w * card.b[i];
      sw += w;
    }
    buf[y * 4] = sr;
    buf[y * 4 + 1] = sg;
    buf[y * 4 + 2] = sb;
    buf[y * 4 + 3] = sw;
    totR += sr;
    totG += sg;
    totB += sb;
    totW += sw;
  }
  // Global fallback for rows whose window has (almost) no background pixels.
  const gR = totW > 1 ? totR / totW : 0.4;
  const gG = totW > 1 ? totG / totW : 0.4;
  const gB = totW > 1 ? totB / totW : 0.45;

  const out = rows * 4;
  let wr = 0,
    wg = 0,
    wb = 0,
    ww = 0;
  for (let y = 0; y < Math.min(rows, radius); y++) {
    wr += buf[y * 4];
    wg += buf[y * 4 + 1];
    wb += buf[y * 4 + 2];
    ww += buf[y * 4 + 3];
  }
  for (let y = 0; y < rows; y++) {
    const add = y + radius;
    if (add < rows) {
      wr += buf[add * 4];
      wg += buf[add * 4 + 1];
      wb += buf[add * 4 + 2];
      ww += buf[add * 4 + 3];
    }
    const drop = y - radius - 1;
    if (drop >= 0) {
      wr -= buf[drop * 4];
      wg -= buf[drop * 4 + 1];
      wb -= buf[drop * 4 + 2];
      ww -= buf[drop * 4 + 3];
    }
    const o = out + y * 4;
    if (ww > 1) {
      buf[o] = wr / ww;
      buf[o + 1] = wg / ww;
      buf[o + 2] = wb / ww;
    } else {
      buf[o] = gR;
      buf[o + 1] = gG;
      buf[o + 2] = gB;
    }
  }

  let err = 0;
  let n = 0;
  for (let y = 0; y < rows; y++) {
    const o = out + y * 4;
    const br = buf[o],
      bg = buf[o + 1],
      bb = buf[o + 2];
    const base = y * W;
    for (let x = 0; x < W; x++) {
      const i = base + x;
      if (mask[i]) {
        if (residual) residual[i] = -1;
        continue;
      }
      const k = 1 - t.a[i];
      const e =
        Math.abs(card.r[i] - t.r[i] - k * br) +
        Math.abs(card.g[i] - t.g[i] - k * bg) +
        Math.abs(card.b[i] - t.b[i] - k * bb);
      const v = e < TRUNCATE ? e : TRUNCATE;
      if (residual) residual[i] = v;
      err += v;
      n++;
    }
  }
  return n > 0 ? err / n : TRUNCATE;
}

/**
 * Largest mean error over `block × block` windows (stride block/2). A true
 * match leaves only noise everywhere; a look-alike that differs in one spot
 * (another talent book's emblem, a sibling gem's facet) leaves a hot spot
 * that the image-wide mean dilutes.
 */
export function peakBlockError(
  residual: Float32Array,
  width: number,
  rows: number,
  block: number,
): number {
  const step = Math.max(1, block >> 1);
  let peak = 0;
  for (let y0 = 0; y0 + block <= rows; y0 += step) {
    for (let x0 = 0; x0 + block <= width; x0 += step) {
      let s = 0,
        n = 0;
      for (let y = y0; y < y0 + block; y++) {
        for (let x = x0; x < x0 + block; x++) {
          const v = residual[y * width + x];
          if (v < 0) continue;
          s += v;
          n++;
        }
      }
      if (n >= (block * block) / 2 && s / n > peak) peak = s / n;
    }
  }
  return peak;
}

/**
 * Mean colour of the artwork background in the upper-left quadrant, using
 * the pixels a (well-matching) candidate leaves fully uncovered. That corner
 * is rarely covered by icons and never by the "New" badge.
 */
export function backgroundColor(
  card: Frame,
  t: Template,
  mask: IgnoreMask,
): [number, number, number] | null {
  const W = t.size;
  const yMax = Math.min(t.rows, Math.round(W * 0.6));
  const xMax = Math.round(W * 0.45);
  let r = 0,
    g = 0,
    b = 0,
    n = 0;
  for (let y = 1; y < yMax; y++) {
    for (let x = 1; x < xMax; x++) {
      const i = y * W + x;
      if (mask[i] || t.a[i] > 0.02) continue;
      r += card.r[i];
      g += card.g[i];
      b += card.b[i];
      n++;
    }
  }
  // Need a reasonable patch (≥ 4% of the quadrant) for a stable colour.
  return n >= Math.max(8, 0.04 * yMax * xMax) ? [r / n, g / n, b / n] : null;
}

export interface SearchStep {
  dx: number;
  dy: number;
  scale: number;
}

/**
 * Derivative-free pattern search over (dx, dy, scale): try ± one step on
 * each parameter, keep improvements, halve the steps when none helps.
 * `evaluate` returns the error for a parameter set. Returns the best point,
 * its error and how many evaluations were spent.
 */
export function patternSearch(
  evaluate: (p: SearchStep) => number,
  start: SearchStep,
  startError: number,
  options: {
    step: SearchStep;
    minStep: number;
    maxEvaluations: number;
    limit: SearchStep;
  },
): { best: SearchStep; error: number; evaluations: number } {
  let best = { ...start };
  let bestErr = startError;
  const step = { ...options.step };
  let evaluations = 0;
  const keys: (keyof SearchStep)[] = ["dx", "dy", "scale"];
  const center = { dx: 0, dy: 0, scale: 1 };
  while (evaluations < options.maxEvaluations && step.dx >= options.minStep) {
    let improved = false;
    for (const key of keys) {
      for (const sign of [1, -1]) {
        if (evaluations >= options.maxEvaluations) break;
        const next = { ...best, [key]: best[key] + sign * step[key] };
        if (Math.abs(next[key] - center[key]) > options.limit[key] + 1e-9)
          continue;
        const e = evaluate(next);
        evaluations++;
        if (e < bestErr - 1e-6) {
          best = next;
          bestErr = e;
          improved = true;
          break;
        }
      }
    }
    if (!improved) {
      step.dx /= 2;
      step.dy /= 2;
      step.scale /= 2;
    }
  }
  return { best, error: bestErr, evaluations };
}
