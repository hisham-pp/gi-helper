import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getAllMaterials,
  getMaterialCategoryId,
  getMaterialCategoryLabel,
  MATERIAL_CATEGORIES,
} from "../src/lib/materials";

describe("Materials Directory & Canonical Ordering Tests", () => {
  it("returns exactly 475 materials from the application dataset", () => {
    const materials = getAllMaterials();
    assert.equal(materials.length, 475);
  });

  it("materials are strictly sorted in ascending canonical order (1 to 475) with no gaps", () => {
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
    assert.equal(MATERIAL_CATEGORIES.length, 7);
    for (const cat of MATERIAL_CATEGORIES) {
      assert.ok(cat.id, "Category must have id");
      assert.ok(cat.label, "Category must have label");
      assert.ok(cat.shortLabel, "Category must have shortLabel");
    }
  });
});
