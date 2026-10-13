/**
 * Stage 1 — Image validation & normalization.
 *
 * Converts an RGBA pixel buffer (any resolution) into a planar float image at
 * "analysis scale". All later stages work in analysis pixels; the scale and
 * offset recorded here are what map results back to original-image pixels.
 */
import { GridDetectionError } from "./errors";
import type { PixelRect } from "../types";

/** Minimal RGBA buffer contract — satisfied by browser `ImageData` and Jimp bitmaps. */
export interface RgbaImage {
  width: number;
  height: number;
  data: Uint8ClampedArray | Uint8Array;
}

/** Planar RGB float image used by the analysis stages. */
export interface PlanarImage {
  width: number;
  height: number;
  r: Float32Array;
  g: Float32Array;
  b: Float32Array;
}

/**
 * Describes how analysis pixels relate to the original image:
 *   originalX = region.x + analysisX / scaleX
 */
export interface CoordinateFrame {
  /** Original (source) image size in pixels. */
  sourceWidth: number;
  sourceHeight: number;
  /** Region of the source image that the analysis image depicts. */
  region: PixelRect;
  scaleX: number;
  scaleY: number;
}

export const MIN_IMAGE_SIDE = 16;
export const MAX_IMAGE_SIDE = 16384;
export const MAX_IMAGE_PIXELS = 80_000_000;

export function validateRgbaImage(image: RgbaImage): void {
  const { width, height, data } = image;
  if (
    !Number.isInteger(width) ||
    !Number.isInteger(height) ||
    width <= 0 ||
    height <= 0
  ) {
    throw new GridDetectionError(
      "INVALID_IMAGE",
      "The image has invalid dimensions.",
    );
  }
  if (width < MIN_IMAGE_SIDE || height < MIN_IMAGE_SIDE) {
    throw new GridDetectionError(
      "IMAGE_TOO_SMALL",
      `The image is too small (${width}×${height}px). Minimum is ${MIN_IMAGE_SIDE}px per side.`,
    );
  }
  if (
    width > MAX_IMAGE_SIDE ||
    height > MAX_IMAGE_SIDE ||
    width * height > MAX_IMAGE_PIXELS
  ) {
    throw new GridDetectionError(
      "IMAGE_TOO_LARGE",
      `The image is too large (${width}×${height}px).`,
    );
  }
  if (!data || data.length < width * height * 4) {
    throw new GridDetectionError(
      "INVALID_IMAGE",
      "The image pixel data is incomplete or corrupt.",
    );
  }
}

/**
 * Builds per-destination-index sampling weights for area-average resampling
 * of one axis. Each destination pixel covers `[i*f, (i+1)*f)` source pixels;
 * partially covered source pixels contribute proportionally.
 */
function buildAxisWeights(
  srcStart: number,
  srcLength: number,
  dstLength: number,
): { index: Int32Array; weight: Float32Array; offsets: Int32Array } {
  const f = srcLength / dstLength;
  const offsets = new Int32Array(dstLength + 1);
  const idx: number[] = [];
  const wts: number[] = [];
  for (let i = 0; i < dstLength; i++) {
    offsets[i] = idx.length;
    const a = i * f;
    const b = (i + 1) * f;
    const first = Math.floor(a);
    const last = Math.min(Math.ceil(b), srcLength) - 1;
    let total = 0;
    const startLen = idx.length;
    for (let s = first; s <= last; s++) {
      const w = Math.min(b, s + 1) - Math.max(a, s);
      if (w <= 0) continue;
      idx.push(srcStart + s);
      wts.push(w);
      total += w;
    }
    for (let k = startLen; k < idx.length; k++) wts[k] /= total || 1;
  }
  offsets[dstLength] = idx.length;
  return {
    index: Int32Array.from(idx),
    weight: Float32Array.from(wts),
    offsets,
  };
}

/**
 * Area-average resample of `region` of `src` into a `dstW × dstH` planar image.
 * Separable (horizontal then vertical) so cost is O(srcPixels + dstPixels).
 */
