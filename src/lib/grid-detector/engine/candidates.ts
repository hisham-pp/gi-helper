/**
 * Stage 3 — Candidate rectangle generation.
 *
 * Card borders show up as long, straight, axis-aligned edge segments. We trace
 * those segments, pair parallel ones that could be opposite sides of a card,
 * then search for the two closing sides by scanning edge coverage between the
 * pair. This is deliberately over-generous: it also produces sub-parts of
 * cards and blocks of several cards. Later stages (filtering, size clustering,
 * lattice fitting) decide which rectangles are real cards.
 *
 * All coordinates here are analysis pixels. A rectangle is described by the
 * positions of its four border lines: left/right are x positions of vertical
 * edges, top/bottom are y positions of horizontal edges.
 */
import {
  type EdgeMaps,
  horizontalCoverage,
  horizontalSupport,
  verticalCoverage,
  verticalSupport,
} from "./edges";

export interface Segment {
  /** x for vertical segments, y for horizontal ones. */
  pos: number;
  start: number;
  /** exclusive */
  end: number;
}

export interface RectCandidate {
  left: number;
  top: number;
  right: number;
  bottom: number;
  /** Edge coverage of each side after refinement (0–1). */
  coverage: { top: number; right: number; bottom: number; left: number };
  /** Mean side coverage. */
  score: number;
}

export interface CandidateLimits {
  minW: number;
  maxW: number;
  minH: number;
  maxH: number;
  minAspect: number;
  maxAspect: number;
}

/** Minimum line contrast for a traced segment to be paired. */
const SEGMENT_MIN_SUPPORT = 0.5;

/** Fraction of a side ignored at each end, so rounded corners don't count as gaps. */
const CORNER_INSET = 0.1;

/**
 * Traces straight runs in a dilated edge mask. Runs on adjacent columns/rows
 * that describe the same physical edge are merged (keeping the longest and
 * averaging their position), so each border yields one segment.
 */
export function traceSegments(
  mask: Uint8Array,
  w: number,
  h: number,
  vertical: boolean,
  minLen: number,
  maxGap: number,
): Segment[] {
  const lines = vertical ? w : h;
  const len = vertical ? h : w;
  const perLine: Segment[][] = new Array(lines);
  for (let p = 0; p < lines; p++) {
    const runs: Segment[] = [];
    let start = -1;
    let last = -1;
    for (let q = 0; q < len; q++) {
      const on = vertical ? mask[q * w + p] : mask[p * w + q];
      if (!on) continue;
      if (start >= 0 && q - last <= maxGap + 1) {
        last = q;
      } else {
        if (start >= 0 && last + 1 - start >= minLen) {
          runs.push({ pos: p, start, end: last + 1 });
        }
        start = q;
        last = q;
      }
    }
    if (start >= 0 && last + 1 - start >= minLen) {
      runs.push({ pos: p, start, end: last + 1 });
    }
    perLine[p] = runs;
  }

  // Merge near-identical runs on neighbouring lines (the mask is 3px wide).
  const used: Set<Segment> = new Set();
  const out: Segment[] = [];
  for (let p = 0; p < lines; p++) {
    for (const seg of perLine[p]) {
      if (used.has(seg)) continue;
      used.add(seg);
      let posSum = seg.pos * (seg.end - seg.start);
      let weight = seg.end - seg.start;
      let start = seg.start;
      let end = seg.end;
      // The dilated mask spreads one edge over 3 adjacent lines; merging any
      // further would fuse distinct parallel edges (e.g. a double border).
      for (let dp = 1; dp <= 2 && p + dp < lines; dp++) {
        for (const other of perLine[p + dp]) {
          if (used.has(other)) continue;
          const ov = Math.min(end, other.end) - Math.max(start, other.start);
          const shorter = Math.min(end - start, other.end - other.start);
          if (ov < 0.5 * shorter) continue;
          used.add(other);
          const l = other.end - other.start;
          posSum += other.pos * l;
          weight += l;
          start = Math.min(start, other.start);
          end = Math.max(end, other.end);
        }
      }
      out.push({ pos: Math.round(posSum / weight), start, end });
    }
  }
  return out;
}

