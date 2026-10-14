/**
 * Builds the playable-character list the app uses for feedback names and
 * avatars:
 *
 *   src/data/characters.json                   id, name, rarity, element (by name)
 *   public/images/character-avatars/<id>.webp  128² avatar per character
 *
 * Characters come from genshin-db. Avatars are the in-game UI_AvatarIcon_*
 * icons from enka.network (falling back to HoYoLAB's copy), resized and
 * re-encoded as WebP (~5 KB each); only the WebP is kept. Run after updating
 * genshin-db when new characters release:
 *
 *   pnpm scrape:characters
 *
 * Encoding needs sharp. It is resolved from this project or, failing that,
 * from the copy installed with Next.js.
 */
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import gdb from "genshin-db";

const AVATAR_SIZE = 128;
const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "public", "images", "character-avatars");
const JSON_FILE = path.join(ROOT, "src", "data", "characters.json");

/** Miliastra Wonderland mannequins, not story characters. */
const SKIP = new Set(["Manekin", "Manekina"]);

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

interface CharacterEntry {
  /** Slug of the name, e.g. "hu-tao"; also the avatar file name. */
  id: string;
  name: string;
  rarity: number;
  element: string;
}

type Sharp = typeof import("sharp");

function loadSharp(): Sharp {
  const local = createRequire(path.join(ROOT, "package.json"));
  try {
    return local("sharp");
  } catch {
    return createRequire(local.resolve("next/package.json"))("sharp");
  }
}

function slugify(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function download(url: string): Promise<Buffer | null> {
  try {
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT, Accept: "image/*" } });
    if (!res.ok || !res.headers.get("content-type")?.startsWith("image/")) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return null;
  }
}

async function main() {
  const sharp = loadSharp();
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const names = gdb.characters("names", { matchCategories: true }) as string[];
  const characters: CharacterEntry[] = [];
  const missing: string[] = [];
  let bytes = 0;

  for (const name of names) {
    if (SKIP.has(name)) continue;
    const character = gdb.characters(name);
    if (!character) continue;

    const id = slugify(character.name);
    const sources = [
      character.images.filename_icon &&
        `https://enka.network/ui/${character.images.filename_icon}.png`,
      character.images.mihoyo_icon,
    ].filter((url): url is string => Boolean(url));

    let source: Buffer | null = null;
    for (const url of sources) {
      source = await download(url);
      if (source) break;
    }
    if (!source) {
      missing.push(character.name);
      continue;
    }

    const avatar = await sharp(source)
      .resize(AVATAR_SIZE, AVATAR_SIZE, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .webp({ quality: 85, alphaQuality: 90, effort: 6 })
      .toBuffer();
    fs.writeFileSync(path.join(OUT_DIR, `${id}.webp`), avatar);
    bytes += avatar.length;

    characters.push({
      id,
      name: character.name,
      rarity: character.rarity,
      element: character.elementText || "None",
    });
  }

  characters.sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));

  const ids = new Set(characters.map((c) => c.id));
  if (ids.size !== characters.length) throw new Error("Two characters share an id");

  // Drop avatars of characters that left the list
  for (const file of fs.readdirSync(OUT_DIR)) {
    if (!ids.has(path.basename(file, ".webp"))) fs.rmSync(path.join(OUT_DIR, file));
  }

  fs.writeFileSync(JSON_FILE, `${JSON.stringify(characters, null, 2)}\n`);
  console.log(
    `Wrote ${characters.length} characters to ${path.relative(ROOT, JSON_FILE)} and their avatars to ${path.relative(ROOT, OUT_DIR)} (${Math.round(bytes / 1024)} KB)`,
  );
  if (missing.length > 0) {
    console.warn(`No avatar found for ${missing.length}: ${missing.join(", ")}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
