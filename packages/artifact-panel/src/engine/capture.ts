/**
 * Everything the artifact detail panel shows that can be read without OCR
 * (rarity from the stars and the header colour, the lock), and the text
 * fields cut out and cleaned up for OCR: 8-bit grayscale, dark text on
 * white, scaled so the panel is about 1000 px wide.
 *
 * Runs in the scan worker on the full-resolution screenshot or frame; the
 * fields are small, so only they cross over to the OCR.
 */
import type { PixelRect, RgbaImage } from "@gi/grid-detector";
import { boxOf, locateArtifactPanel, type PanelGeometry } from "./locate";

export interface GrayImage {
  width: number;
  height: number;
  data: Uint8Array;
}

export type PanelField = "name" | "slot" | "mainName" | "mainValue" | "level" | "stats" | "setName" | "equipped" | "refinement";

export interface AvatarCrop {
  width: number;
  height: number;
  data: Uint8Array;
}

export interface ArtifactPanelCapture {
  /** The panel, in image pixels (header to body bottom). */
  bounds: PixelRect;
  geometry: PanelGeometry;
  /** "artifact" or "weapon" */
  kind?: "artifact" | "weapon";
  /** Stars counted under the main stat (null when they can't be counted). */
  stars: number | null;
  /** Rarity told by the header bar's colour (orange 5★, purple 4★, blue 3★, green 2★, grey 1★). */
  headerRarity: number | null;
  locked: boolean;
  /** Text fields for OCR; `setName`, `refinement` and `equipped` only when found. */
  fields: Partial<Record<PanelField, GrayImage>>;
  /** Small character avatar crop in RGBA, when equipped. */
  avatar?: AvatarCrop | null;
  /** 24 × 40 grayscale thumbnail of the panel: consecutive video frames showing the same panel match it closely. */
  signature: Uint8Array;
}

/** Width the panel is scaled to for OCR. */
const OCR_PANEL_WIDTH = 1000;
/** White margin around each field (Tesseract reads text touching the edge poorly). */
const PADDING = 12;

type Rect = { x0: number; y0: number; x1: number; y1: number };

/** A field's rectangle from fractions of W: x from the panel's left edge, y from the body's top edge. */
function rel(g: PanelGeometry, x0: number, x1: number, y0: number, y1: number): Rect {
  return { x0: g.x + g.width * x0, x1: g.x + g.width * x1, y0: g.bodyTop + g.width * y0, y1: g.bodyTop + g.width * y1 };
}

/**
 * Cuts out a rectangle, scales it (bilinear) and turns it into dark text on
 * white: `light` text is taken from each pixel's darkest channel inverted
 * (white text on orange, purple or brown), `dark` text from the darkest
 * channel as is (dark grey and green text on cream). The contrast is then
 * stretched between the 2nd and 98th percentiles.
 */
export function fieldImage(image: RgbaImage, rect: Rect, scale: number, text: "light" | "dark"): GrayImage | null {
  const x0 = Math.max(0, rect.x0);
  const y0 = Math.max(0, rect.y0);
  const x1 = Math.min(image.width, rect.x1);
  const y1 = Math.min(image.height, rect.y1);
  const w = Math.round((x1 - x0) * scale);
  const h = Math.round((y1 - y0) * scale);
  if (w < 4 || h < 4) return null;
  const gray = new Float32Array(w * h);
  const { data, width: iw, height: ih } = image;
  const sample = (x: number, y: number) => {
    const i = (y * iw + x) * 4;
    return Math.min(data[i], data[i + 1], data[i + 2]);
  };
  for (let y = 0; y < h; y++) {
    const sy = Math.min(ih - 1, Math.max(0, y0 + (y + 0.5) / scale - 0.5));
    const yA = Math.floor(sy);
    const yB = Math.min(ih - 1, yA + 1);
    const fy = sy - yA;
    for (let x = 0; x < w; x++) {
      const sx = Math.min(iw - 1, Math.max(0, x0 + (x + 0.5) / scale - 0.5));
      const xA = Math.floor(sx);
      const xB = Math.min(iw - 1, xA + 1);
      const fx = sx - xA;
      const v =
        (sample(xA, yA) * (1 - fx) + sample(xB, yA) * fx) * (1 - fy) +
        (sample(xA, yB) * (1 - fx) + sample(xB, yB) * fx) * fy;
      gray[y * w + x] = text === "light" ? 255 - v : v;
    }
  }
  // Contrast stretch.
  const hist = new Uint32Array(256);
  for (let i = 0; i < gray.length; i++) hist[Math.round(gray[i])]++;
  const pct = (p: number) => {
    let acc = 0;
    const target = gray.length * p;
    for (let v = 0; v < 256; v++) {
      acc += hist[v];
      if (acc >= target) return v;
    }
    return 255;
  };
  const lo = pct(0.02);
  const hi = Math.max(lo + 1, pct(0.98));
  const out = new Uint8Array((w + 2 * PADDING) * (h + 2 * PADDING)).fill(255);
  const ow = w + 2 * PADDING;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const v = ((gray[y * w + x] - lo) / (hi - lo)) * 255;
      out[(y + PADDING) * ow + x + PADDING] = v < 0 ? 0 : v > 255 ? 255 : Math.round(v);
    }
  }
  return { width: ow, height: h + 2 * PADDING, data: out };
}

