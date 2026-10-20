/**
 * Rarity from two independent signals:
 *
 * 1. Stars. They are drawn centred under the artwork and touch each other,
 *    so they are counted from the width of the star row, not from blobs.
 *    On the reference screenshots that width is 0.143 W for one star plus
 *    0.1565 W per extra star (±0.012 W), centred at 0.503 W — levels are
 *    ~13σ apart.
 * 2. Background colour of the artwork: 1★ grey, 2★ teal (hue 159–166°),
 *    3★ blue (210–218°), 4★ violet (244–254°), 5★ orange (31–34°).
 */
import type { PixelRect, RgbaImage } from "@gi/grid-detector";
import type { Rarity, RarityReading } from "../types";
import {
  type Alignment,
  alignedRect,
  CARD_ASPECT,
  rgbToHsv,
  sampleRect,
} from "./card";

const STAR_WIDTH = 0.143;
const STAR_PITCH = 0.1565;
/** Only the stars' widest rows: icons occasionally reach the band's top. */
const STAR_ROWS = { top: 0.735, bottom: 0.83 } as const;
const STAR_FRAME_W = 128;

const isStarPixel = (r: number, g: number, b: number) => {
  const { h, s, v } = rgbToHsv(r, g, b);
  return h >= 38 && h <= 60 && s > 0.45 && v > 0.75;
};

export interface StarReading {
  count: number;
  /** Width of the star row as a fraction of the card width. */
  extent: number;
  /** 0–1: how well the row fits the expected geometry. */
  quality: number;
}

/** Counts the stars under the artwork; null when no consistent star row is visible. */
export function readStars(
  image: RgbaImage,
  box: PixelRect,
  alignment: Alignment,
): StarReading | null {
  const W = STAR_FRAME_W;
  const H = Math.round(W * CARD_ASPECT);
  const rect = alignedRect(box, alignment);
  const top = Math.round(H * STAR_ROWS.top);
  const rows = Math.max(3, Math.round(H * STAR_ROWS.bottom) - top);
  const band = sampleRect(
    image,
    {
      x: rect.x,
      y: rect.y + (top / H) * rect.height,
      width: rect.width,
      height: (rows / H) * rect.height,
    },
    W,
    rows,
  );

  const minHits = Math.max(2, Math.round(rows * 0.15));
  const on = new Uint8Array(W);
  for (let x = 0; x < W; x++) {
    let hits = 0;
    for (let y = 0; y < rows; y++) {
      const i = y * W + x;
      if (isStarPixel(band.r[i], band.g[i], band.b[i])) hits++;
    }
    on[x] = hits >= minHits ? 1 : 0;
  }

  // Group star columns into clusters, bridging the ~1.7–5 px gaps between
  // touching stars, and keep the cluster nearest the card's centre.
  const maxGap = Math.max(2, Math.round(W * 0.07));
  const clusters: { x0: number; x1: number; filled: number }[] = [];
  for (let x = 0; x < W; x++) {
    if (!on[x]) continue;
    const last = clusters[clusters.length - 1];
    if (last && x - last.x1 <= maxGap + 1) {
      last.x1 = x;
      last.filled++;
    } else {
      clusters.push({ x0: x, x1: x, filled: 1 });
    }
  }
  if (clusters.length === 0) return null;
  const mid = W / 2;
  const best = clusters.reduce((a, c) => {
    const da = Math.abs((a.x0 + a.x1 + 1) / 2 - mid);
    const dc = Math.abs((c.x0 + c.x1 + 1) / 2 - mid);
    return dc < da ? c : a;
  });

  const extent = (best.x1 - best.x0 + 1) / W;
  const centre = (best.x0 + best.x1 + 1) / 2 / W;
  const count = Math.round((extent - STAR_WIDTH) / STAR_PITCH) + 1;
  if (count < 1 || count > 5) return null;
  const residual = Math.abs(extent - (STAR_WIDTH + (count - 1) * STAR_PITCH));
  const offCentre = Math.abs(centre - 0.503);
  const fill = best.filled / (best.x1 - best.x0 + 1);
  if (residual > 0.05 || offCentre > 0.05 || fill < 0.6) return null;
  const quality =
    Math.max(0, 1 - residual / 0.05) *
    Math.max(0, 1 - offCentre / 0.05) *
    Math.min(1, fill / 0.85);
  return { count, extent, quality };
}

/** Rarity from the artwork background colour (straight RGB, 0–1). */
export function classifyBackground(
  rgb: [number, number, number] | null,
): { rarity: Rarity; confidence: number } | null {
  if (!rgb) return null;
  const { h, s, v } = rgbToHsv(rgb[0], rgb[1], rgb[2]);
  if (v < 0.2) return null;
  // Grey: measured s 0.05–0.10; the coloured backgrounds are ≥ 0.29.
  if (s < 0.19)
    return { rarity: 1, confidence: Math.min(1, (0.19 - s) / 0.06) };
  // Hue bands with their nearest boundary for a margin-based confidence.
  const bands: { rarity: Rarity; lo: number; hi: number }[] = [
    { rarity: 5, lo: 5, hi: 75 },
    { rarity: 2, lo: 120, hi: 188 },
    { rarity: 3, lo: 188, hi: 231 },
    { rarity: 4, lo: 231, hi: 300 },
  ];
  const band = bands.find((b) => h >= b.lo && h < b.hi);
  if (!band) return null;
  const margin = Math.min(h - band.lo, band.hi - h);
  const satMargin = Math.min(1, (s - 0.19) / 0.08);
  return {
    rarity: band.rarity,
    confidence: Math.min(1, margin / 12) * satMargin,
  };
}

export function combineRarity(
  stars: StarReading | null,
  background: { rarity: Rarity; confidence: number } | null,
): RarityReading {
  const starRarity = stars ? (stars.count as Rarity) : null;
  const bgRarity = background?.rarity ?? null;
  if (starRarity && bgRarity && starRarity === bgRarity) {
    return {
      value: starRarity,
      stars: stars!.count,
      background: bgRarity,
      confidence: 0.97,
    };
  }
  if (starRarity && bgRarity) {
    // Disagreement: trust the clearer signal, but report low confidence.
    const useStars = stars!.quality >= background!.confidence;
    return {
      value: useStars ? starRarity : bgRarity,
      stars: stars!.count,
      background: bgRarity,
      confidence: 0.4,
    };
  }
  if (starRarity) {
    return {
      value: starRarity,
      stars: stars!.count,
      background: null,
      confidence: 0.6 + 0.3 * stars!.quality,
    };
  }
  if (bgRarity) {
    return {
      value: bgRarity,
      stars: null,
      background: bgRarity,
      confidence: 0.5 + 0.3 * background!.confidence,
    };
  }
  return { value: null, stars: null, background: null, confidence: 0 };
}
