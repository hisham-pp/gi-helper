import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { getAllCharacters } from "../src/lib/characters";
import {
  artifactIconUrl,
  describeCharacter,
  getAllArtifactSets,
  getAllWeapons,
  getArtifactSet,
  getWeapon,
  locationKeyOf,
  nameFromKey,
  weaponIconUrl,
} from "../src/lib/good/catalog";
import { fixAscension, parseGOOD } from "../src/lib/good/document";
import { buildGOODDocument } from "../src/lib/good/export";
import { splitGOODMaterials } from "../src/lib/good/materials";
import { toGOODKey } from "../src/lib/good/keys";
import { formatLevel, formatStat, SLOT_KEYS } from "../src/lib/good/types";

const GOOD_KEY = /^[A-Z][A-Za-z0-9]*$/;
const publicFile = (url: string) => path.join(process.cwd(), "public", url);

describe("GOOD game data", () => {
  it("weapons have unique GOOD keys and an icon each", () => {
    const weapons = getAllWeapons();
    assert.ok(weapons.length > 200, `only ${weapons.length} weapons`);
    assert.equal(new Set(weapons.map((w) => w.key)).size, weapons.length);
    for (const w of weapons) {
      assert.match(w.key, GOOD_KEY, w.name);
      assert.equal(w.key, toGOODKey(w.name), w.name);
      assert.ok(["sword", "claymore", "polearm", "bow", "catalyst"].includes(w.type), w.name);
      assert.ok(w.rarity >= 1 && w.rarity <= 5, w.name);
      assert.ok(existsSync(publicFile(weaponIconUrl(w.id))), `missing icon for ${w.name}`);
    }
  });

  it("artifact sets have unique keys and an icon per piece", () => {
    const sets = getAllArtifactSets();
    assert.ok(sets.length > 50, `only ${sets.length} sets`);
    assert.equal(new Set(sets.map((s) => s.key)).size, sets.length);
    for (const s of sets) {
      assert.match(s.key, GOOD_KEY, s.name);
      const slots = Object.keys(s.pieces);
      assert.ok(slots.length === 5 || (slots.length === 1 && slots[0] === "circlet"), s.name);
      for (const slot of SLOT_KEYS) {
        if (!s.pieces[slot]) continue;
        assert.ok(existsSync(publicFile(artifactIconUrl(s.id, slot))), `missing ${s.name} ${slot}`);
      }
    }
  });

  it("characters have GOOD keys and weapon types", () => {
    for (const c of getAllCharacters()) {
      assert.match(c.key, GOOD_KEY, c.name);
      assert.ok(["sword", "claymore", "polearm", "bow", "catalyst"].includes(c.weaponType), c.name);
    }
    const keys = getAllCharacters().filter((c) => c.key !== "Traveler").map((c) => c.key);
    assert.equal(new Set(keys).size, keys.length);
  });

  it("matches Genshin Optimizer's keys for tricky names", () => {
    assert.equal(getWeapon("TheCatch")?.name, '"The Catch"');
    assert.equal(getWeapon("AmosBow")?.name, "Amos' Bow");
    assert.equal(getWeapon("PrimordialJadeWingedSpear")?.name, "Primordial Jade Winged-Spear");
    assert.equal(getArtifactSet("GladiatorsFinale")?.name, "Gladiator's Finale");
    assert.equal(describeCharacter("KaedeharaKazuha").name, "Kaedehara Kazuha");
    assert.equal(describeCharacter("HuTao").avatarId, "hu-tao");
  });

  it("describes Travelers and keys newer than our data", () => {
    assert.equal(describeCharacter("TravelerAnemo").name, "Traveler (Anemo)");
    assert.equal(describeCharacter("Traveler").name, "Traveler");
    assert.ok(describeCharacter("TravelerGeo").avatarId);
    assert.equal(locationKeyOf("TravelerHydro"), "Traveler");
    assert.equal(locationKeyOf("Furina"), "Furina");
    assert.deepEqual(describeCharacter("SomeoneNew"), { key: "SomeoneNew", name: "Someone New" });
    assert.equal(nameFromKey("QuantumCatalyst"), "Quantum Catalyst");
  });
});

