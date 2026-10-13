/**
 * Material recognizer unit tests: synthetic cards drawn from the reference
 * bank (tests/material-detector/synthetic.ts) with known material, rarity
 * and quantity, plus the pure helpers.
 *
 * Real screenshots: tests/material-detector-samples.test.ts.
 */
import test, { describe } from "node:test";
import assert from "node:assert/strict";
import {
  aggregate,
  createReferenceBank,
  isMaterialDetectionError,
  recognizeMaterials,
  resolveRecognitionSettings,
  type CardRecognition,
} from "../src/lib/material-detector";
import { decodeInventoryOrder } from "../src/lib/material-detector/engine/context";
import { normalizeCardBox } from "../src/lib/material-detector/engine/card";
import { loadBank, withoutMaterial } from "./material-detector/fixtures";
import { renderCards } from "./material-detector/synthetic";

describe("settings", () => {
  test("defaults are complete and clamped", () => {
    const s = resolveRecognitionSettings({ shortlistSize: 1000, minConfidence: -3, candidateCount: Number.NaN });
    assert.equal(s.shortlistSize, 64);
    assert.equal(s.minConfidence, 0);
    assert.equal(s.candidateCount, 5);
    assert.equal(s.useRarity, true);
  });
});

describe("synthetic cards", () => {
  test("one card of each rarity: material, rarity and quantity", async () => {
    const bank = await loadBank();
    const specs = [
      { materialId: "firm-arrowhead", quantity: 7 },
      { materialId: "sharp-arrowhead", quantity: 260 },
      { materialId: "weathered-arrowhead", quantity: 1088 },
      { materialId: "black-crystal-horn", quantity: 19 },
      { materialId: "crown-of-insight", quantity: 3 },
    ];
    const scene = renderCards(bank, specs);
    const result = recognizeMaterials({ image: scene.image, grids: [scene.grid] }, bank);
    assert.equal(result.cards.length, specs.length);
    result.cards.forEach((card, k) => {
      const entry = bank.entries[bank.indexById.get(specs[k].materialId)!];
      assert.equal(card.material?.id, specs[k].materialId, `card ${k} material`);
      assert.equal(card.status, "matched", `card ${k} status`);
      assert.equal(card.rarity.value, entry.rarity, `card ${k} rarity`);
      assert.equal(card.rarity.stars, entry.rarity, `card ${k} stars`);
      assert.equal(card.quantity.value, specs[k].quantity, `card ${k} quantity`);
    });
    assert.equal(result.items.length, specs.length);
  });

  test("same-shape siblings are told apart (talent books, gem colours)", async () => {
    const bank = await loadBank();
    const ids = ["teachings-of-freedom", "teachings-of-resistance", "agnidus-agate-sliver", "varunada-lazurite-sliver", "shivada-jade-sliver"];
    const scene = renderCards(bank, ids.map((materialId) => ({ materialId, quantity: 5 })));
    const result = recognizeMaterials({ image: scene.image, grids: [scene.grid] }, bank, { useInventoryOrder: false });
    assert.deepEqual(result.cards.map((c) => c.material?.id), ids);
  });

  test("a 'New' badge is detected and ignored", async () => {
    const bank = await loadBank();
    const scene = renderCards(bank, [{ materialId: "guide-to-freedom", quantity: 12, newBadge: true }]);
    const card = recognizeMaterials({ image: scene.image, grids: [scene.grid] }, bank).cards[0];
    assert.equal(card.hasNewBadge, true);
    assert.equal(card.material?.id, "guide-to-freedom");
    assert.equal(card.status, "matched");
  });

  test("small cards (60 px wide) are still read", async () => {
    const bank = await loadBank();
    const scene = renderCards(bank, [{ materialId: "chaos-axis", quantity: 46 }], { cardWidth: 60 });
    const card = recognizeMaterials({ image: scene.image, grids: [scene.grid] }, bank).cards[0];
    assert.equal(card.material?.id, "chaos-axis");
    assert.equal(card.quantity.value, 46);
  });

  test("a loose box is realigned onto the card", async () => {
    const bank = await loadBank();
    const scene = renderCards(bank, [{ materialId: "philosophies-of-freedom", quantity: 2 }]);
    const exact = scene.grid.cards[0];
    // 5 px right, 4 px down, 3% too large — like a hand-drawn box.
    const loose = { ...exact, x: exact.x + 5, y: exact.y + 4, width: exact.width * 1.03, height: exact.height * 1.03 };
    const result = recognizeMaterials({ image: scene.image, grids: [{ ...scene.grid, cards: [loose] }] }, bank);
    const card = result.cards[0];
    assert.equal(card.material?.id, "philosophies-of-freedom");
    assert.equal(card.quantity.value, 2);
    assert.ok(Math.abs(card.matchedBox.x - exact.x) < 4, `matched x ${card.matchedBox.x} vs ${exact.x}`);
  });

  test("a badly placed box (12% off) is snapped back onto the card by its footer", async () => {
    const bank = await loadBank();
    const scene = renderCards(bank, [{ materialId: "chaos-axis", quantity: 63 }]);
    const exact = scene.grid.cards[0];
    const off = { ...exact, x: exact.x + exact.width * 0.12, y: exact.y + exact.height * 0.06 };
    const card = recognizeMaterials({ image: scene.image, grids: [{ ...scene.grid, cards: [off] }] }, bank).cards[0];
    assert.equal(card.material?.id, "chaos-axis");
    assert.equal(card.status, "matched");
    assert.equal(card.quantity.value, 63);
    assert.ok(Math.abs(card.matchedBox.x - exact.x) < 3 && Math.abs(card.matchedBox.y - exact.y) < 3, JSON.stringify(card.matchedBox));
  });

  test("a material missing from the catalog is not reported as matched", async () => {
    const bank = await loadBank();
    for (const id of ["operative-s-standard-pocket-watch", "teachings-of-freedom", "varunada-lazurite-sliver"]) {
      const scene = renderCards(bank, [{ materialId: id, quantity: 9 }]);
      const card = recognizeMaterials({ image: scene.image, grids: [scene.grid] }, withoutMaterial(bank, id)).cards[0];
      assert.notEqual(card.status, "matched", `${id} → ${card.material?.id} (${card.confidence})`);
    }
  });

  test("clipped cards are skipped; results map back to original pixels", async () => {
    const bank = await loadBank();
    const scene = renderCards(bank, [
      { materialId: "chaos-gear", quantity: 4 },
      { materialId: "chaos-axis", quantity: 5 },
    ]);
    const grid = { ...scene.grid, cards: scene.grid.cards.map((c, k) => ({ ...c, clipped: k === 1 })) };
    const result = recognizeMaterials({ image: scene.image, grids: [grid] }, bank);
    assert.equal(result.cards.length, 1);
    assert.deepEqual(result.cards[0].box, scene.boxes[0]);
  });
});

