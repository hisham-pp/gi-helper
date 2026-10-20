/**
 * Stage 4 — Candidate filtering & deduplication.
 *
 * Each raw rectangle gets a single `quality` (0–1) combining:
 *  - border support: how much of each side is a genuine straight border
 *    (line contrast, so textured artwork does not count);
 *  - the weakest side, so three strong sides cannot carry a missing fourth;
 *  - a gutter-band penalty: the rectangle spans a card plus a gap, or
 *    several cards (see `gutterBandEvidence`);
 *  - a band-slice penalty: two of its sides are pieces of longer UI lines
 *    (see `bandSliceEvidence`);
 *  - an outer-flank penalty: a parallel border runs just outside a side, so
 *    the rectangle sits on an inner border line (see `outerFlankEvidence`).
 * Near-identical rectangles are then collapsed with non-maximum suppression.
 * Overlapping-but-different hypotheses (a card vs. its artwork panel) are kept
 * and arbitrated later, with grid context.
 */
import {
  bandSliceEvidence,
  gutterBandEvidence,
  outerFlankEvidence,
  refineRect,
  type RectCandidate,
} from "./candidates";
import type { EdgeMaps } from "./edges";

export interface Candidate {
  left: number;
  top: number;
  right: number;
  bottom: number;
  /** Mean side support. */
  edge: number;
  /** Weakest side's support. */
  minSide: number;
  /** Number of sides with support ≥ 0.6. */
  strongSides: number;
  /** 0–1 evidence that the rectangle contains a gutter band. */
  band: number;
  /** 0–1 evidence that two sides are slices of longer lines. */
  slice: number;
  /** 0–1 coverage of a parallel edge just outside a side. */
  flank: number;
  /** Combined score 0–1. */
  quality: number;
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

export function combineQuality(
  edge: number,
  minSide: number,
  band: number,
  slice: number,
  flank: number,
): number {
  const bandFactor = 1 - 0.9 * band;
  const sliceFactor = 1 - 0.7 * slice;
  // Partial outside edges are common (badges overhanging a card), so only a
  // substantial parallel line is penalised.
  const flankFactor = 1 - 0.8 * clamp01((flank - 0.3) / 0.5);
  const sideFactor = clamp01(0.4 + 2 * minSide);
  return edge * bandFactor * sliceFactor * flankFactor * sideFactor;
}

export function assessRect(e: EdgeMaps, rect: RectCandidate): Candidate {
  const { left, top, right, bottom, coverage } = rect;
  const sides = [coverage.top, coverage.right, coverage.bottom, coverage.left];
  const minSide = Math.min(...sides);
  const band = gutterBandEvidence(e, left, top, right, bottom);
  const slice = bandSliceEvidence(e, left, top, right, bottom);
  const flank = outerFlankEvidence(e, left, top, right, bottom);
  return {
    left,
    top,
    right,
    bottom,
    edge: rect.score,
    minSide,
    strongSides: sides.filter((v) => v >= 0.6).length,
    band,
    slice,
    flank,
    quality: combineQuality(rect.score, minSide, band, slice, flank),
  };
}

/** Refines and re-evaluates an arbitrary rectangle (used for lattice recovery). */
export function assessAt(
  e: EdgeMaps,
  left: number,
  top: number,
  right: number,
  bottom: number,
  refineRadius: number,
): Candidate {
  return assessRect(e, refineRect(e, left, top, right, bottom, refineRadius));
}

type Box = { left: number; top: number; right: number; bottom: number };

export function rectIoU(a: Box, b: Box): number {
  const ix = Math.min(a.right, b.right) - Math.max(a.left, b.left);
  const iy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
  if (ix <= 0 || iy <= 0) return 0;
  const inter = ix * iy;
  const areaA = (a.right - a.left) * (a.bottom - a.top);
  const areaB = (b.right - b.left) * (b.bottom - b.top);
  return inter / (areaA + areaB - inter);
}

/** Fraction of `a`'s area that lies inside `b`. */
export function containment(a: Box, b: Box): number {
  const ix = Math.min(a.right, b.right) - Math.max(a.left, b.left);
  const iy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
  if (ix <= 0 || iy <= 0) return 0;
  return (ix * iy) / ((a.right - a.left) * (a.bottom - a.top));
}

/**
 * Greedy NMS by quality with a spatial hash so it stays near-linear for
 * thousands of candidates. Only rectangles with IoU ≥ `iouThreshold` (i.e. the
 * same object) are merged.
 */
export function suppressDuplicates(
  cands: Candidate[],
  iouThreshold: number,
): Candidate[] {
  const sorted = [...cands].sort((a, b) => b.quality - a.quality);
  const cell = 24;
  const buckets = new Map<number, Candidate[]>();
  const keyOf = (cx: number, cy: number) => cx * 100003 + cy;
  const kept: Candidate[] = [];
  for (const c of sorted) {
    const cx = Math.floor((c.left + c.right) / 2 / cell);
    const cy = Math.floor((c.top + c.bottom) / 2 / cell);
    // Rectangles with IoU ≥ 0.6 have centres within ~20% of their size.
    const reach =
      Math.ceil((0.2 * Math.max(c.right - c.left, c.bottom - c.top)) / cell) +
      1;
    let duplicate = false;
    for (let dx = -reach; dx <= reach && !duplicate; dx++) {
      for (let dy = -reach; dy <= reach && !duplicate; dy++) {
        const list = buckets.get(keyOf(cx + dx, cy + dy));
        if (!list) continue;
        for (const k of list) {
          if (rectIoU(k, c) >= iouThreshold) {
            duplicate = true;
            break;
          }
        }
      }
    }
    if (duplicate) continue;
    kept.push(c);
    const key = keyOf(cx, cy);
    const list = buckets.get(key);
    if (list) list.push(c);
    else buckets.set(key, [c]);
  }
  return kept;
}

export function filterCandidates(
  raw: RectCandidate[],
  e: EdgeMaps,
  minQuality: number,
): Candidate[] {
  const assessed: Candidate[] = [];
  for (const r of raw) {
    // Upper bound on quality (no band penalty): weak rectangles skip the band analysis.
    const c0 = r.coverage;
    const minSide = Math.min(c0.top, c0.right, c0.bottom, c0.left);
    if (combineQuality(r.score, minSide, 0, 0, 0) < minQuality) continue;
    const c = assessRect(e, r);
    if (c.quality >= minQuality) assessed.push(c);
  }
  return suppressDuplicates(assessed, 0.85);
}
