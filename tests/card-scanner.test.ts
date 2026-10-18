/**
 * The card scanner beyond Character Development Items: which bag tab a grid
 * shows, weapons ("Lv. 90", refinement, lock, awakened icons), artifacts
 * ("+20", set and slot, rarity) and the party setup's characters ("Lv. 90",
 * no stars), on synthetic cards and, when downloaded
 * (`pnpm fetch:online-samples`), on players' screenshots labelled in
 * tests/online-samples/ground-truth.json.
 */
import test, { describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { detectInventoryGrids } from "../src/lib/grid-detector";
import { recognizeCards, decideGridKinds, type CardKind } from "../src/lib/material-detector";
import { IDENTITY_ALIGNMENT } from "../src/lib/material-detector/engine/card";
import { type DigitTemplates, readFooter } from "../src/lib/material-detector/engine/quantity";
import digitTemplates from "../src/data/digit-templates.json";
import { loadBank, loadImage, loadTruth } from "./material-detector/fixtures";
import { renderCards } from "./material-detector/synthetic";

const digits = digitTemplates as DigitTemplates;
const allBanks = async () => ({
  material: await loadBank("material"),
  weapon: await loadBank("weapon"),
  artifact: await loadBank("artifact"),
  character: await loadBank("character"),
});

describe("footer text", () => {
  test("reads a count, a weapon level and an artifact level with their prefix", async () => {
    const bank = await loadBank("material");
    const cases: [string, "" | "Lv" | "+", number][] = [
      ["123", "", 123],
      ["Lv. 90", "Lv", 90],
      ["Lv. 1", "Lv", 1],
      ["+20", "+", 20],
      ["+0", "+", 0],
    ];
    for (const [footer, prefix, value] of cases) {
      const scene = renderCards(bank, [{ materialId: "chaos-gear", quantity: 0, footer }]);
      const read = readFooter(scene.image, scene.boxes[0], IDENTITY_ALIGNMENT, digits);
      assert.equal(read.prefix, prefix, `"${footer}" prefix`);
      assert.equal(read.value, value, `"${footer}" value`);
    }
  });
});

describe("grid kind", () => {
  test("told by the text under the cards, without any reference bank", async () => {
    const weapons = await loadBank("weapon");
    const scenes: [CardKind, ReturnType<typeof renderCards>][] = [
      ["weapon", renderCards(weapons, ["amos-bow", "the-catch", "dull-blade"].map((id) => ({ materialId: id, quantity: 0, footer: "Lv. 90" })))],
      ["artifact", renderCards(await loadBank("artifact"), [{ materialId: "gladiator-s-finale:flower", quantity: 0, footer: "+20" }, { materialId: "gladiator-s-finale:plume", quantity: 0, footer: "+16" }])],
      ["material", renderCards(await loadBank("material"), [{ materialId: "chaos-gear", quantity: 12 }, { materialId: "chaos-axis", quantity: 3 }])],
    ];
    for (const [kind, scene] of scenes) {
      const [reading] = decideGridKinds({ image: scene.image, grids: [scene.grid] }, {}, { kind: "auto" });
      assert.equal(reading.kind, kind);
      assert.equal(reading.source, "text");
    }
  });

  test("falls back to the icons when the text can't tell", async () => {
    const banks = await allBanks();
    const scene = renderCards(banks.weapon, ["amos-bow", "the-catch"].map((id) => ({ materialId: id, quantity: 0, footer: "" })));
    const result = recognizeCards({ image: scene.image, grids: [scene.grid] }, banks);
    assert.equal(result.grids[0].kind, "weapon");
    assert.equal(result.grids[0].source, "icons");
    assert.deepEqual(result.cards.map((c) => c.material?.id), ["amos-bow", "the-catch"]);
  });

  test("the setting wins over the text", async () => {
    const banks = await allBanks();
    const scene = renderCards(banks.weapon, [{ materialId: "amos-bow", quantity: 0, footer: "Lv. 90" }]);
    const [reading] = decideGridKinds({ image: scene.image, grids: [scene.grid] }, banks, { kind: "artifact" });
    assert.deepEqual([reading.kind, reading.source], ["artifact", "setting"]);
  });

  test("the reference screenshots are materials, read as before", async () => {
    const sample = loadTruth().samples[0];
    const image = await loadImage(sample.file);
    const { grids } = detectInventoryGrids({ image });
    const result = recognizeCards({ image, grids }, await allBanks());
    assert.ok(result.grids.every((g) => g.kind === "material" && g.source === "text"));
    for (const [row, column, id, quantity] of sample.cards) {
      const card = result.cards.find((c) => c.row === row && c.column === column)!;
      assert.equal(card.material?.id, id);
      assert.equal(card.quantity.value, quantity);
    }
  });
});

describe("weapons", () => {
  test("weapon, level, refinement and lock; awakened icons from the second ascension", async () => {
    const banks = await allBanks();
    const specs = [
      { materialId: "amos-bow~awakened", quantity: 0, footer: "Lv. 90", refinement: 1, locked: true, equipped: true },
      { materialId: "the-catch", quantity: 0, footer: "Lv. 20", refinement: 5, locked: false },
      { materialId: "favonius-sword~awakened", quantity: 0, footer: "Lv. 70", refinement: 3, locked: true },
      { materialId: "dull-blade", quantity: 0, footer: "Lv. 1", locked: false },
    ];
    const scene = renderCards(banks.weapon, specs);
    const result = recognizeCards({ image: scene.image, grids: [scene.grid] }, banks);
    assert.equal(result.grids[0].kind, "weapon");
    assert.equal(result.items.length, 0, "weapons are not aggregated like materials");
    const expected = [
      ["amos-bow", "awakened", 90, 1, true],
      ["the-catch", undefined, 20, 5, false],
      ["favonius-sword", "awakened", 70, 3, true],
      ["dull-blade", undefined, 1, null, false],
    ];
    result.cards.forEach((card, k) => {
      const [id, variant, level, refinement, locked] = expected[k];
      assert.equal(card.kind, "weapon");
      assert.equal(card.material?.id, id, `card ${k}`);
      assert.equal(card.material?.variant, variant, `card ${k} variant`);
      assert.equal(card.status, "matched", `card ${k} status (${card.confidence})`);
      assert.equal(card.level?.value, level, `card ${k} level`);
      assert.equal(card.refinement?.value ?? null, refinement, `card ${k} refinement`);
      assert.equal(card.locked, locked, `card ${k} lock`);
    });
  });

  test("a material in the weapons tab (enhancement ore) is not taken for a weapon", async () => {
    const banks = await allBanks();
    const weapons = renderCards(banks.weapon, ["amos-bow", "the-catch", "dull-blade"].map((id) => ({ materialId: id, quantity: 0, footer: "Lv. 90" })));
    const ore = renderCards(banks.material, [{ materialId: "mystic-enhancement-ore", quantity: 734 }]);
    // The ore's card, pasted as a fourth card of the weapon grid.
    const W = weapons.image.width;
    const data = new Uint8ClampedArray(weapons.image.data);
    const src = ore.boxes[0];
    const dst = { ...weapons.boxes[2], x: weapons.boxes[2].x, y: weapons.boxes[2].y };
    for (let y = 0; y < Math.round(src.height); y++)
      for (let x = 0; x < Math.round(src.width); x++) {
        const from = ((src.y + y) * ore.image.width + src.x + x) * 4;
        const to = ((dst.y + y) * W + dst.x + x) * 4;
        for (let c = 0; c < 4; c++) data[to + c] = ore.image.data[from + c];
      }
    const result = recognizeCards({ image: { ...weapons.image, data }, grids: [weapons.grid] }, banks);
    assert.equal(result.grids[0].kind, "weapon");
    assert.equal(result.cards[2].status, "unknown");
    assert.equal(result.cards[2].material, null);
  });
});

describe("characters", () => {
  test("the party setup's list: \"Lv.\" without a star row; character and level", async () => {
    const banks = await allBanks();
    const specs = [
      { materialId: "hu-tao", quantity: 0, footer: "Lv. 90", stars: 0 },
      { materialId: "bennett", quantity: 0, footer: "Lv. 80", stars: 0 },
      { materialId: "lumine", quantity: 0, footer: "Lv. 1", stars: 0 },
    ];
    const scene = renderCards(banks.character, specs);
    const [reading] = decideGridKinds({ image: scene.image, grids: [scene.grid] }, {}, { kind: "auto" });
    assert.deepEqual([reading.kind, reading.source], ["character", "text"]);
    const result = recognizeCards({ image: scene.image, grids: [scene.grid] }, banks);
    assert.deepEqual(
      result.cards.map((c) => [c.material?.id, c.level?.value, c.status]),
      [
        ["hu-tao", 90, "matched"],
        ["bennett", 80, "matched"],
        ["lumine", 1, "matched"],
      ],
    );
    assert.ok(result.cards.every((c) => c.locked === null && c.refinement === null));
  });
});

describe("artifacts", () => {
  test("set and slot from the piece's icon; the rarity may be any the set has", async () => {
    const banks = await allBanks();
    const specs = [
      { materialId: "gladiator-s-finale:flower", quantity: 0, footer: "+20", locked: true, equipped: true },
      { materialId: "gladiator-s-finale:goblet", quantity: 0, footer: "+16", stars: 4, locked: false },
      { materialId: "emblem-of-severed-fate:sands", quantity: 0, footer: "+0", locked: true },
    ];
    const scene = renderCards(banks.artifact, specs);
    const result = recognizeCards({ image: scene.image, grids: [scene.grid] }, banks);
    assert.equal(result.grids[0].kind, "artifact");
    const expected = [
      ["gladiator-s-finale:flower", 20, 5, true],
      ["gladiator-s-finale:goblet", 16, 4, false],
      ["emblem-of-severed-fate:sands", 0, 5, true],
    ];
    result.cards.forEach((card, k) => {
      const [id, level, rarity, locked] = expected[k];
      assert.equal(card.material?.id, id, `card ${k}`);
      assert.equal(card.status, "matched", `card ${k} status (${card.confidence})`);
      assert.equal(card.level?.value, level, `card ${k} level`);
      assert.equal(card.rarity.value, rarity, `card ${k} rarity`);
      assert.equal(card.locked, locked, `card ${k} lock`);
      assert.equal(card.refinement, null);
    });
  });
});

// ── Players' screenshots (optional) ────────────────────────────────────────

const ONLINE = "tests/online-samples";
const truthFile = path.join(ONLINE, "ground-truth.json");
type OnlineCard = [number, number, string | null, ...(number | boolean | null)[]];
const online: { samples: { file: string; kind: CardKind; cards: OnlineCard[] }[] } = JSON.parse(
  fs.readFileSync(truthFile, "utf8"),
);

describe("players' screenshots (pnpm fetch:online-samples)", () => {
  for (const sample of online.samples) {
    if (!sample.cards) continue;
    const file = path.join(ONLINE, "files", sample.file);
    test(sample.file, { skip: !fs.existsSync(file) && "not downloaded" }, async () => {
      const image = await loadImage(file);
      const { grids } = detectInventoryGrids({ image });
      const result = recognizeCards({ image, grids }, await allBanks());
      assert.ok(result.grids.every((g) => g.kind === sample.kind), `kind ${result.grids.map((g) => g.kind)}`);
      for (const [row, column, item, a, b, locked] of sample.cards) {
        const at = `r${row}c${column}`;
        const card = result.cards.find((c) => c.row === row && c.column === column);
        assert.ok(card, `${at}: card missing`);
        if (item === "?") continue;
        if (item === null) {
          assert.equal(card.status, "unknown", `${at}: not an item`);
          continue;
        }
        assert.equal(card.material?.id, item, `${at} item`);
        const value = sample.kind === "material" ? card.quantity.value : card.level?.value;
        if (a !== null && a !== undefined) assert.equal(value, a, `${at} level/quantity`);
        if (sample.kind === "weapon" && b !== null && b !== undefined) assert.equal(card.refinement?.value, b, `${at} refinement`);
        if (sample.kind === "artifact" && b !== null && b !== undefined) assert.equal(card.rarity.value, b, `${at} rarity`);
        if (sample.kind !== "character" && typeof locked === "boolean") assert.equal(card.locked, locked, `${at} lock`);
      }
    });
  }
});
