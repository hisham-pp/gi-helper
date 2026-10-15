/**
 * Builds the artifact-set list used for artifacts in GOOD files and the
 * inventory:
 *
 *   src/data/artifact-sets.json                id, GOOD key, name, rarities, piece names, set bonuses
 *   public/images/artifacts/<id>-<slot>.webp   128² icon per piece
 *
 * Sets come from genshin-db; icons are the in-game UI_RelicIcon_* images from
 * enka.network (falling back to HoYoLAB's copy). Some sets have a single
 * piece (a circlet). Run after updating genshin-db when new sets release:
 *
 *   pnpm scrape:artifacts
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
const OUT_DIR = path.join(ROOT, "public", "images", "artifacts");
const JSON_FILE = path.join(ROOT, "src", "data", "artifact-sets.json");

const SLOTS = ["flower", "plume", "sands", "goblet", "circlet"] as const;
type Slot = (typeof SLOTS)[number];

interface ArtifactSetEntry {
  /** Slug of the name, e.g. "gladiator-s-finale"; icons are <id>-<slot>.webp. */
  id: string;
  /** GOOD setKey, e.g. "GladiatorsFinale". */
  key: string;
  name: string;
  rarities: number[];
  /** In-game name of each piece the set has. */
  pieces: Partial<Record<Slot, string>>;
  /** Set bonus text by piece count ("1" for the one-piece Prayers sets). */
  bonuses: Partial<Record<"1" | "2" | "4", string>>;
}

async function main() {
  const sharp = loadSharp();
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const names = gdb.artifacts("names", { matchCategories: true }) as string[];
  const sets: ArtifactSetEntry[] = [];
  const keep = new Set<string>();
  const missing: string[] = [];
  let bytes = 0;

  for (const name of names) {
    const set = gdb.artifacts(name);
    if (!set) continue;

    const id = slugify(set.name);
    const pieces: ArtifactSetEntry["pieces"] = {};
    const images = set.images as Record<string, string | undefined>;

    for (const slot of SLOTS) {
      const piece = set[slot] as { name: string } | undefined;
      if (!piece) continue;
      const source = await downloadFirst([
        enkaUiUrl(images[`filename_${slot}`]),
        yattaUiUrl(images[`filename_${slot}`]),
        images[`mihoyo_${slot}`],
        images[slot],
      ]);
      if (!source) {
        missing.push(`${set.name} (${slot})`);
        continue;
      }
      const icon = await encodeIcon(sharp, source, ICON_SIZE);
      fs.writeFileSync(path.join(OUT_DIR, `${id}-${slot}.webp`), icon);
      keep.add(`${id}-${slot}`);
      bytes += icon.length;
      pieces[slot] = piece.name;
    }

    sets.push({
      id,
      key: toGOODKey(set.name),
      name: set.name,
      rarities: [...set.rarityList].map(Number).sort((a, b) => a - b),
      pieces,
      bonuses: {
        ...(set.effect1Pc ? { "1": set.effect1Pc } : {}),
        ...(set.effect2Pc ? { "2": set.effect2Pc } : {}),
        ...(set.effect4Pc ? { "4": set.effect4Pc } : {}),
      },
    });
  }

  sets.sort(
    (a, b) =>
      Math.max(...b.rarities) - Math.max(...a.rarities) ||
      a.name.localeCompare(b.name, "en", { sensitivity: "base" }),
  );

  const ids = new Set(sets.map((s) => s.id));
  if (ids.size !== sets.length) throw new Error("Two artifact sets share an id");
  const keys = new Set(sets.map((s) => s.key));
  if (keys.size !== sets.length) throw new Error("Two artifact sets share a GOOD key");

  // Drop icons of pieces that left the list
  pruneDir(OUT_DIR, keep);

  fs.writeFileSync(JSON_FILE, `${JSON.stringify(sets, null, 2)}\n`);
  console.log(
    `Wrote ${sets.length} artifact sets to ${path.relative(ROOT, JSON_FILE)} and ${keep.size} piece icons to ${path.relative(ROOT, OUT_DIR)} (${Math.round(bytes / 1024)} KB)`,
  );
  if (missing.length > 0) {
    console.warn(`No icon found for ${missing.length}: ${missing.join(", ")}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
