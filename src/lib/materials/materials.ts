import materialsData from "@/data/materials.json";
import otherMaterialsData from "@/data/other-materials.json";
import type { MaterialItem } from "@/lib/types";

// Helpers without the catalog live in ./ui; client code that doesn't
// need getAllMaterials() should import them from there.
export * from "./ui";

/**
 * Returns all materials guaranteed sorted by canonical application order.
 */
export function getAllMaterials(): MaterialItem[] {
  return (materialsData as MaterialItem[])
    .slice()
    .sort((a, b) => a.order - b.order);
}

/**
 * The bag's Materials tab (local specialties, ingredients, fish, ores, wood),
 * from other-materials.json. Not in getAllMaterials(): the scanners only read
 * Character Development Items so far.
 */
export function getOtherMaterials(): MaterialItem[] {
  return (otherMaterialsData as MaterialItem[])
    .slice()
    .sort((a, b) => a.order - b.order);
}

/** Every material the directory, inventory and GOOD files know: both catalogs, in order. */
export function getDirectoryMaterials(): MaterialItem[] {
  return [...getAllMaterials(), ...getOtherMaterials()];
}
