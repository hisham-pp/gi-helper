/**
 * Deterministic synthetic inventory screenshots with exact ground truth.
 *
 * Scenes are rendered into RGBA buffers: a drifting, noisy background, optional
 * UI furniture (sidebars, panels, icons, text) and grids of rounded cards with
 * textured artwork and a quantity strip. A final light blur emulates
 * anti-aliasing/compression softness.
 */
import type { PixelRect, RgbaImage } from "../../src/lib/grid-detector";

export type Rgb = [number, number, number];

/** Small deterministic PRNG (mulberry32). */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface CardStyle {
  /** Card body colour; per-card variation is added on top. */
  color: Rgb;
  /** Corner radius as a fraction of the shorter side. */
  radius: number;
  /** Bottom strip height fraction (0 = none) and colour. */
  strip: number;
  stripColor: Rgb;
  /** Optional outline. */
  border?: { width: number; color: Rgb };
  /** Draw textured artwork inside the card. */
  artwork: boolean;
  /** Random colour variation per card (0–255). */
  variation: number;
}

export const DEFAULT_CARD_STYLE: CardStyle = {
  color: [110, 90, 170],
  radius: 0.07,
  strip: 0.18,
  stripColor: [232, 228, 218],
  artwork: true,
  variation: 50,
};

export interface GridSpec {
  x: number;
  y: number;
  cols: number;
  rows: number;
  cardW: number;
  cardH: number;
  gapX: number;
  gapY: number;
  /** Number of cards (row-major); defaults to cols × rows. */
  count?: number;
  style?: Partial<CardStyle>;
}

export interface Scene {
  width: number;
  height: number;
  seed: number;
  background: { base: Rgb; drift: number; noise: number };
  grids: GridSpec[];
  /** UI furniture that must NOT be detected as cards. */
  furniture?: ("sidebar" | "panel" | "header" | "text" | "icons")[];
}

export interface RenderedScene {
  image: RgbaImage;
  /** Ground-truth card boxes per grid, in pixels ([x, x+width) × [y, y+height)). */
  truth: PixelRect[][];
}

export function gridRects(g: GridSpec): PixelRect[] {
  const total = g.count ?? g.cols * g.rows;
  const out: PixelRect[] = [];
  for (let i = 0; i < total; i++) {
    const r = Math.floor(i / g.cols);
    const c = i % g.cols;
    out.push({
      x: Math.round(g.x + c * (g.cardW + g.gapX)),
      y: Math.round(g.y + r * (g.cardH + g.gapY)),
      width: g.cardW,
      height: g.cardH,
    });
  }
  return out;
}

class Canvas {
  readonly data: Uint8ClampedArray;
  constructor(
    readonly width: number,
    readonly height: number,
  ) {
    this.data = new Uint8ClampedArray(width * height * 4);
  }
  set(x: number, y: number, c: Rgb, alpha = 1) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return;
    const p = (y * this.width + x) * 4;
    const d = this.data;
    d[p] = d[p] * (1 - alpha) + c[0] * alpha;
    d[p + 1] = d[p + 1] * (1 - alpha) + c[1] * alpha;
    d[p + 2] = d[p + 2] * (1 - alpha) + c[2] * alpha;
    d[p + 3] = 255;
  }
  /** Rounded rectangle with 4× supersampled corners. */
  roundRect(r: PixelRect, radius: number, color: Rgb | ((x: number, y: number) => Rgb)) {
    const x0 = Math.floor(r.x);
    const y0 = Math.floor(r.y);
    const x1 = Math.ceil(r.x + r.width);
    const y1 = Math.ceil(r.y + r.height);
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        let cov = 0;
        for (let sy = 0; sy < 2; sy++) {
          for (let sx = 0; sx < 2; sx++) {
            const px = x + 0.25 + sx * 0.5;
            const py = y + 0.25 + sy * 0.5;
            if (inRoundRect(px, py, r, radius)) cov++;
          }
        }
        if (cov === 0) continue;
        const c = typeof color === "function" ? color(x, y) : color;
        this.set(x, y, c, cov / 4);
      }
    }
  }
  ellipse(cx: number, cy: number, rx: number, ry: number, color: Rgb) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const dx = (x - cx) / rx;
        const dy = (y - cy) / ry;
        if (dx * dx + dy * dy <= 1) this.set(x, y, color);
      }
    }
  }
}

