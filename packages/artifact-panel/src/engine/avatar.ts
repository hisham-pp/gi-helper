import type { AvatarCrop } from "./capture";
import type { RgbaImage } from "@gi/grid-detector";
import type { AtlasManifest } from "@gi/image-scanner";
import { getAllCharacters } from "@/lib/characters";

export interface AvatarMatch {
  id: string;
  name: string;
  location: string;
  confidence: number;
}

/** Sample bilinear from RGBA image at normalized (u, v) in [0, 1]. */
function sampleBilinear(
  img: { width: number; height: number; data: Uint8Array | Uint8ClampedArray },
  u: number,
  v: number,
): [number, number, number, number] {
  const x = Math.max(0, Math.min(img.width - 1, u * (img.width - 1)));
  const y = Math.max(0, Math.min(img.height - 1, v * (img.height - 1)));
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = Math.min(img.width - 1, x0 + 1);
  const y1 = Math.min(img.height - 1, y0 + 1);
  const fx = x - x0;
  const fy = y - y0;

  const getPx = (px: number, py: number) => {
    const idx = (py * img.width + px) * 4;
    return [img.data[idx], img.data[idx + 1], img.data[idx + 2], img.data[idx + 3]];
  };

  const p00 = getPx(x0, y0);
  const p10 = getPx(x1, y0);
  const p01 = getPx(x0, y1);
  const p11 = getPx(x1, y1);

  const res: [number, number, number, number] = [0, 0, 0, 0];
  for (let c = 0; c < 4; c++) {
    const top = p00[c] * (1 - fx) + p10[c] * fx;
    const bot = p01[c] * (1 - fx) + p11[c] * fx;
    res[c] = top * (1 - fy) + bot * fy;
  }
  return res;
}

function pearson(a: Float32Array, b: Float32Array, mask: Uint8Array): number {
  let sumA = 0;
  let sumB = 0;
  let count = 0;
  for (let i = 0; i < a.length; i++) {
    if (!mask[Math.floor(i / 3)]) continue;
    sumA += a[i];
    sumB += b[i];
    count++;
  }
  if (count === 0) return 0;
  const meanA = sumA / count;
  const meanB = sumB / count;

  let num = 0;
  let denA = 0;
  let denB = 0;
  for (let i = 0; i < a.length; i++) {
    if (!mask[Math.floor(i / 3)]) continue;
    const da = a[i] - meanA;
    const db = b[i] - meanB;
    num += da * db;
    denA += da * da;
    denB += db * db;
  }
  const den = Math.sqrt(denA * denB);
  return den > 1e-6 ? num / den : 0;
}

const S = 32;

export interface PreparedAvatarTemplates {
  entries: { id: string; name: string; rgb: Float32Array; mask: Uint8Array }[];
}

let cachedTemplates: { hash: string; templates: PreparedAvatarTemplates } | null = null;

export function prepareAvatarTemplates(manifest: AtlasManifest, atlas: RgbaImage): PreparedAvatarTemplates {
  if (cachedTemplates && cachedTemplates.hash === manifest.hash) {
    return cachedTemplates.templates;
  }
  const entries: { id: string; name: string; rgb: Float32Array; mask: Uint8Array }[] = [];
  for (const entry of manifest.entries) {
    const col = entry.order % manifest.columns;
    const row = Math.floor(entry.order / manifest.columns);
    const tileX = col * manifest.tileSize;
    const tileY = row * manifest.tileSize;

    const rgb = new Float32Array(S * S * 3);
    const mask = new Uint8Array(S * S);
    for (let sy = 0; sy < S; sy++) {
      for (let sx = 0; sx < S; sx++) {
        const nx = (sx + 0.5) / S - 0.5;
        const ny = (sy + 0.5) / S - 0.5;
        const dist = Math.sqrt(nx * nx + ny * ny);
        if (dist > 0.44) continue;

        const u = (tileX + (sx + 0.5) * (manifest.tileSize / S)) / atlas.width;
        const v = (tileY + (sy + 0.5) * (manifest.tileSize / S)) / atlas.height;
        const [r, g, b, a] = sampleBilinear(atlas, u, v);
        if (a > 100) {
          const idx = sy * S + sx;
          mask[idx] = 1;
          rgb[idx * 3] = r;
          rgb[idx * 3 + 1] = g;
          rgb[idx * 3 + 2] = b;
        }
      }
    }
    entries.push({ id: entry.id, name: entry.name, rgb, mask });
  }
  const templates = { entries };
  cachedTemplates = { hash: manifest.hash, templates };
  return templates;
}

/** Matches a cropped small avatar from the equipped band against the avatar atlas. */
export function matchAvatarAtlas(
  avatarCrop: AvatarCrop,
  manifest: AtlasManifest,
  atlas: RgbaImage,
): AvatarMatch | null {
  const templates = prepareAvatarTemplates(manifest, atlas);
  const cropRgb = new Float32Array(S * S * 3);
  for (let sy = 0; sy < S; sy++) {
    for (let sx = 0; sx < S; sx++) {
      const u = (sx + 0.5) / S;
      const v = (sy + 0.5) / S;
      const [r, g, b] = sampleBilinear(avatarCrop, u, v);
      const idx = sy * S + sx;
      cropRgb[idx * 3] = r;
      cropRgb[idx * 3 + 1] = g;
      cropRgb[idx * 3 + 2] = b;
    }
  }

  const scores = templates.entries.map((t) => ({
    id: t.id,
    name: t.name,
    corr: pearson(cropRgb, t.rgb, t.mask),
  }));
  scores.sort((a, b) => b.corr - a.corr);

  const best = scores[0];
  if (!best || best.corr < 0.25) return null;

  const isTraveler = best.id === "aether" || best.id === "lumine";
  const char = getAllCharacters().find((c) => c.id === best.id);
  const location = isTraveler ? "Traveler" : (char?.key ?? best.name);

  return {
    id: best.id,
    name: best.name,
    location,
    confidence: Math.max(0, Math.min(1, best.corr)),
  };
}