export function scoreSides(
  e: EdgeMaps,
  left: number,
  top: number,
  right: number,
  bottom: number,
): RectCandidate["coverage"] {
  const ix = Math.max(1, Math.round((right - left) * CORNER_INSET));
  const iy = Math.max(1, Math.round((bottom - top) * CORNER_INSET));
  return {
    top: horizontalSupport(e, top, left + ix, right - ix),
    bottom: horizontalSupport(e, bottom, left + ix, right - ix),
    left: verticalSupport(e, left, top + iy, bottom - iy),
    right: verticalSupport(e, right, top + iy, bottom - iy),
  };
}

function meanCoverage(c: RectCandidate["coverage"]): number {
  return (c.top + c.right + c.bottom + c.left) / 4;
}

/**
 * Nudges each side by up to `radius` pixels to the position of best edge
 * support. Two passes let the sides settle against each other.
 */
export function refineRect(
  e: EdgeMaps,
  left: number,
  top: number,
  right: number,
  bottom: number,
  radius = 2,
): RectCandidate {
  let L = left,
    T = top,
    R = right,
    B = bottom;
  for (let pass = 0; pass < 2; pass++) {
    const ix = Math.max(1, Math.round((R - L) * CORNER_INSET));
    const iy = Math.max(1, Math.round((B - T) * CORNER_INSET));
    // The dilated edge mask turns each border into a ~3px plateau of equal
    // support; settle on the plateau's centre, which is the border itself.
    const bestOffset = (fn: (d: number) => number) => {
      const span = radius + 1;
      const values: number[] = [];
      let bestV = -1;
      for (let d = -span; d <= span; d++) {
        const v = fn(d);
        values.push(v);
        if (Math.abs(d) <= radius && v > bestV) bestV = v;
      }
      if (bestV <= 0) return 0;
      let bestCentre = 0;
      let bestDist = Infinity;
      for (let i = 0; i < values.length; i++) {
        if (values[i] < bestV - 0.02) continue;
        let j = i;
        while (j + 1 < values.length && values[j + 1] >= bestV - 0.02) j++;
        const centre = Math.round((i + j) / 2) - span;
        if (Math.abs(centre) <= radius && Math.abs(centre) < bestDist) {
          bestDist = Math.abs(centre);
          bestCentre = centre;
        }
        i = j;
      }
      return bestCentre;
    };
    T += bestOffset((d) => horizontalSupport(e, T + d, L + ix, R - ix));
    B += bestOffset((d) => horizontalSupport(e, B + d, L + ix, R - ix));
    L += bestOffset((d) => verticalSupport(e, L + d, T + iy, B - iy));
    R += bestOffset((d) => verticalSupport(e, R + d, T + iy, B - iy));
  }
  const coverage = scoreSides(e, L, T, R, B);
  return {
    left: L,
    top: T,
    right: R,
    bottom: B,
    coverage,
    score: meanCoverage(coverage),
  };
}

/** Segments bucketed by their line position, for O(1) "is there a border here?" lookups. */
type SegmentIndex = Segment[][];

function indexSegments(segs: Segment[], lines: number): SegmentIndex {
  const idx: SegmentIndex = Array.from({ length: lines }, () => []);
  for (const sgm of segs) idx[sgm.pos].push(sgm);
  return idx;
}

/**
 * Strongest closing-side positions within [from, to]. Only positions where a
 * traced segment (±1px) overlaps the span [lo, hi) can carry a border, so
 * support is evaluated there alone instead of on every line of the window.
 */
function findPeaks(
  index: SegmentIndex,
  from: number,
  to: number,
  lo: number,
  hi: number,
  supportAt: (p: number) => number,
  minSupport: number,
  maxPeaks: number,
): number[] {
  const minOverlap = 0.15 * (hi - lo);
  const evaluated: { p: number; v: number }[] = [];
  let last = -10;
  for (let p = from; p <= to; p++) {
    let hit = false;
    for (let q = p - 1; q <= p + 1 && !hit; q++) {
      const bucket = index[q];
      if (!bucket) continue;
      for (const sg of bucket) {
        if (Math.min(sg.end, hi) - Math.max(sg.start, lo) >= minOverlap) {
          hit = true;
          break;
        }
      }
    }
    if (!hit || p === last) continue;
    last = p;
    const v = supportAt(p);
    if (v >= minSupport) evaluated.push({ p, v });
  }
  // Non-maximum suppression within ±2px (one physical border).
  evaluated.sort((a, b) => b.v - a.v || a.p - b.p);
  const peaks: number[] = [];
  for (const cand of evaluated) {
    if (peaks.some((q) => Math.abs(q - cand.p) <= 2)) continue;
    peaks.push(cand.p);
    if (peaks.length >= maxPeaks) break;
  }
  return peaks;
}

