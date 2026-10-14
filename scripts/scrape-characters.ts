/**
 * Builds the playable-character list the app uses for feedback names and
 * avatars, and for the characters in GOOD files:
 *
 *   src/data/characters.json                   id, GOOD key, name, title, rarity, element, weapon type, region
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
import path from "node:path";
import gdb from "genshin-db";
import { toGOODKey } from "../src/lib/good/keys";
import {
  ROOT,
  downloadFirst,
  encodeIcon,
  enkaUiUrl,
  loadSharp,
  pruneDir,
  slugify,
  yattaUiUrl,
} from "./lib/scrape-helpers";

const AVATAR_SIZE = 128;
const OUT_DIR = path.join(ROOT, "public", "images", "character-avatars");
const JSON_FILE = path.join(ROOT, "src", "data", "characters.json");

/** Miliastra Wonderland mannequins, not story characters. */
const SKIP = new Set(["Manekin", "Manekina"]);

/** Both Travelers are "Traveler" where GOOD names who has gear equipped. */
const TRAVELERS = new Set(["Aether", "Lumine"]);

const WEAPON_TYPES: Record<string, string> = {
  WEAPON_SWORD_ONE_HAND: "sword",
  WEAPON_CLAYMORE: "claymore",
  WEAPON_POLE: "polearm",
  WEAPON_BOW: "bow",
  WEAPON_CATALYST: "catalyst",
};

interface CharacterEntry {
  /** Slug of the name, e.g. "hu-tao"; also the avatar file name. */
  id: string;
  /** GOOD key, e.g. "HuTao" ("Traveler" for Aether and Lumine). */
  key: string;
  name: string;
  /** In-game title, e.g. "Endless Solo of Solitude" (none for the Travelers). */
  title?: string;
  rarity: number;
  element: string;
  weaponType: string;
  /** Home region, e.g. "Fontaine" (none for the Travelers). */
  region?: string;
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

    const weaponType = WEAPON_TYPES[character.weaponType];
    if (!weaponType) throw new Error(`Unknown weapon type for ${name}: ${character.weaponType}`);

    const id = slugify(character.name);
    const source = await downloadFirst([
      enkaUiUrl(character.images.filename_icon),
      yattaUiUrl(character.images.filename_icon),
      character.images.mihoyo_icon,
    ]);
    if (!source) {
      missing.push(character.name);
      continue;
    }

    const avatar = await encodeIcon(sharp, source, AVATAR_SIZE);
    fs.writeFileSync(path.join(OUT_DIR, `${id}.webp`), avatar);
    bytes += avatar.length;

    characters.push({
      id,
      key: TRAVELERS.has(character.name) ? "Traveler" : toGOODKey(character.name),
      name: character.name,
      ...(character.title ? { title: character.title } : {}),
      rarity: character.rarity,
      element: character.elementText || "None",
      weaponType,
      ...(character.region ? { region: character.region } : {}),
    });
  }

  characters.sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));

  const ids = new Set(characters.map((c) => c.id));
  if (ids.size !== characters.length) throw new Error("Two characters share an id");

  // Drop avatars of characters that left the list
  pruneDir(OUT_DIR, ids);

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
