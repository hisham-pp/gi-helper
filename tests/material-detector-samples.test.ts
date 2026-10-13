/**
 * Regression tests on the labelled Genshin screenshots in
 * public/samples/test-set-01 (ground truth: tests/material-detector/ground-truth.json).
 * Cards come from the grid detector and are paired with the truth by row/column.
 *
 * To add a screenshot, see "Adding test images" in docs/material-detector.md.
 */
import test, { describe } from "node:test";
import assert from "node:assert/strict";
import { detectInventoryGrids } from "../src/lib/grid-detector";
import { recognizeMaterials } from "../src/lib/material-detector";
import { loadBank, loadImage, loadTruth, withoutMaterial } from "./material-detector/fixtures";

const truth = loadTruth();
const name = (file: string) => file.split("/").pop() as string;

describe("reference screenshots", () => {
  for (const sample of truth.samples) {
    test(name(sample.file), async () => {
      const bank = await loadBank();
      const image = await loadImage(sample.file);
      const { grids } = detectInventoryGrids({ image });
      const result = recognizeMaterials({ image, grids }, bank);
      assert.equal(result.imageWidth, sample.width);
      for (const [row, column, id, quantity] of sample.cards) {
        const at = `r${row}c${column}`;
        const card = result.cards.find((c) => c.row === row && c.column === column);
        assert.ok(card, `${at}: card missing`);
        assert.equal(card.material?.id, id, `${at} material`);
        assert.equal(card.status, "matched", `${at} status (confidence ${card.confidence})`);
        assert.equal(card.rarity.value, bank.entries[bank.indexById.get(id)!].rarity, `${at} rarity`);
        assert.equal(card.quantity.value, quantity, `${at} quantity ("${card.quantity.text}")`);
      }
      assert.equal(result.cards.length, sample.cards.length, "no extra cards");
    });
  }
});

/** Half-resolution screenshots: cards ~91 px wide, like a 720p capture. */
describe("half resolution", () => {
  for (const sample of truth.samples.filter((_, i) => i % 4 === 1)) {
    test(name(sample.file), async () => {
      const bank = await loadBank();
      const image = await loadImage(sample.file, 0.5);
      const { grids } = detectInventoryGrids({ image });
      const result = recognizeMaterials({ image, grids }, bank);
      for (const [row, column, id, quantity] of sample.cards) {
        const card = result.cards.find((c) => c.row === row && c.column === column);
        assert.equal(card?.material?.id, id, `r${row}c${column} material`);
        assert.equal(card?.quantity.value, quantity, `r${row}c${column} quantity`);
      }
    });
  }
});

/**
 * A material that is missing from the catalog (e.g. added by a game update)
 * must be flagged for review, never silently reported as its closest sibling.
 */
describe("materials missing from the catalog", () => {
  const sample = truth.samples.find((s) => s.file.includes("220816"))!;
  test(name(sample.file), async () => {
    const bank = await loadBank();
    const image = await loadImage(sample.file);
    const { grids } = detectInventoryGrids({ image });
    for (const card of grids[0].cards) {
      const t = sample.cards.find(([r, c]) => r === card.row && c === card.column)!;
      const result = recognizeMaterials({ image, grids: [{ ...grids[0], cards: [card] }] }, withoutMaterial(bank, t[2]), {
        readQuantity: false,
      });
      const rec = result.cards[0];
      assert.notEqual(rec.status, "matched", `${t[2]} was matched as ${rec.material?.id} (${rec.confidence})`);
    }
  });
});