/**
 * Pairs parallel segments and closes the rectangle. `vertical` = true pairs
 * left/right borders and searches for top/bottom; false does the transpose.
 */
function pairSegments(
  segs: Segment[],
  crossIndex: SegmentIndex,
  e: EdgeMaps,
  limits: CandidateLimits,
  vertical: boolean,
  out: RectCandidate[],
  seen: Set<number>,
  maxPairs: number,
): boolean {
  const sorted = [...segs].sort((a, b) => a.pos - b.pos);
  const minGap = vertical ? limits.minW : limits.minH;
  const maxGap = vertical ? limits.maxW : limits.maxH;
  const minSpan = vertical ? limits.minH : limits.minW;
  const maxSpan = vertical ? limits.maxH : limits.maxW;
  const limitAcross = vertical ? e.height - 1 : e.width - 1;
  // Minimum (side length / separation) allowed by the aspect-ratio limits.
  const minSideRatio = vertical ? 1 / limits.maxAspect : limits.minAspect;
  let pairs = 0;

  for (let i = 0; i < sorted.length; i++) {
    const a = sorted[i];
    const lenA = a.end - a.start;
    for (let j = i + 1; j < sorted.length; j++) {
      const b = sorted[j];
      const gap = b.pos - a.pos;
      if (gap > maxGap) break;
      if (gap < minGap) continue;
      const lenB = b.end - b.start;
      const ov = Math.min(a.end, b.end) - Math.max(a.start, b.start);
      if (ov < 0.5 * Math.min(lenA, lenB)) continue;
      // A card side is never short compared with the card's width (aspect
      // limits), so short segments far apart cannot be opposite sides — even
      // a side broken by a badge keeps at least half its length.
      if (Math.min(lenA, lenB) < 0.5 * gap * minSideRatio) continue;
      if (++pairs > maxPairs) return false;

      const s = Math.min(a.start, b.start);
      const t = Math.max(a.end, b.end);
      // Rounded corners shorten side segments, and badges/icons can break
      // them, so search generously around the segment ends.
      const pad = Math.round(0.25 * (t - s)) + 3;
      const inset = Math.max(1, Math.round(gap * CORNER_INSET));
      const lo = a.pos + inset;
      const hi = b.pos - inset;
      const cov = vertical
        ? (p: number) => horizontalSupport(e, p, lo, hi)
        : (p: number) => verticalSupport(e, p, lo, hi);

      const firsts = findPeaks(
        crossIndex,
        Math.max(0, s - pad),
        Math.min(limitAcross, s + pad),
        lo,
        hi,
        cov,
        0.3,
        3,
      );
      if (firsts.length === 0) continue;
      const lasts = findPeaks(
        crossIndex,
        Math.max(0, t - pad),
        Math.min(limitAcross, t + pad),
        lo,
        hi,
        cov,
        0.3,
        3,
      );
      for (const f of firsts) {
        for (const l of lasts) {
          const span = l - f;
          if (span < minSpan || span > maxSpan) continue;
          const w = vertical ? gap : span;
          const h = vertical ? span : gap;
          const aspect = w / h;
          if (aspect < limits.minAspect || aspect > limits.maxAspect) continue;
          const [L, T, R, B] = vertical
            ? [a.pos, f, b.pos, l]
            : [f, a.pos, l, b.pos];
          // Many segment pairs close the same rectangle; refine each once.
          const key = ((L * 4099 + T) * 4099 + R) * 4099 + B;
          if (seen.has(key)) continue;
          seen.add(key);
          const quick = scoreSides(e, L, T, R, B);
          if (
            Math.min(quick.top, quick.right, quick.bottom, quick.left) < 0.12 ||
            quick.top + quick.right + quick.bottom + quick.left < 1.6
          ) {
            continue;
          }
          const refined = refineRect(e, L, T, R, B);
          // Different starting points often settle on the same borders.
          const refinedKey =
            -1 -
            (((refined.left * 4099 + refined.top) * 4099 + refined.right) * 4099 + refined.bottom);
          if (seen.has(refinedKey)) continue;
          seen.add(refinedKey);
          out.push(refined);
        }
      }
    }
  }
  return true;
}

