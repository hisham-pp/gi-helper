/**
 * Measures the card scanner on screenshots of every bag tab it reads
 * (weapons, artifacts and the Materials tab) and of the party setup's
 * character list, posted by other players:
 * tests/online-samples, labelled in tests/online-samples/ground-truth.json.
 * Run `pnpm fetch:online-samples` first.
 *
 *   pnpm eval:card-scanner              # every labelled screenshot
 *   pnpm eval:card-scanner weapons      # only files whose name contains "weapons"
 *   pnpm eval:card-scanner --verbose    # list every wrong card
 *   pnpm eval:card-scanner --scale 0.5  # downscaled screenshots (robustness)
 *
 * Each grid's kind is detected as in the app (all three banks loaded).
 */
import fs from "node:fs";
import path from "node:path";
import { detectInventoryGrids } from "../src/lib/grid-detector";
import { recognizeCards, type CardKind } from "../src/lib/material-detector";
import { loadBank, loadImage } from "../tests/material-detector/fixtures";

const args = process.argv.slice(2);
const verbose = args.includes("--verbose");
const scale = args.includes("--scale") ? Number(args[args.indexOf("--scale") + 1]) : 1;
const filter = args.find((a, i) => !a.startsWith("--") && args[i - 1] !== "--scale");

const DIR = "tests/online-samples";

type Card = [number, number, string | null, ...(number | boolean | null)[]];
interface Truth {
  samples: { file: string; kind: CardKind; cards: Card[] }[];
}

interface Tally {
  checked: number;
  ok: number;
}
const tally = (): Tally => ({ checked: 0, ok: 0 });
const pct = (t: Tally) => (t.checked ? `${t.ok}/${t.checked} (${((100 * t.ok) / t.checked).toFixed(1)}%)` : "n/a");

async function main() {
  const truth: Truth = JSON.parse(fs.readFileSync(path.join(DIR, "ground-truth.json"), "utf8"));
  const banks = {
    material: await loadBank("material"),
    weapon: await loadBank("weapon"),
    artifact: await loadBank("artifact"),
    character: await loadBank("character"),
  };
  const byKind = new Map<CardKind, { item: Tally; matched: Tally; level: Tally; extra: Tally; locked: Tally; unknown: Tally; wrongButMatched: number; missing: number }>();
  const failures: string[] = [];
  let kindsOk = 0;
  let grids = 0;
  const times: number[] = [];

  for (const s of truth.samples) {
    if (filter && !s.file.includes(filter)) continue;
    const file = path.join(DIR, "files", s.file);
    if (!fs.existsSync(file)) {
      console.warn(`missing ${s.file}: run pnpm fetch:online-samples`);
      continue;
    }
    const image = await loadImage(file, scale);
    const detection = detectInventoryGrids({ image });
    const t0 = performance.now();
    const result = recognizeCards({ image, grids: detection.grids }, banks);
    times.push(performance.now() - t0);
    for (const g of result.grids) {
      grids++;
      if (g.kind === s.kind) kindsOk++;
      else failures.push(`${s.file} grid ${g.gridId}: kind ${g.kind} (${g.source}), expected ${s.kind}`);
    }
    let k = byKind.get(s.kind);
    if (!k) {
      k = { item: tally(), matched: tally(), level: tally(), extra: tally(), locked: tally(), unknown: tally(), wrongButMatched: 0, missing: 0 };
      byKind.set(s.kind, k);
    }
    for (const [row, column, item, a, b, locked] of s.cards) {
      const card = result.cards.find((c) => c.row === row && c.column === column);
      const where = `${s.file} r${row}c${column}`;
      if (!card) {
        k.missing++;
        failures.push(`${where}: card not found`);
        continue;
      }
      if (item === "?") continue;
      if (item === null) {
        // Must not be identified (ores, artifact EXP items).
        k.unknown.checked++;
        if (card.status === "unknown") k.unknown.ok++;
        else failures.push(`${where}: expected unknown, got ${card.material?.id} (${card.status})`);
        continue;
      }
      k.item.checked++;
      k.matched.checked++;
      const right = card.material?.id === item;
      if (right) k.item.ok++;
      if (card.status === "matched") k.matched.ok++;
      if (!right) {
        if (card.status === "matched") k.wrongButMatched++;
        failures.push(`${where}: ${card.material?.id ?? "-"} (${card.status} ${card.confidence}), expected ${item}`);
      }
      // Level (weapons, artifacts) or quantity (materials).
      const value = s.kind === "material" ? card.quantity.value : (card.level?.value ?? null);
      if (a !== null && a !== undefined) {
        k.level.checked++;
        if (value === a) k.level.ok++;
        else failures.push(`${where}: ${s.kind === "material" ? "quantity" : "level"} ${value}, expected ${a}`);
      }
      // Refinement (weapons) or rarity (artifacts).
      if ((s.kind === "weapon" || s.kind === "artifact") && b !== null && b !== undefined) {
        const got = s.kind === "weapon" ? (card.refinement?.value ?? null) : card.rarity.value;
        k.extra.checked++;
        if (got === b) k.extra.ok++;
        else failures.push(`${where}: ${s.kind === "weapon" ? "refinement" : "rarity"} ${got}, expected ${b}`);
      }
      if ((s.kind === "weapon" || s.kind === "artifact") && typeof locked === "boolean") {
        k.locked.checked++;
        if (card.locked === locked) k.locked.ok++;
        else failures.push(`${where}: locked ${card.locked}, expected ${locked}`);
      }
    }
  }

  console.log(`Card scanner — online samples, scale ${scale}`);
  console.log(`grid kind  ${kindsOk}/${grids}`);
  for (const [kind, k] of byKind) {
    console.log(`\n${kind}`);
    console.log(`  item       ${pct(k.item)} · wrong-but-matched ${k.wrongButMatched} · cards not found ${k.missing}`);
    console.log(`  matched    ${pct(k.matched)} (the rest is flagged for review)`);
    console.log(`  ${kind === "material" ? "quantity" : "level   "}   ${pct(k.level)}`);
    if (kind === "weapon" || kind === "artifact") {
      console.log(`  ${kind === "weapon" ? "refinement" : "rarity    "} ${pct(k.extra)}`);
      console.log(`  lock       ${pct(k.locked)}`);
    }
    if (k.unknown.checked) console.log(`  not items  ${pct(k.unknown)} left unidentified`);
  }
  const sorted = [...times].sort((a, b) => a - b);
  if (sorted.length) {
    console.log(`\ntime per screenshot: median ${sorted[sorted.length >> 1].toFixed(0)}ms · max ${sorted[sorted.length - 1].toFixed(0)}ms`);
  }
  if (verbose && failures.length) console.log(`\n${failures.join("\n")}`);
  else if (failures.length) console.log(`\n${failures.length} discrepancies (--verbose to list)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