describe("GOOD parsing", () => {
  it("rejects files that aren't GOOD", () => {
    assert.equal(parseGOOD("not json").ok, false);
    assert.equal(parseGOOD({ format: "OTHER" }).ok, false);
    assert.equal(parseGOOD(JSON.stringify([1, 2])).ok, false);
  });

  it("reads every section, keeping unknown keys and GOOD 3 fields", () => {
    const result = parseGOOD({
      format: "GOOD",
      version: 3,
      source: "Genshin Optimizer",
      characters: [
        { key: "Furina", level: 90, constellation: 2, ascension: 6, talent: { auto: 6, skill: 10, burst: 10 } },
        { key: "SomeoneNew", level: 1, constellation: 0, ascension: 0, talent: { auto: 1, skill: 1, burst: 1 } },
      ],
      weapons: [
        { key: "QuantumCatalyst", level: 90, ascension: 6, refinement: 1, location: "Furina", lock: true },
      ],
      artifacts: [
        {
          setKey: "GoldenTroupe",
          slotKey: "flower",
          level: 20,
          rarity: 5,
          mainStatKey: "hp",
          location: "",
          lock: false,
          substats: [
            { key: "critRate_", value: 10.5, initialValue: 3.5 },
            { key: "", value: 0 },
          ],
          totalRolls: 8,
          astralMark: true,
        },
      ],
      materials: { HerosWit: 120, Qingxin: 40 },
    });
    assert.ok(result.ok);
    const data = result.data;
    assert.equal(data.source, "Genshin Optimizer");
    assert.equal(data.version, 3);
    assert.equal(data.characters?.length, 2);
    assert.equal(data.weapons?.[0].key, "QuantumCatalyst");
    assert.equal(data.weapons?.[0].lock, true);
    const artifact = data.artifacts?.[0];
    assert.deepEqual(artifact?.substats, [{ key: "critRate_", value: 10.5, initialValue: 3.5 }]);
    assert.equal(artifact?.totalRolls, 8);
    assert.equal(artifact?.astralMark, true);
    assert.deepEqual(data.materials, { HerosWit: 120, Qingxin: 40 });
    assert.equal(data.skipped, 0);
  });

  it("clamps numbers, fixes ascension and skips unusable entries", () => {
    const result = parseGOOD({
      format: "GOOD",
      version: 2,
      source: "x",
      characters: [
        { key: "Furina", level: 150, constellation: 9, ascension: 0, talent: { auto: 0, skill: 20, burst: "x" } },
        { level: 90 },
      ],
      weapons: [{ key: "AmosBow", level: "75", refinement: 7 }],
      artifacts: [{ setKey: "GoldenTroupe", slotKey: "hat" }],
      materials: { HerosWit: -1, Mora: 1000.7 },
    });
    assert.ok(result.ok);
    const [furina] = result.data.characters ?? [];
    assert.deepEqual(
      { level: furina.level, constellation: furina.constellation, ascension: furina.ascension },
      { level: 100, constellation: 6, ascension: 6 },
    );
    assert.deepEqual(furina.talent, { auto: 1, skill: 15, burst: 1 });
    const [amos] = result.data.weapons ?? [];
    assert.deepEqual(
      { level: amos.level, ascension: amos.ascension, refinement: amos.refinement, location: amos.location },
      { level: 75, ascension: 5, refinement: 5, location: "" },
    );
    assert.deepEqual(result.data.artifacts, []);
    assert.deepEqual(result.data.materials, { Mora: 1000 });
    // The keyless character, the "hat" artifact and the negative material
    assert.equal(result.data.skipped, 3);
  });

  it("keeps one entry per character", () => {
    const result = parseGOOD({
      format: "GOOD",
      version: 1,
      source: "x",
      characters: [
        { key: "Furina", level: 80 },
        { key: "Furina", level: 90 },
      ],
    });
    assert.ok(result.ok);
    assert.equal(result.data.characters?.length, 1);
    assert.equal(result.data.characters?.[0].level, 90);
    assert.equal(result.data.skipped, 1);
  });

  it("fixAscension keeps 80/80 and 80/90 apart and fixes the rest", () => {
    assert.equal(fixAscension(80, 5), 5);
    assert.equal(fixAscension(80, 6), 6);
    assert.equal(fixAscension(90, 0), 6);
    assert.equal(fixAscension(45, 1), 2);
    assert.equal(fixAscension(20, 0), 0);
    assert.equal(fixAscension(20, 1), 1);
    assert.equal(formatLevel(80, 5), "80/80");
    assert.equal(formatLevel(95, 6), "95");
  });
});

