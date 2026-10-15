/**
 * Builds the weapon list used for weapons in GOOD files and the inventory:
 *
 *   src/data/weapons.json                        id, GOOD key, name, rarity, type, max stats, passive
 *   public/images/weapons/<id>.webp              128² icon per weapon
 *   public/images/weapons-awakened/<id>.webp     128² icon after the second ascension
 *   public/images/weapons-alt/<id>[-awakened].webp   HoYoLAB's copy, where it differs
 *
 * Weapons come from genshin-db; icons are the in-game UI_EquipIcon_* images
 * from enka.network (falling back to HoYoLAB's copy). The bag shows the
 * awakened icon from ascension 2 on, so the scanner's weapon atlas needs both.
 * For some early weapons (the Skyward series…) enka.network has an older
 * framing of the icon while the game and HoYoLAB show it zoomed in; those
 * HoYoLAB copies are kept too, as extra references for the scanner.
 * Run after updating genshin-db when new weapons release:
 *
 *   pnpm scrape:weapons
 */
import fs from "node:fs";
import path from "node:path";
import gdb from "genshin-db";
import { toGOODKey } from "../src/lib/good/keys";
import {
  ROOT,
  download,
  downloadFirst,
  encodeIcon,
  enkaUiUrl,
  iconDifference,
  loadSharp,
  pruneDir,
  slugify,
  yattaUiUrl,
} from "./lib/scrape-helpers";

const ICON_SIZE = 128;
const OUT_DIR = path.join(ROOT, "public", "images", "weapons");
const AWAKENED_DIR = path.join(ROOT, "public", "images", "weapons-awakened");
const ALT_DIR = path.join(ROOT, "public", "images", "weapons-alt");
/** iconDifference above which HoYoLAB's copy counts as another framing. */
const ALT_DIFFERENCE = 0.03;
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
  fs.mkdirSync(AWAKENED_DIR, { recursive: true });
  fs.mkdirSync(ALT_DIR, { recursive: true });
  const altKeep = new Set<string>();
  let bytes = 0;

  /** Saves HoYoLAB's copy of an icon when it looks different from the one used. */
  const keepAlternative = async (used: Buffer, url: string | undefined, name: string) => {
    if (!url) return;
    const alt = await download(url);
    if (!alt || (await iconDifference(sharp, used, alt)) < ALT_DIFFERENCE) return;
    const icon = await encodeIcon(sharp, alt, ICON_SIZE);
    fs.writeFileSync(path.join(ALT_DIR, `${name}.webp`), icon);
    altKeep.add(name);
    bytes += icon.length;
  };

  const names = gdb.weapons("names", { matchCategories: true }) as string[];
  const weapons: WeaponEntry[] = [];
  const missing: string[] = [];
  const missingAwakened: string[] = [];
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
    await keepAlternative(source, weapon.images.mihoyo_icon, id);

    const awakened = await downloadFirst([
      enkaUiUrl(weapon.images.filename_awakenIcon),
      yattaUiUrl(weapon.images.filename_awakenIcon),
      weapon.images.mihoyo_awakenIcon,
    ]);
    if (awakened) {
      const awakenedIcon = await encodeIcon(sharp, awakened, ICON_SIZE);
      fs.writeFileSync(path.join(AWAKENED_DIR, `${id}.webp`), awakenedIcon);
      bytes += awakenedIcon.length;
      await keepAlternative(awakened, weapon.images.mihoyo_awakenIcon, `${id}-awakened`);
    } else {
      missingAwakened.push(weapon.name);
    }

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
  pruneDir(AWAKENED_DIR, ids);
  pruneDir(ALT_DIR, altKeep);

  fs.writeFileSync(JSON_FILE, `${JSON.stringify(weapons, null, 2)}\n`);
  console.log(
    `Wrote ${weapons.length} weapons to ${path.relative(ROOT, JSON_FILE)} and their icons to ${path.relative(ROOT, OUT_DIR)} (${Math.round(bytes / 1024)} KB)`,
  );
  if (missing.length > 0) {
    console.warn(`No icon found for ${missing.length}: ${missing.join(", ")}`);
  }
  if (missingAwakened.length > 0) {
    console.warn(`No awakened icon found for ${missingAwakened.length}: ${missingAwakened.join(", ")}`);
  }
  console.log(`Kept ${altKeep.size} HoYoLAB icons that differ from enka.network's in ${path.relative(ROOT, ALT_DIR)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
