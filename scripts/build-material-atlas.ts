/**
 * Builds the reference bank used by the material recognizer:
 *
 *   public/data/material-atlas.png   every catalog icon as a 64² tile
 *   public/data/material-atlas.json  manifest (tile order, rarity, inventory order)
 *
 * Each 256² icon in public/images/materials is area-averaged (in
 * premultiplied colour, so transparent edges don't darken) to 64², the
 * width of the recognizer's fine card frame. Run after the catalog or its
 * images change:
 *
 *   pnpm build:material-atlas
 *
 * Decoding needs sharp (110 icons are WebP files named .png, which Jimp
 * cannot read). It is resolved from this project or, failing that, from
 * the copy installed with Next.js.
 */
import { createHash } from "node:crypto";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import materials from "../src/data/materials.json";
import { ATLAS_FORMAT, ATLAS_VERSION, FINE_SIZE, type AtlasManifest } from "../src/lib/material-detector/engine/bank";
import type { Rarity } from "../src/lib/material-detector/types";

const ICON_SIZE = 256;
const ROOT = process.cwd();
const IMAGES_DIR = path.join(ROOT, "public", "images", "materials");
const OUT_DIR = path.join(ROOT, "public", "data");

type Sharp = typeof import("sharp");

function loadSharp(): Sharp {
  const local = createRequire(path.join(ROOT, "package.json"));
  try {
    return local("sharp");
  } catch {
    return createRequire(local.resolve("next/package.json"))("sharp");
  }
}

async function main() {
  const sharp = loadSharp();
  const T = FINE_SIZE;
  const f = ICON_SIZE / T;
  const columns = Math.ceil(Math.sqrt(materials.length));
  const rows = Math.ceil(materials.length / columns);
  const W = columns * T;
  const atlas = Buffer.alloc(W * rows * T * 4);
  const entries: AtlasManifest["entries"] = [];

  for (const [index, m] of materials.entries()) {
    const file = path.join(IMAGES_DIR, `${m.id}.png`);
    if (!fs.existsSync(file)) throw new Error(`Missing icon for ${m.id}: ${file}`);
    const icon = await sharp(file)
      .ensureAlpha()
      .resize(ICON_SIZE, ICON_SIZE, { fit: "fill" })
      .raw()
      .toBuffer();
    const ox = (index % columns) * T;
    const oy = Math.floor(index / columns) * T;
    for (let y = 0; y < T; y++) {
      for (let x = 0; x < T; x++) {
        let r = 0, g = 0, b = 0, a = 0;
        for (let sy = y * f; sy < (y + 1) * f; sy++) {
          for (let sx = x * f; sx < (x + 1) * f; sx++) {
            const p = (sy * ICON_SIZE + sx) * 4;
            const al = icon[p + 3] / 255;
            r += icon[p] * al;
            g += icon[p + 1] * al;
            b += icon[p + 2] * al;
            a += al;
          }
        }
        const q = ((oy + y) * W + ox + x) * 4;
        if (a > 0) {
          atlas[q] = Math.round(r / a);
          atlas[q + 1] = Math.round(g / a);
          atlas[q + 2] = Math.round(b / a);
        }
        atlas[q + 3] = Math.round((a / (f * f)) * 255);
      }
    }
    entries.push({ id: m.id, name: m.name, rarity: m.rarity as Rarity, order: m.order });
  }

  const png = await sharp(atlas, { raw: { width: W, height: rows * T, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toBuffer();
  const manifest: AtlasManifest = {
    format: ATLAS_FORMAT,
    version: ATLAS_VERSION,
    hash: createHash("sha1").update(png).digest("hex").slice(0, 12),
    tileSize: T,
    columns,
    entries,
  };
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, "material-atlas.png"), png);
  fs.writeFileSync(path.join(OUT_DIR, "material-atlas.json"), JSON.stringify(manifest));
  console.log(
    `Atlas: ${entries.length} icons, ${W}×${rows * T}px, ${(png.length / 1024).toFixed(0)} KB, hash ${manifest.hash}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
