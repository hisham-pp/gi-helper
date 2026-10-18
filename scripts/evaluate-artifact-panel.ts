/**
 * Measures the artifact detail panel scanner on screenshots and crops:
 * tests/online-samples, labelled in tests/online-samples/ground-truth.json.
 * Run `pnpm fetch:online-samples` first.
 *
 *   pnpm eval:artifact-panel              # every labelled panel
 *   pnpm eval:artifact-panel adepti       # only files matching "adepti"
 *   pnpm eval:artifact-panel --verbose    # show reading details
 */
import fs from "node:fs";
import path from "node:path";
import { captureArtifactPanel } from "../src/lib/artifact-panel/engine/capture";
import { readArtifactPanel, type PanelSubstat } from "../src/lib/artifact-panel/read";
import { createTesseractOcr } from "../src/lib/artifact-panel/ocr";
import { loadImage } from "../tests/material-detector/fixtures";

const args = process.argv.slice(2);
const verbose = args.includes("--verbose");
const filter = args.find((a) => !a.startsWith("--"));

const DIR = "tests/online-samples";

interface SubstatTruth {
  key: string;
  value: number;
}

interface PanelTruth {
  setId: string;
  slot: string;
  rarity: number;
  level: number;
  locked: boolean;
  mainStatKey: string;
  mainStatValue: number;
  substats: SubstatTruth[];
  location: string;
}

interface TruthSample {
  file: string;
  panel?: PanelTruth;
}

interface Tally {
  checked: number;
  ok: number;
}
const tally = (): Tally => ({ checked: 0, ok: 0 });
const pct = (t: Tally) => (t.checked ? `${t.ok}/${t.checked} (${((100 * t.ok) / t.checked).toFixed(1)}%)` : "n/a");

function compareSubstats(actual: PanelSubstat[], expected: SubstatTruth[]): boolean {
  if (actual.length !== expected.length) return false;
  return expected.every((exp) => {
    const act = actual.find((a) => a.key === exp.key);
    return act && Math.abs(act.value - exp.value) < 0.05;
  });
}