describe("helpers", () => {
  test("box normalisation removes a badge overhang above the card", () => {
    const fixed = normalizeCardBox({ x: 10, y: 0, width: 182, height: 230 });
    assert.equal(fixed.x, 10);
    assert.equal(fixed.width, 182);
    assert.ok(Math.abs(fixed.y - 8) < 1e-9 && Math.abs(fixed.height - 222) < 1e-9, JSON.stringify(fixed));
    // Far from the card shape: left alone.
    assert.deepEqual(normalizeCardBox({ x: 0, y: 0, width: 100, height: 300 }), { x: 0, y: 0, width: 100, height: 300 });
  });

  test("inventory order breaks near-ties only", () => {
    // Card 2 is a near-tie between order 5 (visual best) and 30; neighbours are 10 and 40.
    const near = decodeInventoryOrder(
      [
        [{ order: 10, error: 0.05 }],
        [{ order: 5, error: 0.05 }, { order: 30, error: 0.055 }],
        [{ order: 40, error: 0.05 }],
      ],
      { penalty: 0.02, window: 0.02 },
    );
    assert.deepEqual(near, [0, 1, 0]);
    // A clear visual winner keeps its place even if it breaks the order.
    const clear = decodeInventoryOrder(
      [
        [{ order: 10, error: 0.05 }],
        [{ order: 5, error: 0.05 }, { order: 30, error: 0.12 }],
        [{ order: 40, error: 0.05 }],
      ],
      { penalty: 0.02, window: 0.02 },
    );
    assert.deepEqual(clear, [0, 0, 0]);
    // Unrecognised cards break the chain.
    assert.deepEqual(decodeInventoryOrder([[{ order: 9, error: 0 }], [], [{ order: 1, error: 0 }]], { penalty: 1, window: 1 }), [0, 0, 0]);
  });

  test("aggregation merges overlapping screenshots and keeps the clearest quantity", () => {
    const card = (cardId: string, id: string, qty: number | null, qConf: number): CardRecognition => ({
      cardId,
      gridId: "g",
      row: 0,
      column: 0,
      box: { x: 0, y: 0, width: 1, height: 1 },
      matchedBox: { x: 0, y: 0, width: 1, height: 1 },
      status: "matched",
      material: { id, name: id, rarity: 2, error: 0.05, confidence: 1 },
      candidates: [],
      rarity: { value: 2, stars: 2, background: 2, confidence: 1 },
      quantity: { value: qty, text: String(qty ?? ""), confidence: qConf },
      hasNewBadge: false,
      orderAdjusted: false,
      confidence: 1,
    });
    const items = aggregate([card("a", "x", 12, 0.6), card("b", "y", 3, 1), card("c", "x", 13, 0.95), card("d", "x", null, 0)]);
    assert.equal(items.length, 2);
    const x = items.find((i) => i.materialId === "x")!;
    assert.equal(x.quantity, 13);
    assert.deepEqual(x.cardIds, ["a", "c", "d"]);
  });

  test("a malformed reference bank is rejected with a typed error", () => {
    assert.throws(
      () => createReferenceBank({ format: "nope" }, { width: 1, height: 1, data: new Uint8Array(4) }),
      (err) => isMaterialDetectionError(err) && err.code === "REFERENCES_INVALID",
    );
  });
});
