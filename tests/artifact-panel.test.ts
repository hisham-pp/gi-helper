import test, { describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  maxArtifactLevel,
  mainStatValue,
  mainStatFits,
  levelsForMainValue,
  substatRolls,
  rollBudget,
  checkSubstats,
} from "../src/lib/artifact-panel/engine/stats";
import {
  parseNumber,
  parseLevel,
  statKey,
  parseStatLine,
  parseStatBlock,
  joinLines,
} from "../src/lib/artifact-panel/engine/parse";
import { snap, vocabulary } from "../src/lib/artifact-panel/engine/vocabulary";
import { isCream, boxOf } from "../src/lib/artifact-panel/engine/locate";
import {
  attachPanel,
  uniquePanels,
  toGoodArtifact,
  type EquipmentSighting,
} from "../src/lib/scan-equipment";
import { readArtifactPanel, type ArtifactPanelReading } from "../src/lib/artifact-panel/read";
import { createTesseractOcr, type PanelOcr } from "../src/lib/artifact-panel/ocr";
import { captureArtifactPanel, type ArtifactPanelCapture, type GrayImage } from "../src/lib/artifact-panel/engine/capture";
import { getArtifactSet } from "../src/lib/good/catalog";
import { loadImage } from "./material-detector/fixtures";

describe("artifact stats and roll validation", () => {
  test("maxArtifactLevel by rarity", () => {
    assert.equal(maxArtifactLevel(5), 20);
    assert.equal(maxArtifactLevel(4), 16);
    assert.equal(maxArtifactLevel(3), 12);
    assert.equal(maxArtifactLevel(2), 8);
    assert.equal(maxArtifactLevel(1), 4);
  });

  test("mainStatValue and mainStatFits", () => {
    // 5★ Flower HP (+20 is 4780, +0 is 717)
    assert.equal(mainStatValue(5, "hp", 20), 4780);
    assert.equal(mainStatValue(5, "hp", 0), 717);
    assert.ok(mainStatFits(5, "hp", 20, 4780));
    assert.ok(!mainStatFits(5, "hp", 20, 4700));

    // 5★ Elemental Mastery Sands (+16 is 155)
    assert.equal(mainStatValue(5, "eleMas", 16), 155);
    assert.ok(mainStatFits(5, "eleMas", 16, 155));

    // 5★ Percentage stat (+0 DEF% is 8.7%)
    assert.equal(mainStatValue(5, "def_", 0), 8.7);
    assert.ok(mainStatFits(5, "def_", 0, 8.7));
  });

  test("levelsForMainValue recovers level from value", () => {
    assert.deepEqual(levelsForMainValue(5, "hp", 4780), [20]);
    assert.deepEqual(levelsForMainValue(5, "eleMas", 155), [16]);
    assert.deepEqual(levelsForMainValue(5, "def_", 8.7), [0]);
  });

  test("substatRolls for valid and impossible values", () => {
    // 5★ CRIT Rate single roll can be 2.7, 3.1, 3.5, 3.9
    assert.deepEqual(substatRolls(5, "critRate_", 2.7), [1]);
    assert.deepEqual(substatRolls(5, "critRate_", 3.9), [1]);
    assert.deepEqual(substatRolls(5, "critRate_", 7.8), [2]);
    // 3.0% cannot be rolled by a 5★ artifact
    assert.deepEqual(substatRolls(5, "critRate_", 3.0), []);
  });

  test("rollBudget calculates initial rolls and upgrades", () => {
    // 5★ starts with 3 or 4 rolls, +20 has 5 upgrades (total 8 or 9 rolls)
    assert.deepEqual(rollBudget(5, 20), { initial: [3, 4], upgrades: 5 });
    // 5★ at +0 has 3 or 4 rolls and 0 upgrades
    assert.deepEqual(rollBudget(5, 0), { initial: [3, 4], upgrades: 0 });
    // 4★ at +16 has initial [2, 3] and 4 upgrades
    assert.deepEqual(rollBudget(4, 16), { initial: [2, 3], upgrades: 4 });
  });

  test("checkSubstats verifies consistency of artifact substats", () => {
    // Xiangling's 5★ +20 Emblem flower: 8 rolls total
    const xianglingSubstats = [
      { key: "enerRech_", value: 5.2 }, // 1 roll
      { key: "atk_", value: 14.0 }, // 3 rolls
      { key: "critRate_", value: 7.8 }, // 2 rolls
      { key: "atk", value: 37 }, // 2 rolls
    ];
    const check1 = checkSubstats(5, 20, xianglingSubstats);
    assert.ok(check1.consistent);
    assert.ok(check1.possible.every(Boolean));

    // +0 5★ piece with 3 valid initial rolls
    const freshPiece = [
      { key: "critRate_", value: 3.1 },
      { key: "def", value: 21 },
      { key: "hp_", value: 5.3 },
    ];
    assert.ok(checkSubstats(5, 0, freshPiece).consistent);

    // Impossible substat value
    const impossibleValue = [
      { key: "critRate_", value: 3.0 },
      { key: "atk", value: 16 },
    ];
    const checkImpossible = checkSubstats(5, 0, impossibleValue);
    assert.equal(checkImpossible.possible[0], false);
    assert.equal(checkImpossible.consistent, false);

    // Over-budget rolls: 5 rolls on a +0 artifact is impossible
    const overBudget = [
      { key: "critRate_", value: 7.8 }, // 2 rolls
      { key: "atk_", value: 10.0 }, // 2 rolls
      { key: "def", value: 21 }, // 1 roll
    ];
    assert.equal(checkSubstats(5, 0, overBudget).consistent, false);
  });
});

