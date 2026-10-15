import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  bagOrder,
  getAllMaterials,
  getDirectoryMaterials,
  getOtherMaterials,
  materialThumbUrl,
  getMaterialCategoryId,
  getMaterialCategoryLabel,
  MATERIAL_CATEGORIES,
} from "../src/lib/materials";
import { toGOODKey } from "../src/lib/good/keys";
import { getAllArtifactSets, getAllWeapons } from "../src/lib/good/catalog";
import { SLOT_KEYS } from "../src/lib/good/types";

describe("Materials Directory & Canonical Ordering Tests", () => {
  it("returns exactly 481 materials from the application dataset", () => {
    const materials = getAllMaterials();
    assert.equal(materials.length, 481);
  });

  it("materials are strictly sorted in ascending canonical order (1 to 481) with no gaps", () => {
    const materials = getAllMaterials();
    for (let i = 0; i < materials.length; i++) {
      const expectedOrder = i + 1;
      assert.equal(
        materials[i].order,
        expectedOrder,
        `Material at index ${i} ("${materials[i].name}") must have order ${expectedOrder}, but got ${materials[i].order}`,
      );
    }
  });

  it("every material has valid required fields (id, name, order, image, sortRank)", () => {
    const materials = getAllMaterials();
    for (const mat of materials) {
      assert.ok(
        mat.id && typeof mat.id === "string",
        `Material must have non-empty id`,
      );
      assert.ok(
        mat.name && typeof mat.name === "string",
        `Material must have non-empty name`,
      );
      assert.ok(
        typeof mat.order === "number" && mat.order >= 1,
        `Material must have positive order`,
      );
      assert.ok(
        mat.image && typeof mat.image === "string",
        `Material must have image path`,
      );
      assert.ok(
        typeof mat.sortRank === "number",
        `Material must have sortRank number`,
      );
      if (mat.rarity !== undefined) {
        assert.ok(
          mat.rarity >= 1 && mat.rarity <= 5,
          `Rarity must be between 1 and 5`,
        );
      }
    }
  });

  it("correctly identifies category based on sortRank ranges", () => {
    const materials = getAllMaterials();

    // Check refinement material (sortRank = 90)
    const refinement = materials.find((m) => m.sortRank === 90);
    assert.ok(refinement, "Refinement material should exist");
    assert.equal(getMaterialCategoryId(refinement!), "REFINEMENT");

    // Check mob/enhancement drop (sortRank between 10105 and 10640)
    const mob = materials.find((m) => m.sortRank === 10601); // Slime condensate
    assert.ok(mob, "Slime condensate should exist");
    assert.equal(getMaterialCategoryId(mob!), "ENHANCEMENT");

    // Check boss drop (sortRank = 11101)
    const boss = materials.find((m) => m.sortRank === 11101);
    assert.ok(boss, "Boss drop should exist");
    assert.equal(getMaterialCategoryId(boss!), "BOSS");

    // Check elemental gem (sortRank = 12101..12108)
    const gem = materials.find((m) => m.sortRank === 12101);
    assert.ok(gem, "Gem should exist");
    assert.equal(getMaterialCategoryId(gem!), "GEM");

    // Check talent book (sortRank = 13101..14101)
    const talent = materials.find((m) => m.sortRank === 13101);
    assert.ok(talent, "Talent book should exist");
    assert.equal(getMaterialCategoryId(talent!), "TALENT");

    // Check weapon ascension mat (sortRank = 15101..15124)
    const weapon = materials.find((m) => m.sortRank === 15101);
    assert.ok(weapon, "Weapon material should exist");
    assert.equal(getMaterialCategoryId(weapon!), "WEAPON");
  });

  it("all categories defined in MATERIAL_CATEGORIES have valid metadata", () => {
    // All, the 7 Character Development groups and the 4 Materials-tab groups
    assert.equal(MATERIAL_CATEGORIES.length, 12);
    for (const cat of MATERIAL_CATEGORIES) {
      assert.ok(cat.id, "Category must have id");
      assert.ok(cat.label, "Category must have label");
      assert.ok(cat.shortLabel, "Category must have shortLabel");
    }
  });

  it("every material has a list thumbnail (run `pnpm build:material-thumbs` if this fails)", () => {
    const missing = getAllMaterials().filter(
      (m) => !existsSync(path.join(process.cwd(), "public", materialThumbUrl(m.id))),
    );
    assert.deepEqual(missing.map((m) => m.id), []);
  });

  it("Materials-tab items (other-materials.json) are their own catalog after the scanner's", () => {
    const catalog = getAllMaterials();
    const others = getOtherMaterials();
    assert.ok(others.length > 200, `only ${others.length} other materials`);
    const catalogIds = new Set(catalog.map((m) => m.id));
    const catalogKeys = new Set(catalog.map((m) => toGOODKey(m.name)));
    const categories = new Set(["SPECIALTY", "INGREDIENT", "FISHING", "CRAFTING"]);
    for (const m of others) {
      assert.ok(!catalogIds.has(m.id), `${m.id} is in both catalogs`);
      assert.ok(!catalogKeys.has(toGOODKey(m.name)), `${m.name} shares a GOOD key with the catalog`);
      assert.ok(categories.has(getMaterialCategoryId(m)), `${m.name}: ${m.category}`);
      assert.equal(bagOrder(m).tab, "Materials", m.name);
      assert.ok(existsSync(path.join(process.cwd(), "public", materialThumbUrl(m.id))), `missing thumb for ${m.id}`);
    }
    assert.equal(new Set(others.map((m) => m.id)).size, others.length);
    assert.deepEqual(
      getDirectoryMaterials().map((m) => m.id),
      [...catalog, ...others].map((m) => m.id),
    );
    assert.equal(bagOrder(catalog[0]).position, 1);
    assert.equal(bagOrder(others[0]).position, 1);
  });

  const readAtlas = (kind: string) =>
    JSON.parse(readFileSync(path.join(process.cwd(), "public", "data", `${kind}-atlas.json`), "utf8")) as {
      kind?: string;
      entries: { id: string; item?: string; variant?: string; rarities?: number[] }[];
    };

  it("the material atlas has both bag tabs, in catalog order (run `pnpm build:atlases` if this fails)", () => {
    const atlas = readAtlas("material");
    assert.equal(atlas.kind, "material");
    assert.deepEqual(
      atlas.entries.map((e) => e.id),
      getDirectoryMaterials().map((m) => m.id),
    );
  });

  it("the weapon atlas has every weapon, with its awakened icon (run `pnpm build:atlases` if this fails)", () => {
    const atlas = readAtlas("weapon");
    assert.equal(atlas.kind, "weapon");
    const base = atlas.entries.filter((e) => !e.variant).map((e) => e.id);
    assert.deepEqual(base, getAllWeapons().map((w) => w.id));
    const awakened = atlas.entries.filter((e) => e.variant === "awakened");
    assert.ok(awakened.length >= base.length * 0.95, `only ${awakened.length} awakened icons`);
    for (const e of awakened) assert.ok(base.includes(e.item!), e.id);
  });

  it("the artifact atlas has every piece of every set (run `pnpm build:atlases` if this fails)", () => {
    const atlas = readAtlas("artifact");
    assert.equal(atlas.kind, "artifact");
    const expected = getAllArtifactSets().flatMap((set) =>
      SLOT_KEYS.filter((slot) => set.pieces[slot]).map((slot) => `${set.id}:${slot}`),
    );
    assert.deepEqual(
      atlas.entries.map((e) => e.id),
      expected,
    );
    for (const e of atlas.entries) assert.ok(e.rarities && e.rarities.length > 0, e.id);
  });
});
