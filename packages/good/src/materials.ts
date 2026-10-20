import { getDirectoryMaterials } from "@/lib/materials";
import type { DetectedItem } from "@/lib/types";
import { toGOODKey } from "./keys";

/*
 * GOOD material keys to our catalogs (Character Development Items and the
 * Materials tab). Kept apart from parsing and export, so only code that maps
 * imported materials loads the catalogs.
 */

let materialKeys: Map<string, { id: string; name: string; rarity?: number }> | null = null;

/** Our material for a GOOD material key, if it's in the catalog. */
export function materialForGOODKey(key: string) {
  materialKeys ??= new Map(
    getDirectoryMaterials().map((m) => [toGOODKey(m.name), { id: m.id, name: m.name, rarity: m.rarity }]),
  );
  return materialKeys.get(key);
}

/**
 * Splits a GOOD materials map into catalog materials (as inventory items)
 * and the rest (Materials-tab items and anything newer), kept by key.
 */
export function splitGOODMaterials(materials: Record<string, number>): {
  items: DetectedItem[];
  extra: Record<string, number>;
} {
  const items: DetectedItem[] = [];
  const extra: Record<string, number> = {};
  for (const [key, quantity] of Object.entries(materials)) {
    const material = materialForGOODKey(key);
    if (material) {
      items.push({ id: material.id, name: material.name, quantity, rarity: material.rarity });
    } else {
      extra[key] = quantity;
    }
  }
  return { items, extra };
}