describe("number and text parsing", () => {
  test("parseNumber handles integer, decimal, percent, and OCR lookalikes", () => {
    assert.deepEqual(parseNumber("4,780"), { value: 4780, percent: false });
    assert.deepEqual(parseNumber("155"), { value: 155, percent: false });
    assert.deepEqual(parseNumber("8.7%"), { value: 8.7, percent: true });
    assert.deepEqual(parseNumber("+7.8%"), { value: 7.8, percent: true });

    // European decimal comma: "12,4" -> 12.4
    assert.deepEqual(parseNumber("12,4"), { value: 12.4, percent: true });

    // OCR confusion lookalikes
    assert.deepEqual(parseNumber("4,78O"), { value: 4780, percent: false });
    assert.deepEqual(parseNumber("+1O.5%"), { value: 10.5, percent: true });
    assert.deepEqual(parseNumber("Z.7%"), { value: 2.7, percent: true });
    assert.deepEqual(parseNumber("S.2%"), { value: 5.2, percent: true });
    assert.deepEqual(parseNumber("B.7%"), { value: 8.7, percent: true });

    // Invalid input
    assert.equal(parseNumber(""), null);
    assert.equal(parseNumber("abc"), null);
  });

  test("parseLevel handles +N, digit corrections, and limits", () => {
    assert.equal(parseLevel("+20"), 20);
    assert.equal(parseLevel("+0"), 0);
    assert.equal(parseLevel("+16"), 16);
    assert.equal(parseLevel("15"), 15);

    // "+" misread as "4" or "1"
    assert.equal(parseLevel("420"), 20);
    assert.equal(parseLevel("120"), 20);

    // Over maximum artifact level (20)
    assert.equal(parseLevel("+25"), null);
    assert.equal(parseLevel(""), null);
  });

  test("statKey mapping", () => {
    assert.equal(statKey("hp", true), "hp_");
    assert.equal(statKey("hp", false), "hp");
    assert.equal(statKey("atk", true), "atk_");
    assert.equal(statKey("atk", false), "atk");
    assert.equal(statKey("def", true), "def_");
    assert.equal(statKey("def", false), "def");
    assert.equal(statKey("critRate_", true), "critRate_");
    assert.equal(statKey("eleMas", false), "eleMas");
  });

  test("parseStatLine for English and Chinese lines", () => {
    // English lines with varying bullet symbols
    assert.deepEqual(parseStatLine("· CRIT Rate+7.8%", "en"), {
      key: "critRate_",
      value: 7.8,
      unactivated: false,
    });
    assert.deepEqual(parseStatLine("* Energy Recharge+5.2%", "en"), {
      key: "enerRech_",
      value: 5.2,
      unactivated: false,
    });
    assert.deepEqual(parseStatLine("+ ATK+14.0%", "en"), {
      key: "atk_",
      value: 14.0,
      unactivated: false,
    });
    assert.deepEqual(parseStatLine("- ATK+37", "en"), {
      key: "atk",
      value: 37,
      unactivated: false,
    });

    // Unactivated 4th substat
    assert.deepEqual(parseStatLine("· DEF+21 (unactivated)", "en"), {
      key: "def",
      value: 21,
      unactivated: true,
    });

    // Chinese lines
    assert.deepEqual(parseStatLine("· 暴击率+7.8%", "zh"), {
      key: "critRate_",
      value: 7.8,
      unactivated: false,
    });
    assert.deepEqual(parseStatLine("· 元素充能效率+5.2%", "zh"), {
      key: "enerRech_",
      value: 5.2,
      unactivated: false,
    });
    assert.deepEqual(parseStatLine("· 防御力+21（待激活）", "zh"), {
      key: "def",
      value: 21,
      unactivated: true,
    });
  });

  test("parseStatBlock and joinLines", () => {
    const block = `
* Energy Recharge+5.2%
- ATK+14.0%

+ CRIT Rate+7.8%

- ATK+37
`;
    const parsed = parseStatBlock(block, "en");
    assert.equal(parsed.length, 4);
    assert.equal(parsed[0].key, "enerRech_");
    assert.equal(parsed[1].key, "atk_");
    assert.equal(parsed[2].key, "critRate_");
    assert.equal(parsed[3].key, "atk");

    assert.equal(
      joinLines("Viridescent Venerer's\nDetermination\n"),
      "Viridescent Venerer's Determination",
    );
  });
});

