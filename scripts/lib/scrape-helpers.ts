/**
 * Shared by the genshin-db scrapers (characters, weapons, artifact sets,
 * other materials): slugs, icon downloads from enka.network (or Project
 * Amber's gi.yatta.moe, which also has the newest items) and WebP encoding
 * with sharp.
 */
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

export const ROOT = process.cwd();

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export type Sharp = typeof import("sharp");

/** sharp from this project or, failing that, the copy installed with Next.js. */
export function loadSharp(): Sharp {
  const local = createRequire(path.join(ROOT, "package.json"));
  try {
    return local("sharp");
  } catch {
    return createRequire(local.resolve("next/package.json"))("sharp");
  }
}

export function slugify(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function download(url: string): Promise<Buffer | null> {
  try {
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT, Accept: "image/*" } });
    if (!res.ok || !res.headers.get("content-type")?.startsWith("image/")) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return null;
  }
}

/** The first of `urls` that downloads (enka.network's UI icons first, then HoYoLAB's). */
export async function downloadFirst(urls: (string | undefined | null)[]): Promise<Buffer | null> {
  for (const url of urls) {
    if (!url) continue;
    const bytes = await download(url);
    if (bytes) return bytes;
  }
  return null;
}

/** enka.network serves the game's UI icons by file name. */
export function enkaUiUrl(filename: string | undefined | null): string | null {
  return filename ? `https://enka.network/ui/${filename}.png` : null;
}

/** Project Amber's copy of the game's UI icons, for items enka.network lacks. */
export function yattaUiUrl(filename: string | undefined | null): string | null {
  return filename ? `https://gi.yatta.moe/assets/UI/${filename}.png` : null;
}

/** A square WebP icon on a transparent background (~5 KB at 128²). */
export function encodeIcon(sharp: Sharp, source: Buffer, size: number): Promise<Buffer> {
  return sharp(source)
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 85, alphaQuality: 90, effort: 6 })
    .toBuffer();
}

/**
 * How different two icons look: mean absolute difference (0–1) of their
 * premultiplied RGBA at 32². Two downloads of the same icon score ~0.
 */
export async function iconDifference(sharp: Sharp, a: Buffer, b: Buffer): Promise<number> {
  const small = (img: Buffer) =>
    sharp(img).ensureAlpha().resize(32, 32, { fit: "fill" }).raw().toBuffer();
  const [pa, pb] = await Promise.all([small(a), small(b)]);
  let sum = 0;
  for (let i = 0; i < pa.length; i += 4) {
    const aa = pa[i + 3] / 255;
    const ab = pb[i + 3] / 255;
    for (let c = 0; c < 3; c++) sum += Math.abs((pa[i + c] * aa - pb[i + c] * ab) / 255);
    sum += Math.abs(aa - ab);
  }
  return sum / (pa.length);
}

/** Deletes files in `dir` whose name (without extension) isn't in `keep`. */
export function pruneDir(dir: string, keep: Set<string>): void {
  for (const file of fs.readdirSync(dir)) {
    if (!keep.has(path.parse(file).name)) fs.rmSync(path.join(dir, file));
  }
}
