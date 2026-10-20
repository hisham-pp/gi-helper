/**
 * Reads the Mora count from the Genshin bag header bar.
 *
 * In Genshin Impact, Mora never appears as an inventory card in the grid:
 * it is displayed in the upper currency header bar next to a golden coin icon.
 *
 *   1. Locate the golden Mora coin cluster in the upper currency header
 *      (top 1.5%..10% of screen height, right half 45%..88% width).
 *   2. Define the pill box immediately to the right of the coin.
 *   3. Segment digit components and group the digits of the Mora count
 *      (separating them from neighbouring currency pills like Primogems).
 *   4. Classify each glyph using the canonical game digit templates
 *      with aspect-preserving area averaging and correlation.
 */
import type { PixelRect } from "../../grid-detector/types";
import type { RgbaImage } from "../../grid-detector/engine/image";
import defaultDigitTemplates from "../../../data/digit-templates.json";
import type { MoraReading } from "../types";
import { correlation, type DigitTemplates, GLYPH_H, GLYPH_W } from "./quantity";

/** Bounding box of component in pill-local coordinates. */
interface ComponentBox {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  n: number;
}

/**
 * Searches the upper currency header for the golden Mora coin icon.
 * Returns the coin center, radius and the adjacent pill bounding box,
 * or null if no Mora header is visible.
 */
export function locateMoraHeader(
  image: RgbaImage,
): {
  coin: { x: number; y: number; radius: number };
  pillBox: PixelRect;
} | null {
  const w = image.width;
  const h = image.height;
  const minY = Math.round(h * 0.015);
  const maxY = Math.round(h * 0.1);
  const minX = Math.round(w * 0.45);
  const maxX = Math.round(w * 0.88);
  const sw = maxX - minX + 1;
  const sh = maxY - minY + 1;

  const mask = new Uint8Array(sw * sh);
  let totalGold = 0;
  for (let y = 0; y < sh; y++) {
    const iy = minY + y;
    for (let x = 0; x < sw; x++) {
      const ix = minX + x;
      const idx = (iy * w + ix) * 4;
      const r = image.data[idx];
      const g = image.data[idx + 1];
      const b = image.data[idx + 2];
      // Golden Mora coin color profile
      if (r > 160 && g > 120 && g <= r && b < 110 && r - b > 60) {
        mask[y * sw + x] = 1;
        totalGold++;
      }
    }
  }

  // Minimum gold pixels needed to establish a coin icon
  if (totalGold < 15) return null;

  // Group gold pixels into connected components (allowing 2px gap across internal coin engravings)
  const label = new Int32Array(sw * sh).fill(-1);
  interface GoldComp {
    count: number;
    x0: number;
    x1: number;
    y0: number;
    y1: number;
    sumX: number;
    sumY: number;
  }
  const comps: GoldComp[] = [];

  for (let i = 0; i < mask.length; i++) {
    if (!mask[i] || label[i] >= 0) continue;
    const c: GoldComp = {
      count: 0,
      x0: maxX,
      x1: -1,
      y0: maxY,
      y1: -1,
      sumX: 0,
      sumY: 0,
    };
    label[i] = comps.length;
    const stack = [i];
    while (stack.length) {
      const p = stack.pop()!;
      const lx = p % sw;
      const ly = (p - lx) / sw;
      const gx = minX + lx;
      const gy = minY + ly;
      c.count++;
      c.sumX += gx;
      c.sumY += gy;
      if (gx < c.x0) c.x0 = gx;
      if (gx > c.x1) c.x1 = gx;
      if (gy < c.y0) c.y0 = gy;
      if (gy > c.y1) c.y1 = gy;

      for (let dy = -2; dy <= 2; dy++) {
        const ny = ly + dy;
        if (ny < 0 || ny >= sh) continue;
        for (let dx = -2; dx <= 2; dx++) {
          const nx = lx + dx;
          if (nx < 0 || nx >= sw) continue;
          const q = ny * sw + nx;
          if (mask[q] && label[q] < 0) {
            label[q] = comps.length;
            stack.push(q);
          }
        }
      }
    }
    comps.push(c);
  }

  // Find candidate coin components: compact aspect ratio and in the upper currency bar
  const candidates = comps.filter((c) => {
    if (c.count < 15) return false;
    const cw = c.x1 - c.x0 + 1;
    const ch = c.y1 - c.y0 + 1;
    if (cw < 6 || ch < 6) return false;
    const aspect = cw / ch;
    if (aspect < 0.5 || aspect > 2.0) return false;
    const cx = c.sumX / c.count;
    const cy = c.sumY / c.count;
    const normX = cx / w;
    const normY = cy / h;
    return normX >= 0.48 && normX <= 0.85 && normY >= 0.025 && normY <= 0.085;
  });

  if (candidates.length === 0) return null;

  // Largest gold cluster in the header is the Mora coin (distinguishing it from stray gold text)
  candidates.sort((a, b) => b.count - a.count);
  const best = candidates[0];

  const coinX = Math.round(best.sumX / best.count);
  const coinY = Math.round(best.sumY / best.count);
  const countRadius = Math.round(Math.sqrt(best.count / Math.PI) * 1.1);
  const boundRadius = Math.max(best.x1 - coinX, coinX - best.x0);
  const radius = Math.max(5, countRadius, boundRadius);

  const pillLeft = coinX + radius;
  const pillRight = Math.min(w - 1, coinX + Math.round(h * 0.22));
  const pillTop = Math.max(0, coinY - Math.round(radius * 1.2));
  const pillBottom = Math.min(h - 1, coinY + Math.round(radius * 1.2));

  return {
    coin: { x: coinX, y: coinY, radius },
    pillBox: {
      x: pillLeft,
      y: pillTop,
      width: pillRight - pillLeft + 1,
      height: pillBottom - pillTop + 1,
    },
  };
}

