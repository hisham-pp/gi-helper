/**
 * Builds the reference banks used by the card recognizer, one per kind of
 * bag card:
 *
 *   public/data/material-atlas.{webp,json}   Character Development Items and the Materials tab
 *   public/data/weapon-atlas.{webp,json}     every weapon, with its base and awakened icon
 *                                            (and HoYoLAB's framing where it differs)
 *   public/data/artifact-atlas.{webp,json}   every artifact piece (set × slot)
 *   public/data/character-atlas.{webp,json}  every playable character's avatar (party setup list)
 *
 * Each icon is area-averaged (in premultiplied colour, so transparent edges
 * don't darken) to a 64² tile, the width of the recognizer's fine card
 * frame; the manifest lists the tiles in order. The atlas is lossless WebP
 * (a third smaller than PNG, same pixels wherever alpha > 0). Run after a
 * catalog or its images change:
 *
 *   pnpm build:atlases            every kind
 *   pnpm build:atlases weapon     one kind (material, weapon or artifact)
 *
 * Decoding needs sharp (110 material icons are WebP files named .png, which
 * Jimp cannot read). It is resolved from this project or, failing that, from
 * the copy installed with Next.js.
 */
import { createHash } from "node:crypto";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import artifactSets from "../src/data/artifact-sets.json";
import characters from "../src/data/characters.json";
import materials from "../src/data/materials.json";
import otherMaterials from "../src/data/other-materials.json";
import weapons from "../src/data/weapons.json";
import {
  ATLAS_FILES,
  ATLAS_FORMAT,
  ATLAS_VERSION,
  FINE_SIZE,
  type AtlasManifest,
} from "../src/lib/material-detector/engine/bank";
import { CARD_KINDS, type CardKind, type Rarity, type ReferenceEntry } from "../src/lib/material-detector/types";

const ICON_SIZE = 256;
const ROOT = process.cwd();
const IMAGES = path.join(ROOT, "public", "images");
const OUT_DIR = path.join(ROOT, "public", "data");
const SLOTS = ["flower", "plume", "sands", "goblet", "circlet"] as const;

type Sharp = typeof import("sharp");

function loadSharp(): Sharp {
  const local = createRequire(path.join(ROOT, "package.json"));
  try {
    return local("sharp");
  } catch {
    return createRequire(local.resolve("next/package.json"))("sharp");
  }
}

/** One tile to render: its manifest entry and the icon file it comes from. */
interface Source {
  entry: ReferenceEntry;
  file: string;
}

const byOrder = <T extends { order: number }>(list: T[]) => [...list].sort((a, b) => a.order - b.order);

/** The tiles of each kind, in manifest order. */
function sources(kind: CardKind): Source[] {
  switch (kind) {
    case "material":
      // Both bag tabs that show counts: Character Development Items (256² PNG
      // icons) first, then the Materials tab (128² WebP thumbnails).
      return [
        ...byOrder(materials).map((m) => ({
          entry: { id: m.id, name: m.name, rarity: m.rarity as Rarity, order: m.order },
          file: path.join(IMAGES, "materials", `${m.id}.png`),
        })),
        ...byOrder(otherMaterials).map((m) => ({
          entry: { id: m.id, name: m.name, rarity: m.rarity as Rarity, order: m.order },
          file: path.join(IMAGES, "material-thumbs", `${m.id}.webp`),
        })),
      ];
    case "weapon":
      // From the second ascension on, the bag shows the awakened icon. Where
      // HoYoLAB frames an icon differently from enka.network (weapons-alt),
      // both are references: the game shows HoYoLAB's.
      return weapons.flatMap((w, order) => {
        const entry = { id: w.id, name: w.name, rarity: w.rarity as Rarity, order };
        const tiles = [
          { variant: undefined, file: path.join(IMAGES, "weapons", `${w.id}.webp`) },
          { variant: "alt", file: path.join(IMAGES, "weapons-alt", `${w.id}.webp`) },
          { variant: "awakened", file: path.join(IMAGES, "weapons-awakened", `${w.id}.webp`) },
          { variant: "awakened-alt", file: path.join(IMAGES, "weapons-alt", `${w.id}-awakened.webp`) },
        ];
        return tiles
          .filter((t) => !t.variant || fs.existsSync(t.file))
          .map(({ variant, file }) => ({
            entry: variant ? { ...entry, id: `${w.id}~${variant}`, item: w.id, variant } : entry,
            file,
          }));
      });
    case "artifact":
      // A set's 4★ and 5★ pieces share an icon: one tile, every rarity.
      return artifactSets.flatMap((set, s) =>
        SLOTS.filter((slot) => (set.pieces as Partial<Record<string, string>>)[slot]).map((slot, k) => ({
          entry: {
            id: `${set.id}:${slot}`,
            name: (set.pieces as Record<string, string>)[slot],
            rarity: Math.max(...set.rarities) as Rarity,
            rarities: set.rarities as Rarity[],
            order: s * SLOTS.length + k,
          },
          file: path.join(IMAGES, "artifacts", `${set.id}-${slot}.webp`),
        })),
      );
    case "character":
      return characters.map((c, order) => ({
        entry: { id: c.id, name: c.name, rarity: c.rarity as Rarity, order },
        file: path.join(IMAGES, "character-avatars", `${c.id}.webp`),
      }));
  }
}

async function build(sharp: Sharp, kind: CardKind) {
  const list = sources(kind);
  const T = FINE_SIZE;
  const f = ICON_SIZE / T;
  const columns = Math.ceil(Math.sqrt(list.length));
  const rows = Math.ceil(list.length / columns);
  const W = columns * T;
  const atlas = Buffer.alloc(W * rows * T * 4);

  for (const [index, { entry, file }] of list.entries()) {
    if (!fs.existsSync(file)) throw new Error(`Missing icon for ${entry.id}: ${file}`);
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
  }

  const image = await sharp(atlas, { raw: { width: W, height: rows * T, channels: 4 } })
    .webp({ lossless: true, effort: 6 })
    .toBuffer();
  const manifest: AtlasManifest = {
    format: ATLAS_FORMAT,
    version: ATLAS_VERSION,
    kind,
    hash: createHash("sha1").update(image).digest("hex").slice(0, 12),
    tileSize: T,
    columns,
    entries: list.map((s) => s.entry),
  };
  const { manifest: manifestUrl, image: imageUrl } = ATLAS_FILES[kind];
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(ROOT, "public", imageUrl), image);
  fs.writeFileSync(path.join(ROOT, "public", manifestUrl), JSON.stringify(manifest));
  console.log(
    `${kind} atlas: ${list.length} icons, ${W}×${rows * T}px, ${(image.length / 1024).toFixed(0)} KB, hash ${manifest.hash}`,
  );
}

async function main() {
  const requested = process.argv.slice(2);
  const unknown = requested.filter((k) => !(CARD_KINDS as readonly string[]).includes(k));
  if (unknown.length > 0) throw new Error(`Unknown kind ${unknown.join(", ")}; expected ${CARD_KINDS.join(", ")}`);
  const kinds = requested.length > 0 ? (requested as CardKind[]) : [...CARD_KINDS];
  const sharp = loadSharp();
  for (const kind of kinds) await build(sharp, kind);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
