/**
 * Builds src/data/names-zh.json: the Simplified Chinese names of every
 * artifact set, artifact piece and character in our data, so the artifact
 * detail panel reader (src/lib/artifact-panel/) can read a Chinese game
 * client too. Names come from genshin-db, looked up by the English names in
 * artifact-sets.json and characters.json. Run after those change (it is part
 * of `pnpm sync-data`):
 *
 *   pnpm build:panel-names
 */
import fs from "node:fs";
import path from "node:path";
import gdb from "genshin-db";
import artifactSets from "../src/data/artifact-sets.json";
import characters from "../src/data/characters.json";

const OUT = path.join(process.cwd(), "src", "data", "names-zh.json");
const SLOTS = ["flower", "plume", "sands", "goblet", "circlet"] as const;
const zh = { resultLanguage: gdb.Languages.ChineseSimplified };

function main() {
  const sets: Record<string, string> = {};
  const pieces: Record<string, Partial<Record<(typeof SLOTS)[number], string>>> = {};
  const missing: string[] = [];
  for (const set of artifactSets as { id: string; name: string }[]) {
    const found = gdb.artifacts(set.name, zh) as unknown as Record<string, { name?: string } | string | undefined> | undefined;
    if (!found || typeof found.name !== "string") {
      missing.push(set.name);
      continue;
    }
    sets[set.id] = found.name;
    const own: Partial<Record<(typeof SLOTS)[number], string>> = {};
    for (const slot of SLOTS) {
      const piece = found[slot];
      if (piece && typeof piece === "object" && piece.name) own[slot] = piece.name;
    }
    pieces[set.id] = own;
  }

  const names: Record<string, string> = {};
  for (const c of characters as { id: string; name: string }[]) {
    const found = gdb.characters(c.name, zh) as unknown as { name?: string } | undefined;
    if (found?.name) names[c.id] = found.name;
    else missing.push(c.name);
  }

  const out = {
    description: "Simplified Chinese names of artifact sets, pieces and characters, from genshin-db. Built by scripts/build-panel-names.ts.",
    sets,
    pieces,
    characters: names,
  };
  fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + "\n");
  console.log(`Wrote ${path.relative(process.cwd(), OUT)}: ${Object.keys(sets).length} sets, ${Object.keys(names).length} characters.`);
  if (missing.length > 0) console.warn(`No Chinese name for: ${missing.join(", ")}`);
}

main();
