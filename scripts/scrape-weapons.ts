/**
 * Builds the weapon list used for weapons in GOOD files and the inventory:
 *
 *   src/data/weapons.json               id, GOOD key, name, rarity, type, max stats, passive
 *   public/images/weapons/<id>.webp     128² icon per weapon
 *
 * Weapons come from genshin-db; icons are the in-game UI_EquipIcon_* images
 * from enka.network (falling back to HoYoLAB's copy). Run after updating
 * genshin-db when new weapons release:
 *
 *   pnpm scrape:weapons
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

const ICON_SIZE = 128;
const OUT_DIR = path.join(ROOT, "public", "images", "weapons");
const JSON_FILE = path.join(ROOT, "src", "data", "weapons.json");

/** A quest-only copy of Kazuha's story sword; never in the inventory, and not a GOOD key. */
const SKIP = new Set(["Prized Isshin Blade"]);

const WEAPON_TYPES: Record<string, string> = {
  WEAPON_SWORD_ONE_HAND: "sword",
  WEAPON_CLAYMORE: "claymore",
  WEAPON_POLE: "polearm",
  WEAPON_BOW: "bow",
  WEAPON_CATALYST: "catalyst",
};

interface WeaponEntry {
  /** Slug of the name, e.g. "mistsplitter-reforged"; also the icon file name. */
  id: string;
  /** GOOD key, e.g. "MistsplitterReforged". */
  key: string;
  name: string;
  rarity: number;
  type: string;
  /** Base ATK at max level (90, or 70 for 1-2★). */
  atk: number;
  /** Secondary stat at max level, e.g. { name: "CRIT DMG", value: "44.1%" } (none on 1-2★). */
  substat?: { name: string; value: string };
  /** Name of the passive (none on 1-2★). */
  passive?: string;
}

/** Stats shown as plain numbers; every other weapon substat is a percentage. */
const FLAT_STATS = new Set(["FIGHT_PROP_ELEMENT_MASTERY"]);

function maxStats(weapon: NonNullable<ReturnType<typeof gdb.weapons>>) {
  const maxLevel = weapon.rarity <= 2 ? 70 : 90;
  const stats = weapon.rarity <= 2 ? weapon.stats(maxLevel) : weapon.stats(maxLevel, "+");
  const substat =
    weapon.mainStatType && weapon.mainStatText
      ? {
          name: weapon.mainStatText,
          value: FLAT_STATS.has(weapon.mainStatType)
            ? String(Math.round(stats.specialized))
            : `${(stats.specialized * 100).toFixed(1)}%`,
        }
      : undefined;
  return { atk: Math.round(stats.attack), substat };
}

async function main() {
  const sharp = loadSharp();
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const names = gdb.weapons("names", { matchCategories: true }) as string[];
  const weapons: WeaponEntry[] = [];
  const missing: string[] = [];
  let bytes = 0;

  for (const name of names) {
    if (SKIP.has(name)) continue;
    const weapon = gdb.weapons(name);
    if (!weapon) continue;

    const type = WEAPON_TYPES[weapon.weaponType];
    if (!type) throw new Error(`Unknown weapon type for ${name}: ${weapon.weaponType}`);

    const id = slugify(weapon.name);
    const source = await downloadFirst([
      enkaUiUrl(weapon.images.filename_icon),
      yattaUiUrl(weapon.images.filename_icon),
      weapon.images.mihoyo_icon,
      weapon.images.icon,
    ]);
    if (!source) {
      missing.push(weapon.name);
      continue;
    }

    const icon = await encodeIcon(sharp, source, ICON_SIZE);
    fs.writeFileSync(path.join(OUT_DIR, `${id}.webp`), icon);
    bytes += icon.length;

    weapons.push({
      id,
      key: toGOODKey(weapon.name),
      name: weapon.name,
      rarity: weapon.rarity,
      type,
      ...maxStats(weapon),
      ...(weapon.effectName ? { passive: weapon.effectName } : {}),
    });
  }

  weapons.sort(
    (a, b) => b.rarity - a.rarity || a.name.localeCompare(b.name, "en", { sensitivity: "base" }),
  );

  const ids = new Set(weapons.map((w) => w.id));
  if (ids.size !== weapons.length) throw new Error("Two weapons share an id");
  const keys = new Set(weapons.map((w) => w.key));
  if (keys.size !== weapons.length) throw new Error("Two weapons share a GOOD key");

  // Drop icons of weapons that left the list
  pruneDir(OUT_DIR, ids);

  fs.writeFileSync(JSON_FILE, `${JSON.stringify(weapons, null, 2)}\n`);
  console.log(
    `Wrote ${weapons.length} weapons to ${path.relative(ROOT, JSON_FILE)} and their icons to ${path.relative(ROOT, OUT_DIR)} (${Math.round(bytes / 1024)} KB)`,
  );
  if (missing.length > 0) {
    console.warn(`No icon found for ${missing.length}: ${missing.join(", ")}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
