/**
 * Stage 2 — Edge extraction.
 *
 * Produces thin, axis-aligned edge masks plus prefix sums so that the
 * "edge coverage" of any horizontal or vertical line segment can be queried in
 * O(1). Coverage queries are the workhorse of candidate scoring: a card side is
 * supported when most pixels along it sit on an edge.
 */
import type { PlanarImage } from "./image";

export interface EdgeMaps {
  width: number;
  height: number;
  /** Vertical-edge strength (|∂I/∂x|), smoothed along y. */
  gx: Float32Array;
  /** Horizontal-edge strength (|∂I/∂y|), smoothed along x. */
  gy: Float32Array;
  /** 1 where a thin vertical edge passes within ±1px horizontally. */
  vMask: Uint8Array;
  /** 1 where a thin horizontal edge passes within ±1px vertically. */
  hMask: Uint8Array;
  /** Non-dilated thin masks (used for segment tracing). */
  vThin: Uint8Array;
  hThin: Uint8Array;
  /** Column-wise prefix sums of vMask: index (y * width + x), (height + 1) rows. */
  vPrefix: Int32Array;
  /** Row-wise prefix sums of hMask: index (y * (width + 1) + x). */
  hPrefix: Int32Array;
  threshold: number;
}

/** Max over RGB of the absolute central difference — catches colour edges with equal luminance. */
function rawGradients(img: PlanarImage): {
  gx: Float32Array;
  gy: Float32Array;
} {
  const { width: w, height: h, r, g, b } = img;
  const gx = new Float32Array(w * h);
  const gy = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    const base = y * w;
    for (let x = 1; x < w - 1; x++) {
      const i = base + x;
      const dr = Math.abs(r[i + 1] - r[i - 1]);
      const dg = Math.abs(g[i + 1] - g[i - 1]);
      const db = Math.abs(b[i + 1] - b[i - 1]);
      gx[i] = dr > dg ? (dr > db ? dr : db) : dg > db ? dg : db;
    }
  }
  for (let y = 1; y < h - 1; y++) {
    const base = y * w;
    for (let x = 0; x < w; x++) {
      const i = base + x;
      const dr = Math.abs(r[i + w] - r[i - w]);
      const dg = Math.abs(g[i + w] - g[i - w]);
      const db = Math.abs(b[i + w] - b[i - w]);
      gy[i] = dr > dg ? (dr > db ? dr : db) : dg > db ? dg : db;
    }
  }
  return { gx, gy };
}

/** 1-D box filter of radius `rad` along x (`alongX`) or y, clamped at the borders. */
function smoothAlong(
  src: Float32Array,
  w: number,
  h: number,
  rad: number,
  alongX: boolean,
): Float32Array {
  const out = new Float32Array(w * h);
  const norm = 1 / (2 * rad + 1);
  if (alongX) {
    for (let y = 0; y < h; y++) {
      const base = y * w;
      for (let x = 0; x < w; x++) {
        let s = 0;
        for (let k = -rad; k <= rad; k++) {
          const xx = x + k < 0 ? 0 : x + k >= w ? w - 1 : x + k;
          s += src[base + xx];
        }
        out[base + x] = s * norm;
      }
    }
  } else {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let s = 0;
        for (let k = -rad; k <= rad; k++) {
          const yy = y + k < 0 ? 0 : y + k >= h ? h - 1 : y + k;
          s += src[yy * w + x];
        }
        out[y * w + x] = s * norm;
      }
    }
  }
  return out;
}

/** Value at the given quantile of a non-negative map, via a 0.5-wide histogram. */
function quantile(values: Float32Array, q: number): number {
  const bins = new Uint32Array(512);
  for (let i = 0; i < values.length; i++) {
    const b = Math.min(511, Math.floor(values[i] * 2));
    bins[b]++;
  }
  const target = values.length * q;
  let acc = 0;
  for (let b = 0; b < bins.length; b++) {
    acc += bins[b];
    if (acc >= target) return b / 2;
  }
  return 255;
}

/**
 * Adaptive edge threshold. Screenshots differ wildly in contrast (blurred game
 * scenes vs. flat UI), so the threshold is derived from the image's own
 * gradient distribution. A low quantile is used as the noise floor because in
 * tightly cropped grids cards can cover most of the frame, which pushes any
 * mid/high quantile onto real card texture. `sensitivity` scales the result.
 */
export function chooseEdgeThreshold(
  gx: Float32Array,
  gy: Float32Array,
  sensitivity: number,
): number {
  const noise = Math.max(quantile(gx, 0.3), quantile(gy, 0.3));
  const multiplier = 1.6 - 1.2 * sensitivity; // 0 → 1.6, 0.5 → 1.0, 1 → 0.4
  const base = Math.max(6, noise * 4 + 3);
  return Math.max(2.5, Math.min(40, base * multiplier));
}

export function computeEdgeMaps(
  img: PlanarImage,
  sensitivity: number,
): EdgeMaps {
  const { width: w, height: h } = img;
  const raw = rawGradients(img);
  // Smoothing *along* the edge direction reinforces straight borders and
  // removes NMS jitter, without blurring the edge's position.
  const gx = smoothAlong(raw.gx, w, h, 2, false);
  const gy = smoothAlong(raw.gy, w, h, 2, true);
  const threshold = chooseEdgeThreshold(gx, gy, sensitivity);
  return buildEdgeMaps(w, h, gx, gy, threshold);
}