export interface CandidateGenerationResult {
  candidates: RectCandidate[];
  segmentCount: number;
  /** False when the safety limit on segment pairs was reached (pathological images). */
  complete: boolean;
}

export function generateCandidates(
  e: EdgeMaps,
  limits: CandidateLimits,
): CandidateGenerationResult {
  const { width: w, height: h } = e;
  const minSide = Math.min(limits.minW, limits.minH);
  // A side may lose ~20% to rounded corners and more to overlapping badges.
  const minLen = Math.max(5, Math.round(minSide * 0.35));
  const maxGap = 2;
  // Segments inside textured artwork have equally edgy flanks; they can never
  // be card sides, and dropping them early removes most of the pairing work.
  const vSegs = traceSegments(e.vMask, w, h, true, minLen, maxGap).filter(
    (sg) => verticalSupport(e, sg.pos, sg.start, sg.end) >= SEGMENT_MIN_SUPPORT,
  );
  const hSegs = traceSegments(e.hMask, w, h, false, minLen, maxGap).filter(
    (sg) => horizontalSupport(e, sg.pos, sg.start, sg.end) >= SEGMENT_MIN_SUPPORT,
  );

  const vIndex = indexSegments(vSegs, w);
  const hIndex = indexSegments(hSegs, h);

  const out: RectCandidate[] = [];
  const seen = new Set<number>();
  // Safety valve for pathological images (e.g. dense line art); never reached
  // on real screenshots, and reported in diagnostics when it is.
  const maxPairs = 400_000;
  const completeV = pairSegments(vSegs, hIndex, e, limits, true, out, seen, maxPairs);
  const completeH = pairSegments(hSegs, vIndex, e, limits, false, out, seen, maxPairs);
  return {
    candidates: out,
    segmentCount: vSegs.length + hSegs.length,
    complete: completeV && completeH,
  };
}

/** Minimum support for a line inside a rectangle to count as a structural divider. */
const INTERIOR_LINE_MIN = 0.45;

/**
 * Gutter-band test.
 *
 * A rectangle that spans a card plus the gap next to it (or two cards and the
 * gap between them) has four strong sides, just like a real card, so edge
 * support alone cannot reject it. What gives it away is structure: the real
 * card's border runs through it as an interior line, and the band between
 * that line and the rectangle's side is gutter — no border runs *across* that
 * band, because the card's sides end at the card.
 *
 * Real cards can have full-width interior dividers too (Genshin's quantity
 * strip), but the bands they create are still bounded by the card's sides.
 *
 * Returns 0–1: how strongly the rectangle looks like it contains a gutter band.
 */