describe("vocabulary snapping", () => {
  test("snaps slots in English and Chinese", () => {
    const vocabEn = vocabulary("en");
    const vocabZh = vocabulary("zh");

    assert.equal(snap("Flower of Life", vocabEn.slots, "en")?.value, "flower");
    assert.equal(snap("Sands of Eon", vocabEn.slots, "en")?.value, "sands");
    assert.equal(snap("Goblet of Eonothem", vocabEn.slots, "en")?.value, "goblet");

    assert.equal(snap("生之花", vocabZh.slots, "zh")?.value, "flower");
    assert.equal(snap("时之沙", vocabZh.slots, "zh")?.value, "sands");
    assert.equal(snap("空之杯", vocabZh.slots, "zh")?.value, "goblet");
  });

  test("snaps piece names to setId and slot", () => {
    const vocab = vocabulary("en");
    const piece = snap("Magnificent Tsuba", vocab.pieces, "en");
    assert.ok(piece);
    assert.equal(piece.value.setId, "emblem-of-severed-fate");
    assert.equal(piece.value.slot, "flower");
  });

  test("snaps equipped character names", () => {
    const vocab = vocabulary("en");
    const char1 = snap("Xiangling", vocab.characters, "en");
    assert.ok(char1);
    assert.equal(char1.value, "xiangling");

    const char2 = snap("Kuki Shinobu", vocab.characters, "en");
    assert.ok(char2);
    assert.equal(char2.value, "kuki-shinobu");
  });
});

