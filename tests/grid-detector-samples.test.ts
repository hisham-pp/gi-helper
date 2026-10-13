/**
 * Regression tests on the Genshin reference screenshots in
 * public/samples/grid-test (full screenshots with sidebars, detail panels and
 * cut-off rows; tight crops; a small low-resolution capture; a single card).
 *
 * Ground truth: tests/grid-detector/genshin-ground-truth.json. To add a test
 * image, drop it into public/samples/grid-test and follow the steps in
 * docs/grid-detector.md.
 */
import test, { describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Jimp } from "jimp";
import { detectInventoryGrids, type PixelRect } from "../src/lib/grid-detector";
import { allCards, matchBoxes } from "./grid-detector/metrics";
import { smoothChroma } from "./grid-detector/synthetic";

interface TruthFile {
  samples: {
    file: string;
    width: number;
    height: number;
    grids: { rows: number; columns: number; cards: number[][] }[];
  }[];
}

const truth: TruthFile = JSON.parse(
  readFileSync(new URL("./grid-detector/genshin-ground-truth.json", import.meta.url), "utf8"),
);

describe("Genshin reference screenshots", () => {
  for (const sample of truth.samples) {
    const name = sample.file.split("/").pop() as string;
    test(name, async () => {
      const img = await Jimp.read(sample.file);
      const { width, height, data } = img.bitmap;
      const result = detectInventoryGrids({ image: { width, height, data } });

      assert.equal(result.imageWidth, sample.width);
      assert.equal(result.grids.length, sample.grids.length, "grid count");
      sample.grids.forEach((g, i) => {
        assert.equal(result.grids[i].rows, g.rows, "rows");
        assert.equal(result.grids[i].columns, g.columns, "columns");
      });

      const expected: PixelRect[] = sample.grids.flatMap((g) =>
        g.cards.map(([x, y, w, h]) => ({ x, y, width: w, height: h })),
      );
      const m = matchBoxes(allCards(result), expected, 0.85);
      assert.equal(m.falseNegatives, 0, `missed ${m.falseNegatives} card(s)`);
      assert.equal(m.falsePositives, 0, `${m.falsePositives} false positive(s)`);
      // Boxes may shift by a few pixels as the engine evolves, not more.
      assert.ok(m.maxCornerError <= 6, `corner error ${m.maxCornerError}px`);
    });
  }
});

/**
 * Browsers decode JPEGs slightly differently from the Node harness (chroma
 * upsampling). The UI must find exactly the same cards, so a few demanding
 * screenshots are re-checked with emulated decoder differences.
 */
describe("robustness to JPEG decoder differences", () => {
  const picks = ["220726", "220816", "220832", "220839_1 (4)", "images.jpg"];
  for (const sample of truth.samples.filter((s) => picks.some((p) => s.file.includes(p)))) {
    test(sample.file.split("/").pop() as string, async () => {
      const img = await Jimp.read(sample.file);
      const { width, height, data } = img.bitmap;
      const result = detectInventoryGrids({ image: smoothChroma({ width, height, data }) });
      const expected: PixelRect[] = sample.grids.flatMap((g) =>
        g.cards.map(([x, y, w, h]) => ({ x, y, width: w, height: h })),
      );
      const m = matchBoxes(allCards(result), expected, 0.85);
      assert.equal(result.grids.length, sample.grids.length, "grid count");
      assert.equal(m.falseNegatives, 0, `missed ${m.falseNegatives} card(s)`);
      assert.equal(m.falsePositives, 0, `${m.falsePositives} false positive(s)`);
    });
  }
});

describe("region of interest on a real capture", () => {
  test("a two-row region of images.jpg yields exactly its 3×2 cards", async () => {
    const img = await Jimp.read("public/samples/grid-test/images.jpg");
    const { width, height, data } = img.bitmap;
    const result = detectInventoryGrids(
      { image: { width, height, data } },
      { region: { x: 4, y: 3, width: 232, height: 184 } },
    );
    assert.equal(result.grids.length, 1);
    assert.equal(result.grids[0].rows, 2);
    assert.equal(result.grids[0].columns, 3);
    assert.equal(result.totalDetectedCards, 6);
    // Coordinates stay in original-image pixels (not region-relative).
    assert.ok(result.grids[0].cards.every((c) => c.x >= 4 && c.y >= 3 && c.x + c.width <= 236));
  });
});