export function resampleToPlanar(
  src: RgbaImage,
  region: PixelRect,
  dstW: number,
  dstH: number,
): PlanarImage {
  const sw = src.width;
  const data = src.data;
  const xs = buildAxisWeights(region.x, region.width, dstW);
  const ys = buildAxisWeights(region.y, region.height, dstH);

  // Horizontal pass: region rows × dstW columns.
  const rows = region.height;
  const tr = new Float32Array(rows * dstW);
  const tg = new Float32Array(rows * dstW);
  const tb = new Float32Array(rows * dstW);
  for (let ry = 0; ry < rows; ry++) {
    const rowBase = (region.y + ry) * sw;
    const outBase = ry * dstW;
    for (let dx = 0; dx < dstW; dx++) {
      let r = 0,
        g = 0,
        b = 0;
      for (let k = xs.offsets[dx]; k < xs.offsets[dx + 1]; k++) {
        const p = (rowBase + xs.index[k]) * 4;
        const w = xs.weight[k];
        r += data[p] * w;
        g += data[p + 1] * w;
        b += data[p + 2] * w;
      }
      tr[outBase + dx] = r;
      tg[outBase + dx] = g;
      tb[outBase + dx] = b;
    }
  }

  // Vertical pass.
  const n = dstW * dstH;
  const r = new Float32Array(n);
  const g = new Float32Array(n);
  const b = new Float32Array(n);
  for (let dy = 0; dy < dstH; dy++) {
    const outBase = dy * dstW;
    for (let k = ys.offsets[dy]; k < ys.offsets[dy + 1]; k++) {
      const srcRow = (ys.index[k] - region.y) * dstW;
      const w = ys.weight[k];
      for (let dx = 0; dx < dstW; dx++) {
        r[outBase + dx] += tr[srcRow + dx] * w;
        g[outBase + dx] += tg[srcRow + dx] * w;
        b[outBase + dx] += tb[srcRow + dx] * w;
      }
    }
  }
  return { width: dstW, height: dstH, r, g, b };
}

/** In-place separable box blur with radius 1 (3-tap), clamped at borders. */
function boxBlur3(
  plane: Float32Array,
  w: number,
  h: number,
  tmp: Float32Array,
) {
  for (let y = 0; y < h; y++) {
    const base = y * w;
    for (let x = 0; x < w; x++) {
      const l = plane[base + (x > 0 ? x - 1 : x)];
      const c = plane[base + x];
      const r = plane[base + (x < w - 1 ? x + 1 : x)];
      tmp[base + x] = (l + c + r) / 3;
    }
  }
  for (let y = 0; y < h; y++) {
    const up = (y > 0 ? y - 1 : y) * w;
    const mid = y * w;
    const down = (y < h - 1 ? y + 1 : y) * w;
    for (let x = 0; x < w; x++) {
      plane[mid + x] = (tmp[up + x] + tmp[mid + x] + tmp[down + x]) / 3;
    }
  }
}

/**
 * Noise reduction: two passes of a 3×3 box blur approximate a small Gaussian
 * (σ ≈ 1.15px). This suppresses JPEG block noise and anti-aliasing jitter
 * while keeping card borders sharp enough to localise to ±1 analysis pixel.
 */
export function denoise(img: PlanarImage): void {
  const tmp = new Float32Array(img.width * img.height);
  for (const plane of [img.r, img.g, img.b]) {
    boxBlur3(plane, img.width, img.height, tmp);
    boxBlur3(plane, img.width, img.height, tmp);
  }
}

/**
 * Chooses the analysis resolution. Large screenshots are downscaled so the
 * longer side is at most `maxSide`; small images are never upscaled (that adds
 * no information, only cost).
 */
export function computeAnalysisSize(
  regionW: number,
  regionH: number,
  maxSide: number,
): { width: number; height: number; scale: number } {
  const longest = Math.max(regionW, regionH);
  const scale = longest > maxSide ? maxSide / longest : 1;
  return {
    width: Math.max(1, Math.round(regionW * scale)),
    height: Math.max(1, Math.round(regionH * scale)),
    scale,
  };
}