describe("panel attachment and GOOD export", () => {
  const dummyReading: ArtifactPanelReading = {
    language: "en",
    setId: "emblem-of-severed-fate",
    slot: "flower",
    rarity: 5,
    level: 20,
    locked: true,
    mainStatKey: "hp",
    mainStatValue: 4780,
    substats: [
      { key: "enerRech_", value: 5.2 },
      { key: "atk_", value: 14.0 },
      { key: "critRate_", value: 7.8 },
      { key: "atk", value: 37 },
    ],
    unactivatedSubstats: [],
    location: "Xiangling",
    issues: [],
    text: {},
  };

  test("attachPanel attaches reading to matching card in grid", () => {
    const gridRows: EquipmentSighting[][] = [
      [
        {
          kind: "artifact",
          item: "emblem-of-severed-fate:flower",
          rarity: 5,
          level: 20,
          refinement: null,
          locked: true,
          status: "matched",
          confidence: 1,
          candidates: [],
          source: 0,
          row: 0,
          column: 0,
          card: {
            cardId: "c0-0",
            gridId: "g1",
            kind: "artifact",
            row: 0,
            column: 0,
            box: { x: 0, y: 0, width: 100, height: 100 },
            matchedBox: { x: 0, y: 0, width: 100, height: 100 },
            status: "matched",
            material: { id: "emblem-of-severed-fate:flower", name: "Flower", rarity: 5, error: 0, confidence: 1 },
            candidates: [],
            rarity: { value: 5, stars: 5, background: 5, confidence: 1 },
            quantity: { value: null, text: "", confidence: 0 },
            level: { value: 20, confidence: 1 },
            refinement: null,
            locked: true,
            hasNewBadge: false,
            orderAdjusted: false,
            confidence: 1,
          },
        },
      ],
    ];

    const highlights = [
      { gridId: "g1", row: 0, column: 0, box: { x: 0, y: 0, width: 100, height: 100 }, score: 0.9, empty: false },
    ];

    const result = attachPanel(gridRows, dummyReading, highlights, 0, { x: 1000, y: 0, width: 400, height: 600 });
    assert.equal(result.standalone, null);
    assert.ok(result.rows[0][0].panel);
    assert.equal(result.rows[0][0].panel?.setId, "emblem-of-severed-fate");
    assert.equal(result.rows[0][0].panel?.location, "Xiangling");
  });

  test("attachPanel returns standalone when card is not in grid", () => {
    const gridRows: EquipmentSighting[][] = [];
    const result = attachPanel(gridRows, dummyReading, [], 0, { x: 1000, y: 0, width: 400, height: 600 });
    assert.ok(result.standalone);
    assert.equal(result.standalone?.item, "emblem-of-severed-fate:flower");
    assert.equal(result.standalone?.panel?.location, "Xiangling");
  });

  test("uniquePanels deduplicates repeated readings", () => {
    const standalone1: EquipmentSighting = {
      kind: "artifact",
      item: "emblem-of-severed-fate:flower",
      rarity: 5,
      level: 20,
      refinement: null,
      locked: true,
      status: "matched",
      confidence: 1,
      candidates: [],
      source: 0,
      row: -1,
      column: -1,
      card: null as any,
      panel: dummyReading,
    };

    const standalone2: EquipmentSighting = {
      ...standalone1,
      source: 1,
    };

    const unique = uniquePanels([standalone1, standalone2], []);
    assert.equal(unique.length, 1);
  });

  test("toGoodArtifact exports full stats and details", () => {
    const set = getArtifactSet("EmblemOfSeveredFate")!;
    const good = toGoodArtifact(
      { rarity: 5, level: 20, locked: true },
      set,
      "flower",
      "hp",
      {
        substats: dummyReading.substats,
        unactivatedSubstats: [],
        location: dummyReading.location,
      },
    );

    assert.equal(good.setKey, "EmblemOfSeveredFate");
    assert.equal(good.slotKey, "flower");
    assert.equal(good.mainStatKey, "hp");
    assert.equal(good.level, 20);
    assert.equal(good.rarity, 5);
    assert.equal(good.lock, true);
    assert.equal(good.location, "Xiangling");
    assert.equal(good.substats.length, 4);
    assert.equal(good.substats[0].key, "enerRech_");
    assert.equal(good.substats[0].value, 5.2);
  });
});

