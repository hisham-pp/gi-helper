import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildGOODData, toGOODFormatName } from "../src/lib/good-format";
import { getAllMaterials } from "../src/lib/materials";

describe("GOOD export", () => {
  it("turns names into PascalCase keys", () => {
    const cases: Record<string, string> = {
      "Hero's Wit": "HerosWit",
      "Teachings of Freedom": "TeachingsOfFreedom",
      "Night-Wind's Mystic Premonition": "NightWindsMysticPremonition",
      '"Exalted Earth"': "ExaltedEarth",
      "Ascended Sample: Knight": "AscendedSampleKnight",
      "Artificed Spare Clockwork Component — Coppelia": "ArtificedSpareClockworkComponentCoppelia",
    };
    for (const [name, key] of Object.entries(cases)) {
      assert.equal(toGOODFormatName(name), key, name);
    }
  });

  it("gives every material a unique key of letters and digits only", () => {
    const seen = new Map<string, string>();
    for (const m of getAllMaterials()) {
      const key = toGOODFormatName(m.name);
      assert.match(key, /^[A-Z][A-Za-z0-9]*$/, `${m.name} → ${key}`);
      assert.ok(!seen.has(key), `${m.name} and ${seen.get(key)} share the key ${key}`);
      seen.set(key, m.name);
    }
  });

  it("builds a GOOD v2 document with the scanned quantities", () => {
    const data = buildGOODData([
      { id: "hero-s-wit", name: "Hero's Wit", quantity: 120 },
      { id: "ascended-sample-knight", name: "Ascended Sample: Knight", quantity: 3 },
    ]);
    assert.deepEqual(data, {
      format: "GOOD",
      version: 2,
      source: "GenshinMaterialScanner",
      materials: { HerosWit: 120, AscendedSampleKnight: 3 },
    });
  });
});