/**
 * Area-averages a component region from the ink map into GLYPH_W × GLYPH_H,
 * preserving glyph aspect ratio and centering horizontally.
 */
function normalizeGlyph(
  b: { x0: number; x1: number; y0: number; y1: number },
  ink: Float32Array,
  bandW: number,
): Float32Array {
  const out = new Float32Array(GLYPH_W * GLYPH_H);
  const gw = b.x1 - b.x0 + 1;
  const gh = b.y1 - b.y0 + 1;
  const dstW = Math.min(GLYPH_W, Math.max(1, gw * (GLYPH_H / gh)));
  const sx = gw / dstW;
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
      let s = 0;
      let wsum = 0;
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
      out[y * GLYPH_W + x] = wsum > 0 ? (s / wsum) * ((xe - xa) / sx) : 0;
    }
  }
  return out;
}

/** Reads the Mora count from the image bag header if present. */
export function readMora(
  image: RgbaImage,
  templates: DigitTemplates = defaultDigitTemplates as DigitTemplates,
): MoraReading | null {
  const header = locateMoraHeader(image);
  if (!header) return null;

  const { coin, pillBox } = header;
  const pw = pillBox.width;
  const ph = pillBox.height;
  const w = image.width;

  // Extract luminance in pillBox
  const lum = new Float32Array(pw * ph);
  let minL = 1;
  let maxL = 0;
  for (let y = 0; y < ph; y++) {
    for (let x = 0; x < pw; x++) {
      const idx = ((pillBox.y + y) * w + (pillBox.x + x)) * 4;
      const r = image.data[idx] / 255;
      const g = image.data[idx + 1] / 255;
      const b = image.data[idx + 2] / 255;
      const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      lum[y * pw + x] = l;
      if (l < minL) minL = l;
      if (l > maxL) maxL = l;
    }
  }

  const contrast = maxL - minL;
  if (contrast < 0.2 || maxL < 0.5) return null;

  // Digits are bright white/cream on a dark/translucent pill
  const thresh = Math.max(0.55, minL + contrast * 0.55);
  const mask = new Uint8Array(pw * ph);
  for (let i = 0; i < lum.length; i++) {
    mask[i] = lum[i] > thresh ? 1 : 0;
  }

  // Connected components (8-connectivity)
  const label = new Int32Array(pw * ph).fill(-1);
  const comps: ComponentBox[] = [];
  for (let i = 0; i < mask.length; i++) {
    if (!mask[i] || label[i] >= 0) continue;
    const c: ComponentBox = { x0: pw, x1: -1, y0: ph, y1: -1, n: 0 };
    label[i] = comps.length;
    const stack = [i];
    while (stack.length) {
      const p = stack.pop()!;
      const cx = p % pw;
      const cy = (p - cx) / pw;
      c.n++;
      if (cx < c.x0) c.x0 = cx;
      if (cx > c.x1) c.x1 = cx;
      if (cy < c.y0) c.y0 = cy;
      if (cy > c.y1) c.y1 = cy;
      for (let dy = -1; dy <= 1; dy++) {
        const yy = cy + dy;
        if (yy < 0 || yy >= ph) continue;
        for (let dx = -1; dx <= 1; dx++) {
          const xx = cx + dx;
          if (xx < 0 || xx >= pw) continue;
          const q = yy * pw + xx;
          if (mask[q] && label[q] < 0) {
            label[q] = comps.length;
            stack.push(q);
          }
        }
      }
    }
    if (c.n >= 3) comps.push(c);
  }

  // Filter components by height (digits span ~35%..95% of pill height)
  const digitComps = comps.filter((c) => {
    const ch = c.y1 - c.y0 + 1;
    return ch >= ph * 0.35 && ch <= ph * 0.95;
  });
  digitComps.sort((a, b) => a.x0 - b.x0);

  if (digitComps.length === 0) return null;

  // Soft ink map for correlation: 0 = background, 1 = full text ink
  const ink = new Float32Array(pw * ph);
  for (let i = 0; i < lum.length; i++) {
    ink[i] = Math.min(1, Math.max(0, (lum[i] - minL) / contrast));
  }

  // Group components belonging to the Mora pill digits:
  // Any component after a wide gap (> 0.8 * digit height) is the next pill (Primogems)
  const moraDigits: ComponentBox[] = [];
  const digitH = ph * 0.7;
  for (const c of digitComps) {
    if (moraDigits.length > 0) {
      const prev = moraDigits[moraDigits.length - 1];
      const gap = c.x0 - prev.x1;
      if (gap > digitH * 0.8) break;
    }
    moraDigits.push(c);
  }

  if (moraDigits.length === 0) return null;

  let text = "";
  let minConf = 1;

  for (const c of moraDigits) {
    const glyph = normalizeGlyph(c, ink, pw);
    let bestDigit = "?";
    let bestScore = -1;
    let runnerUp = -1;

    for (const [d, t] of Object.entries(templates.digits)) {
      const s = correlation(glyph, t);
      if (s > bestScore) {
        runnerUp = bestScore;
        bestScore = s;
        bestDigit = d;
      } else if (s > runnerUp) {
        runnerUp = s;
      }
    }

    const fit = Math.min(1, Math.max(0, (bestScore - 0.55) / 0.3));
    const margin = Math.min(1, Math.max(0, (bestScore - runnerUp) / 0.15));
    const conf = Math.sqrt(fit * margin);

    if (bestScore >= 0.45) {
      text += bestDigit;
      minConf = Math.min(minConf, conf);
    } else {
      text += "?";
      minConf = 0;
    }
  }

  const value = /^\d+$/.test(text) ? parseInt(text, 10) : null;
  const lastDigit = moraDigits[moraDigits.length - 1];
  const pillEnclosingBox: PixelRect = {
    x: coin.x - coin.radius,
    y: pillBox.y,
    width:
      lastDigit.x1 +
      pillBox.x -
      (coin.x - coin.radius) +
      Math.round(coin.radius * 0.6),
    height: ph,
  };

  return {
    value,
    text,
    coin,
    box: pillEnclosingBox,
    confidence: value === null ? 0 : Math.round(minConf * 1000) / 1000,
  };
}