export function gutterBandEvidence(
  e: EdgeMaps,
  left: number,
  top: number,
  right: number,
  bottom: number,
): number {
  const w = right - left;
  const h = bottom - top;
  const ix = Math.max(1, Math.round(w * CORNER_INSET));
  const iy = Math.max(1, Math.round(h * CORNER_INSET));
  const mx = Math.max(3, Math.round(0.04 * w));
  const my = Math.max(3, Math.round(0.04 * h));

  const interiorLines = (
    from: number,
    to: number,
    support: (p: number) => number,
  ): { pos: number; s: number }[] => {
    const lines: { pos: number; s: number }[] = [];
    let prev = support(from - 1);
    let cur = support(from);
    for (let p = from; p <= to; p++) {
      const next = support(p + 1);
      if (cur >= INTERIOR_LINE_MIN && cur >= prev && cur > next)
        lines.push({ pos: p, s: cur });
      prev = cur;
      cur = next;
    }
    return lines;
  };

  const bandEvidence = (
    lines: { pos: number; s: number }[],
    start: number,
    end: number,
    crossSupport: (a: number, b: number) => number,
  ): number => {
    // Thinner bands are border/corner artefacts; a real gutter this thin
    // would make the card+gap rectangle indistinguishable from the card.
    const minBand = Math.max(5, Math.round(0.06 * (end - start)));
    const stops = [{ pos: start, s: 0 }, ...lines, { pos: end, s: 0 }];
    let worst = 0;
    for (let i = 0; i + 1 < stops.length; i++) {
      const a = stops[i];
      const b = stops[i + 1];
      if (b.pos - a.pos < minBand) continue;
      const lineStrength = Math.max(a.s, b.s);
      if (lineStrength === 0) continue; // whole rectangle, not a band
      const across = crossSupport(a.pos + 2, b.pos - 2);
      const missing = 1 - Math.min(1, across / 0.35);
      worst = Math.max(worst, lineStrength * missing);
    }
    return worst;
  };

  const hLines = interiorLines(top + my, bottom - my, (y) =>
    horizontalSupport(e, y, left + ix, right - ix),
  );
  const horizontalBands = bandEvidence(hLines, top, bottom, (a, b) =>
    Math.max(verticalSupport(e, left, a, b), verticalSupport(e, right, a, b)),
  );
  const vLines = interiorLines(left + mx, right - mx, (x) =>
    verticalSupport(e, x, top + iy, bottom - iy),
  );
  const verticalBands = bandEvidence(vLines, left, right, (a, b) =>
    Math.max(
      horizontalSupport(e, top, a, b),
      horizontalSupport(e, bottom, a, b),
    ),
  );
  return Math.max(horizontalBands, verticalBands);
}

/**
 * Band-slice test.
 *
 * Long UI lines (sidebar edges, panel borders) cut through many short
 * features, so "rectangles" appear whose two parallel sides are segments of
 * much longer lines, closed by short incidental edges (icon tangents, text).
 * A real card's border stops at its (rounded) corners: just beyond each
 * corner lies a gutter. Returns 0–1: how strongly one pair of parallel sides
 * continues past the rectangle while the other pair does not. Table-style
 * grids, where every side continues, are not penalised.
 */
export function bandSliceEvidence(
  e: EdgeMaps,
  left: number,
  top: number,
  right: number,
  bottom: number,
): number {
  const w = right - left;
  const h = bottom - top;
  const extY = Math.max(3, Math.round(0.1 * h));
  const extX = Math.max(3, Math.round(0.1 * w));
  const contV = (x: number) =>
    Math.max(
      verticalSupport(e, x, top - 2 - extY, top - 2),
      verticalSupport(e, x, bottom + 2, bottom + 2 + extY),
    );
  const contH = (y: number) =>
    Math.max(
      horizontalSupport(e, y, left - 2 - extX, left - 2),
      horizontalSupport(e, y, right + 2, right + 2 + extX),
    );
  const vL = contV(left);
  const vR = contV(right);
  const hT = contH(top);
  const hB = contH(bottom);
  return Math.max(
    Math.min(vL, vR) * (1 - Math.max(hT, hB)),
    Math.min(hT, hB) * (1 - Math.max(vL, vR)),
  );
}

/**
 * Outer-flank test.
 *
 * A card's outermost border has gutter (or background) right outside it. When
 * cards have double borders (outline + frame) and narrow gaps, a rectangle
 * can lock onto an *inner* border line on one side and a neighbour's line on
 * the other; it then has another straight edge running parallel just outside
 * one of its sides. Returns the largest edge coverage found 3–4px outside any
 * side (0 = clean outline, 1 = a full parallel line outside a side).
 */
export function outerFlankEvidence(
  e: EdgeMaps,
  left: number,
  top: number,
  right: number,
  bottom: number,
): number {
  const ix = Math.max(1, Math.round((right - left) * 0.15));
  const iy = Math.max(1, Math.round((bottom - top) * 0.15));
  let worst = 0;
  for (const d of [3, 4]) {
    worst = Math.max(
      worst,
      verticalCoverage(e, left - d, top + iy, bottom - iy),
      verticalCoverage(e, right + d, top + iy, bottom - iy),
      horizontalCoverage(e, top - d, left + ix, right - ix),
      horizontalCoverage(e, bottom + d, left + ix, right - ix),
    );
  }
  return worst;
}