function inRoundRect(px: number, py: number, r: PixelRect, radius: number): boolean {
  if (px < r.x || py < r.y || px > r.x + r.width || py > r.y + r.height) return false;
  const rx = Math.min(radius, r.width / 2);
  const cx = px < r.x + rx ? r.x + rx : px > r.x + r.width - rx ? r.x + r.width - rx : px;
  const cy = py < r.y + rx ? r.y + rx : py > r.y + r.height - rx ? r.y + r.height - rx : py;
  const dx = px - cx;
  const dy = py - cy;
  return dx * dx + dy * dy <= rx * rx;
}

const clamp = (v: number) => (v < 0 ? 0 : v > 255 ? 255 : v);
const mix = (c: Rgb, d: number): Rgb => [clamp(c[0] + d), clamp(c[1] + d), clamp(c[2] + d)];

function drawCard(cv: Canvas, rect: PixelRect, style: CardStyle, rand: () => number) {
  const v = () => (rand() - 0.5) * style.variation;
  const body: Rgb = [clamp(style.color[0] + v()), clamp(style.color[1] + v()), clamp(style.color[2] + v())];
  const radius = style.radius * Math.min(rect.width, rect.height);
  if (style.border) {
    cv.roundRect(rect, radius, style.border.color);
    const b = style.border.width;
    cv.roundRect(
      { x: rect.x + b, y: rect.y + b, width: rect.width - 2 * b, height: rect.height - 2 * b },
      Math.max(0, radius - b),
      body,
    );
  } else {
    // Gentle vertical gradient, like game rarity backgrounds.
    cv.roundRect(rect, radius, (_x, y) => mix(body, ((y - rect.y) / rect.height) * 18 - 9));
  }
  const stripH = Math.round(style.strip * rect.height);
  if (stripH > 0) {
    // The strip shares the card's rounded bottom corners.
    const strip = { x: rect.x, y: rect.y + rect.height - stripH, width: rect.width, height: stripH };
    for (let y = strip.y; y < strip.y + strip.height; y++) {
      for (let x = strip.x; x < strip.x + strip.width; x++) {
        if (inRoundRect(x + 0.5, y + 0.5, rect, radius)) cv.set(x, y, style.stripColor);
      }
    }
    // "Quantity" digits.
    const digits = 1 + Math.floor(rand() * 3);
    const dh = stripH * 0.55;
    const dw = dh * 0.5;
    const total = digits * dw * 1.3;
    for (let i = 0; i < digits; i++) {
      const dx = rect.x + rect.width / 2 - total / 2 + i * dw * 1.3;
      const dy = strip.y + (stripH - dh) / 2;
      for (let y = Math.round(dy); y < dy + dh; y++) {
        for (let x = Math.round(dx); x < dx + dw; x++) {
          const edge = x < dx + 2 || x > dx + dw - 3 || y < dy + 2 || y > dy + dh - 3;
          if (edge) cv.set(x, y, [60, 66, 80]);
        }
      }
    }
  }
  if (style.artwork) {
    const art = {
      cx: rect.x + rect.width * (0.4 + rand() * 0.2),
      cy: rect.y + (rect.height - stripH) * (0.45 + rand() * 0.1),
    };
    const blobs = 6 + Math.floor(rand() * 8);
    for (let i = 0; i < blobs; i++) {
      const rx = rect.width * (0.06 + rand() * 0.18);
      const ry = rect.height * (0.05 + rand() * 0.15);
      const ox = (rand() - 0.5) * rect.width * 0.35;
      const oy = (rand() - 0.5) * rect.height * 0.3;
      const col: Rgb = [rand() * 255, rand() * 255, rand() * 255];
      cv.ellipse(art.cx + ox, art.cy + oy, rx, ry, col);
    }
  }
}