describe("GOOD export", () => {
  it("splits materials into catalog items (both bag tabs) and the rest", () => {
    const { items, extra } = splitGOODMaterials({ HerosWit: 120, Qingxin: 40, SomethingNew: 3 });
    assert.deepEqual(items, [
      { id: "hero-s-wit", name: "Hero's Wit", quantity: 120, rarity: 4 },
      { id: "qingxin", name: "Qingxin", quantity: 40, rarity: 1 },
    ]);
    assert.deepEqual(extra, { SomethingNew: 3 });
  });

  it("round-trips an inventory without local ids, leaving out empty sections", () => {
    const doc = buildGOODDocument({
      materials: [{ id: "hero-s-wit", name: "Hero's Wit", quantity: 120 }],
      extraMaterials: { Qingxin: 40, HerosWit: 1 },
      characters: [],
      weapons: [
        { id: "w-1", key: "AmosBow", level: 90, ascension: 6, refinement: 1, location: "", lock: false },
      ],
      artifacts: [],
    });
    assert.deepEqual(doc, {
      format: "GOOD",
      version: 2,
      source: "GI Helper",
      weapons: [{ key: "AmosBow", level: 90, ascension: 6, refinement: 1, location: "", lock: false }],
      // A scanned count wins over an imported one for the same material
      materials: { Qingxin: 40, HerosWit: 120 },
    });
    const reparsed = parseGOOD(JSON.stringify(doc));
    assert.ok(reparsed.ok);
    assert.deepEqual(reparsed.data.weapons, doc.weapons);
  });

  it("writes version 3 when an artifact uses GOOD 3 fields", () => {
    const base = {
      setKey: "GoldenTroupe",
      slotKey: "flower" as const,
      level: 0,
      rarity: 5,
      mainStatKey: "hp",
      location: "",
      lock: false,
    };
    const inventory = { materials: [], extraMaterials: {}, characters: [], weapons: [] };
    assert.equal(
      buildGOODDocument({ ...inventory, artifacts: [{ ...base, id: "a", substats: [] }] }).version,
      2,
    );
    assert.equal(
      buildGOODDocument({
        ...inventory,
        artifacts: [{ ...base, id: "a", substats: [], unactivatedSubstats: [{ key: "atk", value: 19 }] }],
      }).version,
      3,
    );
  });

  it("formats stats like the game", () => {
    assert.equal(formatStat("critRate_", 10.5), "CRIT Rate 10.5%");
    assert.equal(formatStat("atk", 19.45), "ATK 19");
    assert.equal(formatStat("enerRech_", 11), "Energy Recharge 11%");
  });
});

describe("e2e fixture", () => {
  it("is a GOOD file this parser reads without skipping anything", () => {
    const text = readFileSync(path.join(process.cwd(), "tests", "e2e", "fixtures", "account.good.json"), "utf8");
    const result = parseGOOD(text);
    assert.ok(result.ok);
    assert.equal(result.data.skipped, 0);
  });
});
