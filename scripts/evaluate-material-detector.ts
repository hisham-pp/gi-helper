/**
 * Measures material recognition accuracy and speed on the labelled
 * reference screenshots (tests/material-detector/ground-truth.json).
 *
 *   pnpm eval:material-detector                # native resolution
 *   pnpm eval:material-detector --scale 0.5    # downscaled screenshots (robustness)
 *   pnpm eval:material-detector --impostors    # catalog without the true material:
 *                                              # how often a missing material is flagged
 *   pnpm eval:material-detector --jitter 0.1   # every box displaced by up to 10% of its
 *                                              # size and scaled ±5% (hand-drawn boxes)
 *   pnpm eval:material-detector --verbose      # list every wrong card
 *
 * Cards are taken from the grid detector and paired with the ground truth by
 * row/column. Times are recognition only (decoding and grid detection excluded).
 */
import { detectInventoryGrids } from "../src/lib/grid-detector";
import { recognizeMaterials } from "../src/lib/material-detector";
import { loadBank, loadImage, loadTruth, withoutMaterial } from "../tests/material-detector/fixtures";

const args = process.argv.slice(2);
const scale = args.includes("--scale") ? Number(args[args.indexOf("--scale") + 1]) : 1;
const impostors = args.includes("--impostors");
const verbose = args.includes("--verbose");
const jitter = args.includes("--jitter") ? Number(args[args.indexOf("--jitter") + 1]) : 0;

/** Deterministic pseudo-random numbers (mulberry32) so jitter runs are repeatable. */
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const random = rng(42);
const signed = () => random() * 2 - 1;
/** `--set key=value` overrides a recognition setting, e.g. `--set refineAlignment=false`. */
const overrides: Record<string, unknown> = {};
args.forEach((a, i) => {
  if (a !== "--set") return;
  const [k, v] = args[i + 1].split("=");
  overrides[k] = v === "true" ? true : v === "false" ? false : Number(v);
});

