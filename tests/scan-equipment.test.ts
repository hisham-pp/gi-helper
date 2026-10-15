import test, { describe } from "node:test";
import assert from "node:assert/strict";
import { getArtifactSet, getWeapon } from "../src/lib/good/catalog";
import type { CardRecognition } from "../src/lib/material-detector/types";
import {
  EquipmentStitcher,
  characterAscension,
  equipmentRows,
  toGoodArtifact,
  toGoodCharacter,
  toGoodWeapon,
  uniqueByItem,
  weaponAscension,
  type EquipmentSighting,
} from "../src/lib/scan-equipment";

/** A weapon card as the recognizer reports it. */
function card(row: number, column: number, id: string | null, level: number | null, extra: Partial<CardRecognition> = {}): CardRecognition {
  return {
    cardId: `c${row}-${column}`,
    gridId: "grid-1",
    kind: "weapon",
    row,
    column,
    box: { x: column * 100, y: row * 120, width: 90, height: 110 },
    matchedBox: { x: column * 100, y: row * 120, width: 90, height: 110 },
    status: id ? "matched" : "unknown",
    material: id ? { id, name: id, rarity: 4, error: 0.08, confidence: 1 } : null,
    candidates: [],
    rarity: { value: 4, stars: 4, background: 4, confidence: 0.97 },
    quantity: { value: null, text: "", confidence: 0 },
    level: { value: level, confidence: 1 },
    refinement: { value: 1, confidence: 1 },
    locked: false,
    hasNewBadge: false,
    orderAdjusted: false,
    confidence: id ? 1 : 0,
    ...extra,
  };
}

/** Rows of weapon ids at one level, numbered from `firstRow` in the frame. */
const frame = (source: number, rows: string[][], level = 90): EquipmentSighting[][] =>
  equipmentRows(
    rows.flatMap((ids, r) => ids.map((id, c) => card(r, c, id, level))),
    source,
  ).weapon;

const ids = (s: EquipmentStitcher) => s.result().map((x) => x.item);

describe("stitching overlapping screenshots", () => {
  test("rows seen in both screenshots are kept once", () => {
    const s = new EquipmentStitcher();
    s.add(frame(0, [["a", "b", "c"], ["d", "e", "f"], ["g", "h", "i"]]));
    const added = s.add(frame(1, [["d", "e", "f"], ["g", "h", "i"], ["j", "k", "l"]]));
    assert.equal(added, 1);
    assert.deepEqual(ids(s), ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l"]);
  });

  test("screenshots that don't overlap are both kept", () => {
    const s = new EquipmentStitcher();
    s.add(frame(0, [["a", "b"], ["c", "d"]]));
    s.add(frame(1, [["e", "f"], ["g", "h"]]));
    assert.equal(s.size, 8);
  });

  test("a weapon owned many times isn't merged away", () => {
    const s = new EquipmentStitcher();
    s.add(frame(0, [["dull-blade", "dull-blade"], ["dull-blade", "amos-bow"]]));
    assert.equal(s.size, 4);
  });

  test("the same weapon at another level is another row", () => {
    const s = new EquipmentStitcher();
    s.add(frame(0, [["a", "b"]], 90));
    s.add(frame(1, [["a", "b"]], 80));
    assert.equal(s.size, 4);
  });

  test("an unreadable card in the overlap takes the other screenshot's reading", () => {
    const s = new EquipmentStitcher();
    s.add(frame(0, [["a", "b"], ["c", "d"]]));
    const second = frame(1, [["c", "d"], ["e", "f"]]);
    second[0][0] = { ...second[0][0], item: null, status: "unknown", confidence: 0 };
    s.add(second);
    assert.deepEqual(ids(s), ["a", "b", "c", "d", "e", "f"]);
  });

  test("a screenshot of rows already seen adds nothing", () => {
    const s = new EquipmentStitcher();
    s.add(frame(0, [["a", "b"], ["c", "d"], ["e", "f"]]));
    assert.equal(s.add(frame(1, [["c", "d"]])), 0);
    assert.equal(s.size, 6);
  });
});

describe("weapons and artifacts as GOOD entries", () => {
  test("ascension from the level and the awakened icon", () => {
    assert.equal(weaponAscension(1, false, 4), 0);
    assert.equal(weaponAscension(20, false, 4), 0);
    assert.equal(weaponAscension(40, false, 4), 1);
    assert.equal(weaponAscension(40, true, 4), 2);
    assert.equal(weaponAscension(80, true, 5), 5);
    assert.equal(weaponAscension(90, true, 5), 6);
    assert.equal(weaponAscension(70, true, 2), 4);
  });

  test("a scanned weapon", () => {
    const info = getWeapon("AmosBow")!;
    assert.deepEqual(toGoodWeapon({ variant: "awakened", level: 90, refinement: 2, locked: true }, info), {
      key: "AmosBow",
      level: 90,
      ascension: 6,
      refinement: 2,
      location: "",
      lock: true,
    });
  });

  test("a scanned artifact: fixed main stat for flowers and plumes, none otherwise", () => {
    const set = getArtifactSet("GladiatorsFinale")!;
    const flower = toGoodArtifact({ rarity: 5, level: 20, locked: true }, set, "flower");
    assert.equal(flower.mainStatKey, "hp");
    assert.equal(flower.setKey, "GladiatorsFinale");
    assert.equal(toGoodArtifact({ rarity: 5, level: 20, locked: false }, set, "plume").mainStatKey, "atk");
    assert.equal(toGoodArtifact({ rarity: 5, level: 20, locked: false }, set, "goblet").mainStatKey, "");
    assert.equal(toGoodArtifact({ rarity: 5, level: 20, locked: false }, set, "goblet", "pyro_dmg_").mainStatKey, "pyro_dmg_");
    // A 4★ piece stops at +16.
    assert.equal(toGoodArtifact({ rarity: 4, level: 20, locked: false }, set, "sands").level, 16);
  });
});

describe("characters", () => {
  test("each character once, the best reading kept", () => {
    const rows = frame(0, [["hu-tao", "bennett"], ["hu-tao", "xiangling"]]);
    rows[1][0] = { ...rows[1][0], level: null, confidence: 0.4 };
    const unique = uniqueByItem(rows.flat());
    assert.deepEqual(unique.map((c) => c.item), ["hu-tao", "bennett", "xiangling"]);
    assert.equal(unique[0].level, 90);
  });

  test("ascension from the level; past 90 is ascension 6", () => {
    assert.equal(characterAscension(1), 0);
    assert.equal(characterAscension(40), 1);
    assert.equal(characterAscension(80), 5);
    assert.equal(characterAscension(90), 6);
    assert.equal(characterAscension(95), 6);
  });

  test("a rescan keeps constellations and talents, and an ascension that still fits", () => {
    assert.deepEqual(toGoodCharacter("HuTao", 80), {
      key: "HuTao",
      level: 80,
      constellation: 0,
      ascension: 5,
      talent: { auto: 1, skill: 1, burst: 1 },
    });
    const owned = { key: "HuTao", level: 80, constellation: 1, ascension: 6, talent: { auto: 6, skill: 9, burst: 8 } };
    assert.deepEqual(toGoodCharacter("HuTao", 80, owned), { ...owned, level: 80 });
    assert.deepEqual(toGoodCharacter("HuTao", 90, owned), { ...owned, level: 90 });
    // 50 doesn't fit ascension 6 any more: recomputed.
    assert.equal(toGoodCharacter("HuTao", 50, owned).ascension, 2);
  });
});