const isStarYellow = (r: number, g: number, b: number) => r >= 215 && g >= 150 && b <= 130 && r - b >= 110;
const isLockSalmon = (r: number, g: number, b: number) => r >= 195 && g >= 95 && g <= 180 && b >= 85 && b <= 170 && r - g >= 55;
const isGreen = (r: number, g: number, b: number) => g - r >= 35 && g - b >= 35 && g >= 120;

/** Stars in the row under the main stat value: the yellow span over the star pitch (0.068 W). */
function countStars(image: RgbaImage, g: PanelGeometry): number | null {
  const box = boxOf(image, rel(g, 0.03, 0.62, -0.115, -0.015), isStarYellow, Math.round(g.width * g.width * 0.0004));
  if (!box) return null;
  const n = Math.round((box.x1 - box.x0 + g.width * 0.014) / (g.width * 0.068));
  return n >= 1 && n <= 5 ? n : null;
}

/** The header bar's colour, sampled under its text. */
function headerRarity(image: RgbaImage, g: PanelGeometry): number | null {
  const y = Math.round(g.bodyTop - g.width * 0.468);
  if (y < 0) return null;
  const rs: number[] = [];
  const gs: number[] = [];
  const bs: number[] = [];
  for (let k = 0; k < 15; k++) {
    const x = Math.round(g.x + g.width * (0.1 + (0.8 * k) / 14));
    const i = (y * image.width + x) * 4;
    rs.push(image.data[i]);
    gs.push(image.data[i + 1]);
    bs.push(image.data[i + 2]);
  }
  const med = (a: number[]) => a.sort((p, q) => p - q)[7];
  const [r, gr, b] = [med(rs), med(gs), med(bs)];
  if (r - b > 80 && r > gr) return 5;
  if (b > gr + 40 && r > gr + 20) return 4;
  if (b > r + 40 && b > gr) return 3;
  if (gr > r + 25 && gr >= b) return 2;
  if (Math.max(r, gr, b) - Math.min(r, gr, b) < 30) return 1;
  return null;
}

/** The set name: the first rows with green text under the substats. */
function setNameRows(image: RgbaImage, g: PanelGeometry, from: number): { top: number; bottom: number } | null {
  const x0 = Math.round(g.x + g.width * 0.04);
  const x1 = Math.round(g.x + g.width * 0.9);
  const minGreen = Math.max(2, Math.round(g.width * 0.006));
  let top = -1;
  let bottom = -1;
  const limit = Math.min(image.height, g.bodyBottom);
  for (let y = Math.round(from); y < limit; y++) {
    let green = 0;
    for (let x = x0; x < x1; x += 2) {
      const i = (y * image.width + x) * 4;
      if (isGreen(image.data[i], image.data[i + 1], image.data[i + 2])) green++;
    }
    if (green >= minGreen) {
      if (top < 0) top = y;
      bottom = y + 1;
    } else if (top >= 0 && y - bottom > g.width * 0.012) {
      break;
    }
  }
  return top >= 0 && bottom - top >= g.width * 0.02 ? { top, bottom } : null;
}

function signatureOf(image: RgbaImage, bounds: PixelRect): Uint8Array {
  const W = 24;
  const H = 40;
  const out = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      // Mean of a 3 × 3 sample per cell: cheap and steady.
      let sum = 0;
      for (let dy = 0; dy < 3; dy++) {
        for (let dx = 0; dx < 3; dx++) {
          const sx = Math.min(image.width - 1, Math.round(bounds.x + ((x + (dx + 0.5) / 3) * bounds.width) / W));
          const sy = Math.min(image.height - 1, Math.round(bounds.y + ((y + (dy + 0.5) / 3) * bounds.height) / H));
          const i = (sy * image.width + sx) * 4;
          sum += (image.data[i] + image.data[i + 1] + image.data[i + 2]) / 3;
        }
      }
      out[y * W + x] = Math.round(sum / 9);
    }
  }
  return out;
}

/** Mean absolute difference (0–255) of two panel signatures. */
export function signatureDifference(a: Uint8Array, b: Uint8Array): number {
  if (a.length !== b.length || a.length === 0) return 255;
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += Math.abs(a[i] - b[i]);
  return sum / a.length;
}