async function main() {
  const truthPath = path.join(DIR, "ground-truth.json");
  const truth: { samples: TruthSample[] } = JSON.parse(fs.readFileSync(truthPath, "utf8"));
  const panelSamples = truth.samples.filter((s) => s.panel && (!filter || s.file.includes(filter)));

  if (panelSamples.length === 0) {
    console.log("No panel samples found matching filter:", filter ?? "(all)");
    return;
  }

  const ocr = createTesseractOcr({
    langPath: () => path.resolve("public/ocr"),
  });

  const tallies = {
    detected: tally(),
    set: tally(),
    slot: tally(),
    rarity: tally(),
    level: tally(),
    locked: tally(),
    mainStatKey: tally(),
    mainStatValue: tally(),
    substats: tally(),
    location: tally(),
    cleanIssues: tally(),
  };

  const times: number[] = [];
  const failures: string[] = [];

  for (const s of panelSamples) {
    const file = path.join(DIR, "files", s.file);
    if (!fs.existsSync(file)) {
      console.warn(`missing ${s.file}: run pnpm fetch:online-samples`);
      continue;
    }

    const t0 = performance.now();
    const image = await loadImage(file);
    const capture = captureArtifactPanel(image);
    tallies.detected.checked++;

    if (!capture) {
      failures.push(`${s.file}: panel not detected`);
      continue;
    }
    tallies.detected.ok++;

    const reading = await readArtifactPanel(capture, ocr);
    times.push(performance.now() - t0);

    if (!reading) {
      failures.push(`${s.file}: reading returned null`);
      continue;
    }

    const exp = s.panel!;

    // Set
    tallies.set.checked++;
    if (reading.setId === exp.setId) tallies.set.ok++;
    else failures.push(`${s.file} set: expected ${exp.setId}, got ${reading.setId}`);

    // Slot
    tallies.slot.checked++;
    if (reading.slot === exp.slot) tallies.slot.ok++;
    else failures.push(`${s.file} slot: expected ${exp.slot}, got ${reading.slot}`);

    // Rarity
    tallies.rarity.checked++;
    if (reading.rarity === exp.rarity) tallies.rarity.ok++;
    else failures.push(`${s.file} rarity: expected ${exp.rarity}, got ${reading.rarity}`);

    // Level
    tallies.level.checked++;
    if (reading.level === exp.level) tallies.level.ok++;
    else failures.push(`${s.file} level: expected ${exp.level}, got ${reading.level}`);

    // Lock
    tallies.locked.checked++;
    if (reading.locked === exp.locked) tallies.locked.ok++;
    else failures.push(`${s.file} lock: expected ${exp.locked}, got ${reading.locked}`);

    // Main Stat Key
    tallies.mainStatKey.checked++;
    if (reading.mainStatKey === exp.mainStatKey) tallies.mainStatKey.ok++;
    else failures.push(`${s.file} mainStatKey: expected ${exp.mainStatKey}, got ${reading.mainStatKey}`);

    // Main Stat Value
    tallies.mainStatValue.checked++;
    if (reading.mainStatValue !== null && Math.abs(reading.mainStatValue - exp.mainStatValue) < 0.1) {
      tallies.mainStatValue.ok++;
    } else {
      failures.push(`${s.file} mainStatValue: expected ${exp.mainStatValue}, got ${reading.mainStatValue}`);
    }

    // Substats
    tallies.substats.checked++;
    if (compareSubstats(reading.substats, exp.substats)) {
      tallies.substats.ok++;
    } else {
      failures.push(
        `${s.file} substats: expected ${JSON.stringify(exp.substats)}, got ${JSON.stringify(reading.substats)}`,
      );
    }

    // Location
    tallies.location.checked++;
    if (reading.location === exp.location) tallies.location.ok++;
    else failures.push(`${s.file} location: expected "${exp.location}", got "${reading.location}"`);

    // Zero false issues
    tallies.cleanIssues.checked++;
    if (reading.issues.length === 0) tallies.cleanIssues.ok++;
    else failures.push(`${s.file} unexpected issues: ${reading.issues.join("; ")}`);

    if (verbose) {
      console.log(`\n${s.file}:`);
      console.log(`  ${reading.rarity}★ ${reading.setId}:${reading.slot} +${reading.level}`);
      console.log(`  Main: ${reading.mainStatKey} ${reading.mainStatValue}`);
      console.log(`  Substats: ${reading.substats.map((sub) => `${sub.key} ${sub.value}`).join(", ")}`);
      if (reading.location) console.log(`  Equipped: ${reading.location}`);
      if (reading.issues.length) console.log(`  Issues: ${reading.issues.join(", ")}`);
    }
  }

  await ocr.dispose();

  console.log(`\nArtifact detail panel — online samples (${tallies.detected.checked} evaluated)`);
  console.log(`  panel detected  ${pct(tallies.detected)}`);
  console.log(`  set             ${pct(tallies.set)}`);
  console.log(`  slot            ${pct(tallies.slot)}`);
  console.log(`  rarity          ${pct(tallies.rarity)}`);
  console.log(`  level           ${pct(tallies.level)}`);
  console.log(`  lock            ${pct(tallies.locked)}`);
  console.log(`  main stat key   ${pct(tallies.mainStatKey)}`);
  console.log(`  main stat value ${pct(tallies.mainStatValue)}`);
  console.log(`  substats        ${pct(tallies.substats)}`);
  console.log(`  equipped        ${pct(tallies.location)}`);
  console.log(`  zero issues     ${pct(tallies.cleanIssues)}`);

  if (times.length > 0) {
    const sorted = [...times].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    const max = sorted[sorted.length - 1];
    console.log(`\ntime per panel: median ${Math.round(median)}ms · max ${Math.round(max)}ms`);
  }

  if (failures.length > 0) {
    console.log(`\nFailures (${failures.length}):`);
    failures.forEach((f) => console.log(`  - ${f}`));
    process.exitCode = 1;
  } else {
    console.log("\nAll artifact panel evaluations passed with 100% accuracy!");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
