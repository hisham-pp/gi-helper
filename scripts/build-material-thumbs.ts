/**
 * Builds the small icons the UI shows in lists and modals:
 *
 *   public/images/material-thumbs/<id>.webp   128² WebP per catalog material
 *
 * The 256² source icons in public/images/materials average ~40 KB but are
 * displayed at 40–64 px, so a picker or a page of cards downloaded several MB.
 * 128² covers the largest list icon (64 px) on 2x screens at ~4 KB each.
 * The originals stay for the material modal and the recognizer. Run after the
 * catalog or its images change:
 *
 *   pnpm build:material-thumbs
 *
 * Decoding needs sharp (some icons are WebP files named .png). It is resolved
 * from this project or, failing that, from the copy installed with Next.js.
 */
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import materials from "../src/data/materials.json";

const THUMB_SIZE = 128;
const ROOT = process.cwd();
const IMAGES_DIR = path.join(ROOT, "public", "images", "materials");
const OUT_DIR = path.join(ROOT, "public", "images", "material-thumbs");

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
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const expected = new Set<string>();
  let sourceBytes = 0;
  let thumbBytes = 0;

  for (const m of materials) {
    const file = path.join(IMAGES_DIR, `${m.id}.png`);
    if (!fs.existsSync(file)) throw new Error(`Missing icon for ${m.id}: ${file}`);

    const name = `${m.id}.webp`;
    expected.add(name);
    const thumb = await sharp(file)
      .resize(THUMB_SIZE, THUMB_SIZE, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp({ quality: 85, alphaQuality: 90, effort: 6 })
      .toBuffer();
    fs.writeFileSync(path.join(OUT_DIR, name), thumb);
    sourceBytes += fs.statSync(file).size;
    thumbBytes += thumb.length;
  }

  // Drop thumbnails of materials that left the catalog
  for (const name of fs.readdirSync(OUT_DIR)) {
    if (!expected.has(name)) fs.rmSync(path.join(OUT_DIR, name));
  }

  const kb = (n: number) => `${Math.round(n / 1024)} KB`;
  console.log(
    `Wrote ${expected.size} thumbnails to ${path.relative(ROOT, OUT_DIR)}: ${kb(thumbBytes)} (sources ${kb(sourceBytes)})`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