export function cropAvatar(image: RgbaImage, rect: { x: number; y: number; width: number; height: number }): AvatarCrop | null {
  const x0 = Math.max(0, Math.round(rect.x));
  const y0 = Math.max(0, Math.round(rect.y));
  const x1 = Math.min(image.width, Math.round(rect.x + rect.width));
  const y1 = Math.min(image.height, Math.round(rect.y + rect.height));
  const w = x1 - x0;
  const h = y1 - y0;
  if (w < 8 || h < 8) return null;
  const data = new Uint8Array(w * h * 4);
  for (let y = 0; y < h; y++) {
    const srcOffset = ((y0 + y) * image.width + x0) * 4;
    const dstOffset = y * w * 4;
    data.set(image.data.subarray(srcOffset, srcOffset + w * 4), dstOffset);
  }
  return { width: w, height: h, data };
}

/** Finds the detail panel and prepares it for reading; null when there is none. */
export function captureArtifactPanel(image: RgbaImage): ArtifactPanelCapture | null {
  const g = locateArtifactPanel(image);
  if (!g) return null;
  const W = g.width;
  const scale = Math.min(3, Math.max(0.5, OCR_PANEL_WIDTH / W));
  const top = Math.max(0, Math.round(g.bodyTop - W * 0.58));
  const bottom = g.equipped?.bottom ?? g.bodyBottom;
  const bounds = { x: Math.round(g.x), y: top, width: Math.round(W), height: Math.round(bottom - top) };

  const fields: ArtifactPanelCapture["fields"] = {};
  const put = (field: PanelField, img: GrayImage | null) => {
    if (img) fields[field] = img;
  };
  put("name", fieldImage(image, rel(g, 0.04, 0.93, -0.578, -0.458), scale, "light"));
  put("slot", fieldImage(image, rel(g, 0.04, 0.62, -0.45, -0.37), scale, "light"));
  put("mainName", fieldImage(image, rel(g, 0.04, 0.58, -0.285, -0.213), scale, "light"));
  put("mainValue", fieldImage(image, rel(g, 0.04, 0.58, -0.21, -0.11), scale, "light"));
  // Inside the badge's outline (inverted, the outline would read as brackets).
  const pad = -W * 0.005;
  put(
    "level",
    fieldImage(
      image,
      { x0: g.badge.x - pad, y0: g.badge.y - pad, x1: g.badge.x + g.badge.width + pad, y1: g.badge.y + g.badge.height + pad },
      scale,
      "light",
    ),
  );
  const statsTop = g.badge.y + g.badge.height + W * 0.015;
  const set = setNameRows(image, g, statsTop + W * 0.05);
  const statsBottom = set ? set.top - W * 0.004 : Math.min(g.bodyBottom, statsTop + W * 0.4);
  put("stats", fieldImage(image, { x0: g.x + W * 0.035, x1: g.x + W * 0.97, y0: statsTop, y1: statsBottom }, scale, "dark"));
  if (set) {
    put(
      "setName",
      fieldImage(image, { x0: g.x + W * 0.035, x1: g.x + W * 0.97, y0: set.top - W * 0.012, y1: set.bottom + W * 0.012 }, scale, "dark"),
    );
  }
  const isWeapon = g.kind === "weapon";
  if (isWeapon) {
    put("refinement", fieldImage(image, { x0: g.x + W * 0.03, x1: g.x + W * 0.95, y0: g.bodyTop + W * 0.13, y1: g.bodyTop + W * 0.22 }, scale, "dark"));
  }
  let avatar: AvatarCrop | null = null;
  if (g.equipped) {
    put("equipped", fieldImage(image, { x0: g.x + W * 0.13, x1: g.x + W * 0.97, y0: g.equipped.top + W * 0.012, y1: g.equipped.bottom }, scale, "dark"));
    const H = g.equipped.bottom - g.equipped.top;
    const avatarSize = Math.min(H, W * 0.12);
    const avX = g.x + W * 0.02;
    const avY = g.equipped.top + (H - avatarSize) / 2;
    avatar = cropAvatar(image, { x: avX, y: avY, width: avatarSize, height: avatarSize });
  }

  // Locked: a salmon padlock on a dark square; unlocked: a grey one on light grey.
  const lock = boxOf(image, rel(g, 0.74, 0.99, 0.015, 0.16), isLockSalmon, Math.round(W * W * 0.0003));
  return {
    bounds,
    geometry: g,
    kind: isWeapon ? "weapon" : "artifact",
    stars: countStars(image, g),
    headerRarity: headerRarity(image, g),
    locked: lock !== null,
    fields,
    avatar,
    signature: signatureOf(image, bounds),
  };
}
