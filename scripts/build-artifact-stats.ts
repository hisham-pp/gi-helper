/**
 * Builds src/data/artifact-stats.json, the numbers the artifact detail panel
 * reader checks its readings against:
 *
 *   main       main stat value per rarity, stat and level (as the game shows it)
 *   rolls      the four (1★: two) substat roll tiers per rarity and stat
 *   subValues  every substat value the game can show, with how many rolls give it
 *
 * Taken from Genshin Optimizer's generated game data (MIT), pinned to one
 * commit. Percentages are in percent (46.6, not 0.466). Re-run when a new
 * rarity or stat appears (never so far):
 *
 *   pnpm build:artifact-stats
 */
import fs from "node:fs";
import path from "node:path";

const GO_COMMIT = "05c370688e1acb500e7eb92e1c737d48150ab595";
const SOURCE = `https://raw.githubusercontent.com/frzyc/genshin-optimizer/${GO_COMMIT}/libs/gi/stats/src/allStat_gen.json`;
const OUT = path.join(process.cwd(), "src", "data", "artifact-stats.json");

interface GoArtData {
  main: Record<string, Record<string, number[]>>;
  sub: Record<string, Record<string, number[]>>;
  subRoll: Record<string, Record<string, Record<string, number[][]>>>;
}

const isPercent = (key: string) => key.endsWith("_");
/** 0.466 → 46.6 without float noise. */
const percent = (v: number) => Math.round(v * 100_000) / 1000;

async function main() {
  const res = await fetch(SOURCE);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${SOURCE}`);
  const art = ((await res.json()) as { art: GoArtData }).art;

  const mainStats: Record<string, Record<string, number[]>> = {};
  for (const [rarity, stats] of Object.entries(art.main)) {
    mainStats[rarity] = {};
    for (const [key, values] of Object.entries(stats)) {
      mainStats[rarity][key] = values.map((v) => (isPercent(key) ? percent(v) : v));
    }
  }

  const rolls: Record<string, Record<string, number[]>> = {};
  for (const [rarity, stats] of Object.entries(art.sub)) {
    rolls[rarity] = {};
    for (const [key, tiers] of Object.entries(stats)) {
      rolls[rarity][key] = tiers.map((v) => (isPercent(key) ? percent(v) : v));
    }
  }

  // Shown value → the roll counts that can show it ("10.9": [3, 4]).
  const subValues: Record<string, Record<string, Record<string, number[]>>> = {};
  for (const [rarity, stats] of Object.entries(art.subRoll)) {
    subValues[rarity] = {};
    for (const [key, values] of Object.entries(stats)) {
      subValues[rarity][key] = {};
      for (const [shown, combos] of Object.entries(values)) {
        subValues[rarity][key][shown] = [...new Set(combos.map((c) => c.length))].sort((a, b) => a - b);
      }
    }
  }

  const out = {
    description: `Artifact main stat values and substat rolls, from Genshin Optimizer (MIT) at ${GO_COMMIT}. Built by scripts/build-artifact-stats.ts.`,
    main: mainStats,
    rolls,
    subValues,
  };
  fs.writeFileSync(OUT, JSON.stringify(out) + "\n");
  console.log(`Wrote ${path.relative(process.cwd(), OUT)} (${(fs.statSync(OUT).size / 1024).toFixed(1)} KB).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