/**
 * The same gradients thresholded differently. Used to look for faint card
 * borders at positions the grid lattice already predicts, where a lower
 * threshold cannot create false detections out of nothing.
 */
export function withThreshold(e: EdgeMaps, threshold: number): EdgeMaps {
  return buildEdgeMaps(e.width, e.height, e.gx, e.gy, threshold);
}

function buildEdgeMaps(
  w: number,
  h: number,
  gx: Float32Array,
  gy: Float32Array,
  threshold: number,
): EdgeMaps {
  const n = w * h;
  const vThin = new Uint8Array(n);
  const hThin = new Uint8Array(n);
  // Non-maximum suppression across the edge so each border is one pixel wide.
  for (let y = 0; y < h; y++) {
    const base = y * w;
    for (let x = 1; x < w - 1; x++) {
      const i = base + x;
      const v = gx[i];
      if (v >= threshold && v >= gx[i - 1] && v > gx[i + 1]) vThin[i] = 1;
    }
  }
  for (let y = 1; y < h - 1; y++) {
    const base = y * w;
    for (let x = 0; x < w; x++) {
      const i = base + x;
      const v = gy[i];
      if (v >= threshold && v >= gy[i - w] && v > gy[i + w]) hThin[i] = 1;
    }
  }

  // Dilate by one pixel across the edge to tolerate ±1px localisation error.
  const vMask = new Uint8Array(n);
  const hMask = new Uint8Array(n);
  for (let y = 0; y < h; y++) {
    const base = y * w;
    for (let x = 0; x < w; x++) {
      const i = base + x;
      if (vThin[i] || (x > 0 && vThin[i - 1]) || (x < w - 1 && vThin[i + 1]))
        vMask[i] = 1;
      if (hThin[i] || (y > 0 && hThin[i - w]) || (y < h - 1 && hThin[i + w]))
        hMask[i] = 1;
    }
  }

  const vPrefix = new Int32Array((h + 1) * w);
  for (let y = 0; y < h; y++) {
    const cur = y * w;
    const next = (y + 1) * w;
    for (let x = 0; x < w; x++)
      vPrefix[next + x] = vPrefix[cur + x] + vMask[cur + x];
  }
  const hPrefix = new Int32Array(h * (w + 1));
  for (let y = 0; y < h; y++) {
    const pb = y * (w + 1);
    const mb = y * w;
    for (let x = 0; x < w; x++)
      hPrefix[pb + x + 1] = hPrefix[pb + x] + hMask[mb + x];
  }

  return {
    width: w,
    height: h,
    gx,
    gy,
    vMask,
    hMask,
    vThin,
    hThin,
    vPrefix,
    hPrefix,
    threshold,
  };
}

/** Fraction of pixels on column `x`, rows [y0, y1), that lie on a vertical edge. */
export function verticalCoverage(
  e: EdgeMaps,
  x: number,
  y0: number,
  y1: number,
): number {
  const xi = Math.round(x);
  if (xi < 0 || xi >= e.width) return 0;
  const a = Math.max(0, Math.round(y0));
  const b = Math.min(e.height, Math.round(y1));
  if (b <= a) return 0;
  return (e.vPrefix[b * e.width + xi] - e.vPrefix[a * e.width + xi]) / (b - a);
}

/** Fraction of pixels on row `y`, columns [x0, x1), that lie on a horizontal edge. */
export function horizontalCoverage(
  e: EdgeMaps,
  y: number,
  x0: number,
  x1: number,
): number {
  const yi = Math.round(y);
  if (yi < 0 || yi >= e.height) return 0;
  const a = Math.max(0, Math.round(x0));
  const b = Math.min(e.width, Math.round(x1));
  if (b <= a) return 0;
  const base = yi * (e.width + 1);
  return (e.hPrefix[base + b] - e.hPrefix[base + a]) / (b - a);
}

/** Offset of the "flank" lines used by line-contrast queries (beyond the ±1px dilation). */
const FLANK = 3;

/**
 * Line contrast: coverage on the line minus the smaller coverage of two
 * parallel flank lines 3px to either side. A genuine border is a straight
 * line with smooth pixels on at least one side, so it keeps nearly its full
 * coverage; dense texture (item artwork) has edges everywhere, so its flanks
 * cancel it out. Double borders (outline + frame) keep one smooth flank and
 * survive.
 */
export function verticalSupport(
  e: EdgeMaps,
  x: number,
  y0: number,
  y1: number,
): number {
  const c = verticalCoverage(e, x, y0, y1);
  if (c === 0) return 0;
  const flank = Math.min(
    verticalCoverage(e, x - FLANK, y0, y1),
    verticalCoverage(e, x + FLANK, y0, y1),
  );
  return c > flank ? c - flank : 0;
}

export function horizontalSupport(
  e: EdgeMaps,
  y: number,
  x0: number,
  x1: number,
): number {
  const c = horizontalCoverage(e, y, x0, x1);
  if (c === 0) return 0;
  const flank = Math.min(
    horizontalCoverage(e, y - FLANK, x0, x1),
    horizontalCoverage(e, y + FLANK, x0, x1),
  );
  return c > flank ? c - flank : 0;
}
