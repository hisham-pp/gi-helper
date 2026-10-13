/**
 * Measures grid detection accuracy and speed.
 *
 *   pnpm eval:grid-detector            # reference screenshots + synthetic suite
 *   pnpm eval:grid-detector --real     # reference screenshots only
 *
 * Precision/recall use one-to-one IoU matching (IoU ≥ 0.85 for real samples,
 * ≥ 0.7 for synthetic scenes). Time is detection only (image decoding by the
 * test harness is excluded); in the browser, decoding happens in the worker.
 */
import { readFileSync } from "node:fs";
import { Jimp } from "jimp";
import { detectInventoryGrids, type PixelRect } from "../src/lib/grid-detector";
import { allCards, matchBoxes, type MatchReport } from "../tests/grid-detector/metrics";
import { renderScene, type Scene } from "../tests/grid-detector/synthetic";

interface Row {
  name: string;
  report: MatchReport;
  ms: number;
}

function summarize(title: string, rows: Row[]) {
  const tp = rows.reduce((s, r) => s + r.report.truePositives, 0);
  const fp = rows.reduce((s, r) => s + r.report.falsePositives, 0);
  const fn = rows.reduce((s, r) => s + r.report.falseNegatives, 0);
  const ious = rows.filter((r) => r.report.truePositives > 0);
  const meanIoU = ious.reduce((s, r) => s + r.report.meanIoU * r.report.truePositives, 0) / Math.max(1, tp);
  const times = rows.map((r) => r.ms).sort((a, b) => a - b);
  const median = times[Math.floor(times.length / 2)] ?? 0;
  console.log(`\n${title}`);
  console.log("─".repeat(title.length));
  for (const r of rows) {
    console.log(
      `${r.name.padEnd(44)} P=${r.report.precision.toFixed(3)} R=${r.report.recall.toFixed(3)} ` +
        `IoU=${r.report.meanIoU.toFixed(3)} maxCorner=${r.report.maxCornerError}px ${r.ms.toFixed(0)}ms`,
    );
  }
  console.log(
    `TOTAL ${rows.length} images · ${tp + fn} cards · precision ${(tp / Math.max(1, tp + fp)).toFixed(4)} · ` +
      `recall ${(tp / Math.max(1, tp + fn)).toFixed(4)} · mean IoU ${meanIoU.toFixed(4)} · ` +
      `median ${median.toFixed(0)}ms · max ${times[times.length - 1]?.toFixed(0)}ms`,
  );
}

async function evaluateReal(): Promise<Row[]> {
  const truth = JSON.parse(readFileSync("tests/grid-detector/genshin-ground-truth.json", "utf8")) as {
    samples: { file: string; grids: { cards: number[][] }[] }[];
  };
  const rows: Row[] = [];
  for (const s of truth.samples) {
    const img = await Jimp.read(s.file);
    const { width, height, data } = img.bitmap;
    const t0 = performance.now();
    const result = detectInventoryGrids({ image: { width, height, data } });
    const ms = performance.now() - t0;
    const expected: PixelRect[] = s.grids.flatMap((g) => g.cards.map(([x, y, w, h]) => ({ x, y, width: w, height: h })));
    rows.push({ name: s.file.split("/").pop() as string, report: matchBoxes(allCards(result), expected, 0.85), ms });
  }
  return rows;
}

const bg = (base: [number, number, number], drift = 25, noise = 6) => ({ base, drift, noise });
const SYNTHETIC: Record<string, Scene> = {
  regular: { width: 900, height: 560, seed: 1, background: bg([70, 90, 100]), grids: [{ x: 40, y: 30, cols: 7, rows: 4, cardW: 92, cardH: 112, gapX: 16, gapY: 18 }] },
  partialRow: { width: 800, height: 600, seed: 2, background: bg([50, 60, 80], 20), grids: [{ x: 60, y: 50, cols: 6, rows: 3, cardW: 96, cardH: 120, gapX: 20, gapY: 24, count: 14 }] },
  smallSquare: { width: 760, height: 520, seed: 3, background: bg([90, 80, 70], 30, 8), grids: [{ x: 30, y: 40, cols: 10, rows: 6, cardW: 54, cardH: 54, gapX: 12, gapY: 14, style: { strip: 0.25 } }] },
  multiGrid: {
    width: 1200,
    height: 700,
    seed: 4,
    background: bg([60, 70, 80]),
    grids: [
      { x: 40, y: 60, cols: 4, rows: 3, cardW: 90, cardH: 110, gapX: 14, gapY: 16 },
      { x: 620, y: 120, cols: 3, rows: 2, cardW: 140, cardH: 140, gapX: 24, gapY: 24, style: { color: [60, 140, 90], strip: 0 } },
    ],
  },
  uiChrome: { width: 1400, height: 640, seed: 5, background: bg([60, 75, 85], 30), furniture: ["sidebar", "panel", "header", "text"], grids: [{ x: 180, y: 90, cols: 6, rows: 4, cardW: 100, cardH: 122, gapX: 18, gapY: 20 }] },
  lowContrast: {
    width: 900,
    height: 600,
    seed: 6,
    background: bg([80, 90, 105], 10, 5),
    grids: [{ x: 50, y: 50, cols: 6, rows: 3, cardW: 110, cardH: 130, gapX: 18, gapY: 20, style: { color: [96, 106, 122], variation: 6, strip: 0.15, stripColor: [110, 118, 130] } }],
  },
  roundCorners: { width: 900, height: 520, seed: 7, background: bg([40, 45, 60], 20), grids: [{ x: 40, y: 40, cols: 6, rows: 3, cardW: 110, cardH: 120, gapX: 20, gapY: 30, style: { radius: 0.18 } }] },
  doubleBorder: {
    width: 900,
    height: 600,
    seed: 8,
    background: bg([30, 30, 36], 10, 4),
    grids: [{ x: 50, y: 60, cols: 7, rows: 4, cardW: 96, cardH: 96, gapX: 8, gapY: 8, style: { border: { width: 3, color: [180, 150, 90] }, strip: 0, color: [50, 50, 60], variation: 10 } }],
  },
  noGrid: { width: 900, height: 600, seed: 9, background: bg([70, 80, 90], 40, 10), furniture: ["icons", "text", "header"], grids: [] },
  large4k: { width: 3840, height: 2160, seed: 12, background: bg([50, 60, 75]), furniture: ["sidebar", "panel"], grids: [{ x: 500, y: 260, cols: 8, rows: 5, cardW: 250, cardH: 300, gapX: 40, gapY: 44 }] },
};

function evaluateSynthetic(): Row[] {
  return Object.entries(SYNTHETIC).map(([name, scene]) => {
    const { image, truth } = renderScene(scene);
    const t0 = performance.now();
    const result = detectInventoryGrids({ image });
    const ms = performance.now() - t0;
    return { name, report: matchBoxes(allCards(result), truth.flat(), 0.7), ms };
  });
}

async function main() {
  const realOnly = process.argv.includes("--real");
  summarize("Reference screenshots (public/samples/grid-test)", await evaluateReal());
  if (!realOnly) summarize("Synthetic scenes (exact ground truth)", evaluateSynthetic());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