describe("readArtifactPanel with mock OCR", () => {
  const makeImage = (): GrayImage => ({ width: 10, height: 10, data: new Uint8Array(100) });
  const baseCapture: ArtifactPanelCapture = {
    bounds: { x: 0, y: 0, width: 100, height: 200 },
    geometry: {
      x: 0,
      width: 100,
      bodyTop: 50,
      bodyBottom: 150,
      equipped: null,
      badge: { x: 5, y: 55, width: 20, height: 10 },
    },
    stars: 5,
    headerRarity: 5,
    locked: true,
    signature: new Uint8Array(24 * 40),
    fields: {
      slot: makeImage(),
      name: makeImage(),
      mainName: makeImage(),
      mainValue: makeImage(),
      level: makeImage(),
      stats: makeImage(),
      setName: makeImage(),
      equipped: makeImage(),
    },
  };

  test("isCream identifies artifact panel cream background", () => {
    assert.ok(isCream(236, 229, 216));
    assert.ok(!isCream(255, 255, 255));
    assert.ok(!isCream(0, 0, 0));
    assert.ok(!isCream(200, 50, 50));
  });

  test("boxOf finds bounding box of matching pixels", () => {
    const dummyImage = {
      width: 10,
      height: 10,
      data: new Uint8Array(10 * 10 * 4),
    };
    for (const [x, y] of [[2, 3], [4, 5]]) {
      const idx = (y * 10 + x) * 4;
      dummyImage.data[idx] = 236;
      dummyImage.data[idx + 1] = 229;
      dummyImage.data[idx + 2] = 216;
    }
    const box = boxOf(dummyImage, { x0: 0, y0: 0, x1: 10, y1: 10 }, isCream, 2);
    assert.ok(box);
    assert.equal(box.x0, 2);
    assert.equal(box.y0, 3);
    assert.equal(box.x1, 5);
    assert.equal(box.y1, 6);
  });

  test("produces clean reading with zero issues for valid panel", async () => {
    const ocr: PanelOcr = {
      async read(image) {
        if (image === baseCapture.fields.slot) return "Flower of Life\n";
        if (image === baseCapture.fields.name) return "Magnificent Tsuba\n";
        if (image === baseCapture.fields.mainName) return "HP\n";
        if (image === baseCapture.fields.mainValue) return "4,780\n";
        if (image === baseCapture.fields.level) return "+20\n";
        if (image === baseCapture.fields.stats) return "* Energy Recharge+5.2%\n- ATK+14.0%\n+ CRIT Rate+7.8%\n- ATK+37\n";
        if (image === baseCapture.fields.setName) return "Emblem of Severed Fate:\n";
        if (image === baseCapture.fields.equipped) return "Equipped: Xiangling\n";
        return "";
      },
      async dispose() {},
    };

    const reading = await readArtifactPanel(baseCapture, ocr);
    assert.ok(reading);
    assert.equal(reading.language, "en");
    assert.equal(reading.setId, "emblem-of-severed-fate");
    assert.equal(reading.slot, "flower");
    assert.equal(reading.rarity, 5);
    assert.equal(reading.level, 20);
    assert.equal(reading.locked, true);
    assert.equal(reading.mainStatKey, "hp");
    assert.equal(reading.mainStatValue, 4780);
    assert.equal(reading.location, "Xiangling");
    assert.deepEqual(reading.issues, []);
  });

  test("reports issue when piece name and set name disagree", async () => {
    const ocr: PanelOcr = {
      async read(image) {
        if (image === baseCapture.fields.slot) return "Flower of Life\n";
        if (image === baseCapture.fields.name) return "Magnificent Tsuba\n"; // Emblem
        if (image === baseCapture.fields.mainName) return "HP\n";
        if (image === baseCapture.fields.mainValue) return "4,780\n";
        if (image === baseCapture.fields.level) return "+20\n";
        if (image === baseCapture.fields.stats) return "+ CRIT Rate+7.8%\n";
        if (image === baseCapture.fields.setName) return "Gladiator's Finale:\n"; // Gladiator!
        return "";
      },
      async dispose() {},
    };

    const reading = await readArtifactPanel(baseCapture, ocr);
    assert.ok(reading);
    assert.ok(reading.issues.includes("The piece name and set name disagree"));
  });

  test("returns null if slot line is not an artifact slot", async () => {
    const ocr: PanelOcr = {
      async read() {
        return "Unknown line\n";
      },
      async dispose() {},
    };

    const reading = await readArtifactPanel(baseCapture, ocr);
    assert.equal(reading, null);
  });
});

// ── Online sample OCR evaluation (when downloaded via pnpm fetch:online-samples) ──

describe("online sample artifact panel OCR (pnpm fetch:online-samples)", () => {
  const ONLINE = "tests/online-samples";
  const truthFile = path.join(ONLINE, "ground-truth.json");
  const online: { samples: { file: string; panel?: Record<string, unknown> }[] } = JSON.parse(
    fs.readFileSync(truthFile, "utf8"),
  );
  const panelSamples = online.samples.filter((s) => s.panel);

  const ocr = createTesseractOcr({
    langPath: () => path.resolve("public/ocr"),
  });

  test.after(async () => {
    await ocr.dispose();
  });

  for (const sample of panelSamples) {
    const file = path.join(ONLINE, "files", sample.file);
    test(sample.file, { skip: !fs.existsSync(file) && "not downloaded" }, async () => {
      const image = await loadImage(file);
      const capture = captureArtifactPanel(image);
      assert.ok(capture, `${sample.file}: panel must be captured`);

      const reading = await readArtifactPanel(capture, ocr);
      assert.ok(reading, `${sample.file}: reading must succeed`);

      const exp = sample.panel;
      assert.equal(reading.setId, exp.setId, `${sample.file} setId`);
      assert.equal(reading.slot, exp.slot, `${sample.file} slot`);
      assert.equal(reading.rarity, exp.rarity, `${sample.file} rarity`);
      assert.equal(reading.level, exp.level, `${sample.file} level`);
      assert.equal(reading.locked, exp.locked, `${sample.file} locked`);
      assert.equal(reading.mainStatKey, exp.mainStatKey, `${sample.file} mainStatKey`);
      assert.ok(
        Math.abs(reading.mainStatValue! - exp.mainStatValue) < 0.1,
        `${sample.file} mainStatValue expected ${exp.mainStatValue}, got ${reading.mainStatValue}`,
      );
      assert.equal(reading.location, exp.location, `${sample.file} location`);
      assert.equal(reading.issues.length, 0, `${sample.file} issues: ${reading.issues.join(", ")}`);
    });
  }
});