function drawFurniture(cv: Canvas, scene: Scene, rand: () => number) {
  const { width: W, height: H } = scene;
  for (const item of scene.furniture ?? []) {
    if (item === "sidebar") {
      const sw = Math.round(W * 0.06);
      cv.roundRect({ x: Math.round(W * 0.04), y: 0, width: sw, height: H }, 0, [40, 44, 58]);
      for (let i = 0; i < 7; i++) {
        cv.ellipse(Math.round(W * 0.04) + sw / 2, H * (0.12 + i * 0.12), sw * 0.32, sw * 0.32, [200, 196, 186]);
      }
      // A selected-tab highlight: a long pill crossing the sidebar edge.
      cv.roundRect({ x: 0, y: Math.round(H * 0.36), width: Math.round(W * 0.1), height: Math.round(H * 0.07) }, H * 0.035, [226, 222, 210]);
    } else if (item === "panel") {
      const px = Math.round(W * 0.68);
      const panel = { x: px, y: Math.round(H * 0.12), width: Math.round(W * 0.26), height: Math.round(H * 0.74) };
      cv.roundRect(panel, 6, [232, 226, 214]);
      cv.roundRect({ ...panel, height: Math.round(panel.height * 0.45) }, 6, [140, 90, 190]);
      for (let i = 0; i < 8; i++) {
        const y = panel.y + panel.height * 0.52 + i * panel.height * 0.055;
        cv.roundRect({ x: panel.x + 14, y, width: panel.width * (0.5 + rand() * 0.4), height: 5 }, 2, [70, 70, 80]);
      }
    } else if (item === "header") {
      cv.roundRect({ x: Math.round(W * 0.55), y: Math.round(H * 0.02), width: Math.round(W * 0.12), height: Math.round(H * 0.06) }, H * 0.03, [30, 34, 46]);
      cv.roundRect({ x: Math.round(W * 0.7), y: Math.round(H * 0.02), width: Math.round(W * 0.16), height: Math.round(H * 0.06) }, H * 0.03, [30, 34, 46]);
    } else if (item === "text") {
      for (let i = 0; i < 40; i++) {
        const x = Math.round(W * 0.12 + i * W * 0.009);
        cv.roundRect({ x, y: Math.round(H * 0.03), width: Math.round(W * 0.006), height: Math.round(H * 0.035) }, 0, [220, 200, 150]);
      }
    } else if (item === "icons") {
      for (let i = 0; i < 12; i++) {
        cv.ellipse(W * (0.1 + rand() * 0.8), H * (0.1 + rand() * 0.8), 6 + rand() * 14, 6 + rand() * 14, [rand() * 255, rand() * 255, rand() * 255]);
      }
    }
  }
}

/** One pass of a 3×3 box blur on RGB (anti-aliasing / compression softness). */
function soften(cv: Canvas) {
  const { width: w, height: h, data } = cv;
  const tmp = new Float32Array(w * h * 3);
  for (let pass = 0; pass < 1; pass++) {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        for (let k = 0; k < 3; k++) {
          let s = 0;
          let n = 0;
          for (let dy = -1; dy <= 1; dy++) {
            const yy = y + dy;
            if (yy < 0 || yy >= h) continue;
            for (let dx = -1; dx <= 1; dx++) {
              const xx = x + dx;
              if (xx < 0 || xx >= w) continue;
              s += data[(yy * w + xx) * 4 + k];
              n++;
            }
          }
          tmp[(y * w + x) * 3 + k] = s / n;
        }
      }
    }
    for (let i = 0; i < w * h; i++) {
      data[i * 4] = tmp[i * 3];
      data[i * 4 + 1] = tmp[i * 3 + 1];
      data[i * 4 + 2] = tmp[i * 3 + 2];
    }
  }
}

