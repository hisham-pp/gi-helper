/**
 * Builds the catalog of the inventory's Materials tab (everything that isn't
 * a Character Development Item):
 *
 *   src/data/other-materials.json              same shape as materials.json, plus category and region
 *   public/images/material-thumbs/<id>.webp    128² icon per item, beside the catalog's thumbnails
 *
 * Local specialties, cooking ingredients, fish and bait, forging ores, wood
 * and crafting materials, from genshin-db, with the in-game icons from
 * enka.network (or gi.yatta.moe for items it doesn't have yet). These are kept apart from materials.json so the on-device
 * recognizer (whose atlas is built from materials.json) doesn't change until
 * it learns to scan the Materials tab. Run after updating genshin-db:
 *
 *   pnpm scrape:other-materials
 */
import fs from "node:fs";
import path from "node:path";
import gdb from "genshin-db";
import materials from "../src/data/materials.json";
import { toGOODKey } from "../src/lib/good/keys";
import {
  ROOT,
  downloadFirst,
  encodeIcon,
  enkaUiUrl,
  loadSharp,
  slugify,
  yattaUiUrl,
} from "./lib/scrape-helpers";

const ICON_SIZE = 128;
const OUT_DIR = path.join(ROOT, "public", "images", "material-thumbs");
const JSON_FILE = path.join(ROOT, "src", "data", "other-materials.json");

/** Orders after every Character Development Item (materials.json orders are 1..n). */
const ORDER_OFFSET = 10_000;

type Category = "SPECIALTY" | "INGREDIENT" | "FISHING" | "CRAFTING";
const CATEGORY_ORDER: Category[] = ["SPECIALTY", "INGREDIENT", "FISHING", "CRAFTING"];

interface OtherMaterialEntry {
  /** Slug of the name; also the thumbnail file name. */
  id: string;
  name: string;
  description: string;
  type: "OTHER_MATERIAL";
  category: Category;
  /** Region of a local specialty, e.g. "Liyue". */
  region?: string;
  rarity: number;
  image: string;
  sortRank: number;
  order: number;
}

/** Which Materials-tab group an item belongs to, or null when it isn't one. */
function categoryOf(m: { typeText?: string; category?: string }): Category | null {
  const type = m.typeText ?? "";
  if (type.startsWith("Local Specialty")) return "SPECIALTY";
  if (type === "Cooking Ingredient") return "INGREDIENT";
  if (type === "Fish" || m.category === "FISH_BAIT") return "FISHING";
  if (
    type === "Forging Ore" ||
    m.category === "WOOD" ||
    type === "Lantern Rite Material" ||
    (m.category === "EXCHANGE" && type === "Material")
  ) {
    return "CRAFTING";
  }
  return null;
}

async function main() {
  const sharp = loadSharp();
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const catalogNames = new Set(materials.map((m) => m.name));
  const catalogIds = new Set(materials.map((m) => m.id));
  const catalogKeys = new Set(materials.map((m) => toGOODKey(m.name)));

  const names = gdb.materials("names", { matchCategories: true }) as string[];
  const entries: Omit<OtherMaterialEntry, "order">[] = [];
  const missing: string[] = [];
  let bytes = 0;

  for (const name of names) {
    const m = gdb.materials(name);
    if (!m || catalogNames.has(m.name)) continue;
    const category = categoryOf(m);
    if (!category) continue;

    const id = slugify(m.name);
    if (catalogIds.has(id) || catalogKeys.has(toGOODKey(m.name))) {
      throw new Error(`${m.name} clashes with a Character Development Item`);
    }

    const source = await downloadFirst([
      enkaUiUrl(m.images?.filename_icon),
      yattaUiUrl(m.images?.filename_icon),
    ]);
    if (!source) {
      missing.push(m.name);
      continue;
    }
    const icon = await encodeIcon(sharp, source, ICON_SIZE);
    fs.writeFileSync(path.join(OUT_DIR, `${id}.webp`), icon);
    bytes += icon.length;

    const region = m.typeText?.match(/^Local Specialty \((.+)\)$/)?.[1];
    entries.push({
      id,
      name: m.name,
      description: m.description ?? "",
      type: "OTHER_MATERIAL",
      category,
      ...(region ? { region } : {}),
      rarity: (m as { rarity?: number }).rarity ?? 1,
      image: `/images/material-thumbs/${id}.webp`,
      sortRank: m.sortRank ?? 0,
    });
  }

  // Grouped like the filters, then in the game's own order
  entries.sort(
    (a, b) =>
      CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category) ||
      a.sortRank - b.sortRank ||
      a.name.localeCompare(b.name, "en", { sensitivity: "base" }),
  );
  const items: OtherMaterialEntry[] = entries.map((e, i) => ({ ...e, order: ORDER_OFFSET + i + 1 }));

  const ids = new Set(items.map((m) => m.id));
  if (ids.size !== items.length) throw new Error("Two materials share an id");
  const keys = new Set(items.map((m) => toGOODKey(m.name)));
  if (keys.size !== items.length) throw new Error("Two materials share a GOOD key");

  fs.writeFileSync(JSON_FILE, `${JSON.stringify(items, null, 2)}\n`);
  const counts = CATEGORY_ORDER.map((c) => `${c.toLowerCase()} ${items.filter((m) => m.category === c).length}`);
  console.log(
    `Wrote ${items.length} materials (${counts.join(", ")}) to ${path.relative(ROOT, JSON_FILE)} and their thumbnails to ${path.relative(ROOT, OUT_DIR)} (${Math.round(bytes / 1024)} KB)`,
  );
  if (missing.length > 0) {
    console.warn(`No icon found for ${missing.length}: ${missing.join(", ")}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
