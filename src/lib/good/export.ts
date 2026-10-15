import type { DetectedItem } from "@/lib/types";
import { toGOODKey } from "./keys";
import type { GoodArtifact, GoodCharacter, GoodDocument, GoodWeapon } from "./types";

/** The "source" GI Helper writes into its GOOD files. */
export const GOOD_SOURCE = "GI Helper";

export interface GOODInventory {
  materials: DetectedItem[];
  /** Imported materials we don't catalog, by GOOD key. */
  extraMaterials: Record<string, number>;
  characters: GoodCharacter[];
  weapons: GoodWeapon[];
  artifacts: GoodArtifact[];
}

const usesGOOD3 = (a: GoodArtifact) =>
  a.totalRolls !== undefined ||
  a.astralMark !== undefined ||
  a.elixirCrafted !== undefined ||
  a.unactivatedSubstats !== undefined ||
  a.substats.some((s) => s.initialValue !== undefined);

/**
 * The GOOD document for an inventory. Empty sections are left out, so
 * importing it elsewhere doesn't look like "you own no weapons". Version 3
 * only when an artifact uses a GOOD 3 field.
 */
export function buildGOODDocument(inventory: GOODInventory): GoodDocument {
  const doc: GoodDocument = {
    format: "GOOD",
    version: inventory.artifacts.some(usesGOOD3) ? 3 : 2,
    source: GOOD_SOURCE,
  };
  if (inventory.characters.length > 0) doc.characters = inventory.characters.map(stripId);
  if (inventory.weapons.length > 0) doc.weapons = inventory.weapons.map(stripId);
  if (inventory.artifacts.length > 0) doc.artifacts = inventory.artifacts.map(stripId);

  const materials: Record<string, number> = { ...inventory.extraMaterials };
  for (const item of inventory.materials) materials[toGOODKey(item.name)] = item.quantity;
  if (Object.keys(materials).length > 0) doc.materials = materials;
  return doc;
}

/** Drops the inventory's local `id` from a weapon or artifact. */
function stripId<T extends object>(entry: T): T {
  if (!("id" in entry)) return entry;
  const { id: _id, ...rest } = entry as T & { id: unknown };
  void _id;
  return rest as T;
}