export function renderScene(scene: Scene): RenderedScene {
  const rand = rng(scene.seed);
  const cv = new Canvas(scene.width, scene.height);
  const { base, drift, noise } = scene.background;
  // Low-frequency colour drift (blurred game world) + per-pixel noise.
  const f1 = 2 + rand() * 3;
  const f2 = 1 + rand() * 2;
  const ph = rand() * 6.28;
  for (let y = 0; y < scene.height; y++) {
    for (let x = 0; x < scene.width; x++) {
      const u = x / scene.width;
      const vv = y / scene.height;
      const d = drift * (Math.sin(u * f1 + ph) * 0.6 + Math.cos(vv * f2 - ph) * 0.4);
      const n = (rand() - 0.5) * noise;
      cv.set(x, y, [clamp(base[0] + d + n), clamp(base[1] + d * 0.8 + n), clamp(base[2] + d * 0.6 + n)]);
    }
  }
  drawFurniture(cv, scene, rand);
  const truth: PixelRect[][] = [];
  for (const g of scene.grids) {
    const style = { ...DEFAULT_CARD_STYLE, ...g.style };
    const rects = gridRects(g);
    for (const r of rects) drawCard(cv, r, style, rand);
    truth.push(rects);
  }
  soften(cv);
  return { image: { width: cv.width, height: cv.height, data: cv.data }, truth };
}

/** Nearest-neighbour-free box downscale by an integer factor (for resize tests). */
export function downscale(image: RgbaImage, factor: number): RgbaImage {
  const w = Math.floor(image.width / factor);
  const h = Math.floor(image.height / factor);
  const out = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      for (let k = 0; k < 4; k++) {
        let s = 0;
        for (let dy = 0; dy < factor; dy++) {
          for (let dx = 0; dx < factor; dx++) {
            s += image.data[((y * factor + dy) * image.width + (x * factor + dx)) * 4 + k];
          }
        }
        out[(y * w + x) * 4 + k] = s / (factor * factor);
      }
    }
  }
  return { width: w, height: h, data: out };
}

/**
 * Emulates a different JPEG decoder (triangular "fancy" chroma upsampling, as
 * in browsers' libjpeg-turbo) by smoothing the Cb/Cr channels. Pixel values
 * then differ by a few levels around colour edges — results must not change.
 */
export function smoothChroma(image: RgbaImage): RgbaImage {
  const { width: w, height: h, data: d } = image;
  const n = w * h;
  const Y = new Float32Array(n);
  const Cb = new Float32Array(n);
  const Cr = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const r = d[i * 4];
    const g = d[i * 4 + 1];
    const b = d[i * 4 + 2];
    Y[i] = 0.299 * r + 0.587 * g + 0.114 * b;
    Cb[i] = -0.1687 * r - 0.3313 * g + 0.5 * b;
    Cr[i] = 0.5 * r - 0.4187 * g - 0.0813 * b;
  }
  const blur = (a: Float32Array) => {
    const t = new Float32Array(n);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        t[i] = (a[x > 0 ? i - 1 : i] + 2 * a[i] + a[x < w - 1 ? i + 1 : i]) / 4;
      }
    }
    const o = new Float32Array(n);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        o[i] = (t[y > 0 ? i - w : i] + 2 * t[i] + t[y < h - 1 ? i + w : i]) / 4;
      }
    }
    return o;
  };
  const cb = blur(Cb);
  const cr = blur(Cr);
  const out = new Uint8ClampedArray(d.length);
  for (let i = 0; i < n; i++) {
    out[i * 4] = Y[i] + 1.402 * cr[i];
    out[i * 4 + 1] = Y[i] - 0.34414 * cb[i] - 0.71414 * cr[i];
    out[i * 4 + 2] = Y[i] + 1.772 * cb[i];
    out[i * 4 + 3] = 255;
  }
  return { width: w, height: h, data: out };
}