async function main() {
  const truth = loadTruth();
  const bank = await loadBank();
  let cards = 0, material = 0, rarity = 0, quantity = 0, matched = 0, uncertain = 0, unknown = 0, wrongButConfident = 0;
  let impostorFlagged = 0, impostorCards = 0;
  const confidences: { ok: boolean; c: number; e: number }[] = [];
  const margins: number[] = [];
  const marginStats = () => {
    const m = [...margins].sort((a, b) => a - b);
    return m.length ? `min ${m[0].toFixed(4)} p5 ${m[Math.floor(m.length * 0.05)].toFixed(4)} median ${m[Math.floor(m.length / 2)].toFixed(4)}` : "n/a";
  };
  const times: number[] = [];
  const failures: string[] = [];

  for (const s of truth.samples) {
    const image = await loadImage(s.file, scale);
    const detection = detectInventoryGrids({ image });
    const name = s.file.split("/").pop()!.replace("GenshinImpact_20261009_", "");

    if (impostors) {
      // Every card, recognised against a catalog that lacks its material.
      for (const grid of detection.grids) {
        for (const card of grid.cards) {
          const t = s.cards.find(([r, c]) => r === card.row && c === card.column);
          if (!t) continue;
          const result = recognizeMaterials({ image, grids: [{ ...grid, cards: [card] }] }, withoutMaterial(bank, t[2]), {
            readQuantity: false,
            useInventoryOrder: false,
            ...overrides,
          });
          const rec = result.cards[0];
          impostorCards++;
          if (rec.status !== "matched") impostorFlagged++;
          else if (verbose) failures.push(`${name} r${card.row}c${card.column} ${t[2]} → ${rec.material?.id} conf ${rec.confidence} e=${rec.material?.error}`);
        }
      }
      continue;
    }

    const grids = jitter
      ? detection.grids.map((g) => ({
          ...g,
          cards: g.cards.map((c) => {
            const k = 1 + 0.05 * signed();
            return { ...c, x: c.x + jitter * c.width * signed(), y: c.y + jitter * c.height * signed(), width: c.width * k, height: c.height * k };
          }),
        }))
      : detection.grids;
    const t0 = performance.now();
    const result = recognizeMaterials({ image, grids }, bank, overrides);
    times.push(performance.now() - t0);
    const ids = new Map(bank.entries.map((e) => [e.id, e]));

    for (const [row, column, id, qty] of s.cards) {
      const rec = result.cards.find((c) => c.row === row && c.column === column);
      cards++;
      if (!rec) {
        failures.push(`${name} r${row}c${column}: no card`);
        continue;
      }
      const okMaterial = rec.material?.id === id;
      const okRarity = rec.rarity.value === ids.get(id)!.rarity;
      const okQty = rec.quantity.value === qty;
      if (okMaterial) material++;
      if (okRarity) rarity++;
      if (okQty) quantity++;
      if (rec.status === "matched") matched++;
      else if (rec.status === "uncertain") uncertain++;
      else unknown++;
      if (!okMaterial && rec.status === "matched") wrongButConfident++;
      confidences.push({ ok: okMaterial, c: rec.confidence, e: rec.material?.error ?? 1 });
      if (okMaterial && rec.candidates[1]) margins.push(rec.candidates[1].error - rec.candidates[0].error);
      if (!okMaterial || !okRarity || !okQty || (verbose && rec.status !== "matched")) {
        const cand = rec.candidates.slice(0, 3).map((c) => `${c.id}:${c.error}`).join(" ");
        failures.push(
          `${name} r${row}c${column} [${rec.status} ${rec.confidence}] ` +
            `${okMaterial ? "" : `MATERIAL ${id} → ${rec.material?.id ?? "none"} (${cand}) `}` +
            `${okRarity ? "" : `RARITY ${ids.get(id)!.rarity} → ${rec.rarity.value} (stars ${rec.rarity.stars}, bg ${rec.rarity.background}) `}` +
            `${okQty ? "" : `QTY ${qty} → ${rec.quantity.value} ("${rec.quantity.text}")`}`,
        );
      }
    }
    if (verbose) {
      console.log(`${name} ${result.processingTimeMs}ms`, JSON.stringify(result.diagnostics.stageTimingsMs));
    }
  }

  if (impostors) {
    console.log(`\nImpostors (true material removed from the catalog), scale ${scale}`);
    console.log(`flagged as uncertain/unknown: ${impostorFlagged}/${impostorCards} (${((impostorFlagged / impostorCards) * 100).toFixed(1)}%)`);
    if (verbose) failures.forEach((f) => console.log("  " + f));
    return;
  }

  times.sort((a, b) => a - b);
  const pct = (n: number) => `${n}/${cards} (${((n / cards) * 100).toFixed(1)}%)`;
  console.log(`\nMaterial recognition — ${truth.samples.length} screenshots, ${cards} cards, scale ${scale}`);
  console.log(`material  ${pct(material)}`);
  console.log(`rarity    ${pct(rarity)}`);
  console.log(`quantity  ${pct(quantity)}`);
  console.log(`status    matched ${matched} · uncertain ${uncertain} · unknown ${unknown} · wrong-but-matched ${wrongButConfident}`);
  const correct = confidences.filter((c) => c.ok);
  if (correct.length) {
    const cs = correct.map((c) => c.c).sort((a, b) => a - b);
    const es = correct.map((c) => c.e).sort((a, b) => a - b);
    console.log(
      `correct cards: confidence min ${cs[0]} p10 ${cs[Math.floor(cs.length * 0.1)]} median ${cs[Math.floor(cs.length / 2)]} · ` +
        `error median ${es[Math.floor(es.length / 2)]} p90 ${es[Math.floor(es.length * 0.9)]} max ${es[es.length - 1]}`,
    );
  }
  console.log(`margin to runner-up (correct cards): ${marginStats()}`);
  console.log(`time per screenshot: median ${times[Math.floor(times.length / 2)].toFixed(0)}ms · max ${times[times.length - 1].toFixed(0)}ms`);
  if (failures.length) {
    console.log("\nIssues:");
    failures.forEach((f) => console.log("  " + f));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
