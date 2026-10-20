"use client";

import { createLocalStore, readArray } from "@/lib/storage/local-store";
import { useScannerInventory } from "@gi/scanner";
import { buildGOODDocument, hasMainStat } from "./export";
import type { GoodCharacter, GoodDocument, OwnedArtifact, OwnedWeapon } from "./types";

/**
 * The rest of the inventory beside scanned materials (scanner-inventory.ts):
 * characters, weapons, artifacts and imported materials we don't catalog,
 * each in its own localStorage store. Filled by GOOD imports for now
 * (./good-import.ts), and by the scanners as they learn each kind. Light on
 * purpose (no catalogs, no zod): the database pages use these stores too.
 */

const EMPTY_RECORD: Record<string, number> = {};

const readRecord = (stored: unknown): Record<string, number> =>
  stored && typeof stored === "object" && !Array.isArray(stored)
    ? (stored as Record<string, number>)
    : EMPTY_RECORD;

const charactersStore = createLocalStore<GoodCharacter[]>("inventory_characters", [], readArray);
const weaponsStore = createLocalStore<OwnedWeapon[]>("inventory_weapons", [], readArray);
const artifactsStore = createLocalStore<OwnedArtifact[]>("inventory_artifacts", [], readArray);
const extraMaterialsStore = createLocalStore<Record<string, number>>(
  "inventory_extra_materials",
  EMPTY_RECORD,
  readRecord,
);

export const useOwnedCharacters = () => charactersStore.useValue();
export const useOwnedWeapons = () => weaponsStore.useValue();
export const useOwnedArtifacts = () => artifactsStore.useValue();
export const useExtraMaterials = () => extraMaterialsStore.useValue();

export const setOwnedCharacters = charactersStore.set;
/** The stored characters, read outside React (e.g. when a scan finishes). */
export const getOwnedCharacters = (): GoodCharacter[] => charactersStore.get();
export const setOwnedWeapons = weaponsStore.set;
export const setOwnedArtifacts = artifactsStore.set;
export const setExtraMaterials = extraMaterialsStore.set;

let nextId = 0;
/** A local id for a weapon or artifact (GOOD entries have none). */
export function newEntryId(prefix: "w" | "a"): string {
  nextId += 1;
  return `${prefix}-${Date.now().toString(36)}-${nextId.toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

/** Everything in the inventory, and its GOOD document for export. */
export function useGOODInventory() {
  const [materials] = useScannerInventory();
  const [extraMaterials] = useExtraMaterials();
  const [characters] = useOwnedCharacters();
  const [weapons] = useOwnedWeapons();
  const [artifacts] = useOwnedArtifacts();
  const counts = {
    materials: materials.length + Object.keys(extraMaterials).length,
    characters: characters.length,
    weapons: weapons.length,
    artifacts: artifacts.length,
    /** Scanned artifacts left out of exports until their main stat is set. */
    artifactsWithoutMainStat: artifacts.filter((a) => !hasMainStat(a)).length,
  };
  const buildDocument = (): GoodDocument =>
    buildGOODDocument({ materials, extraMaterials, characters, weapons, artifacts });
  return { counts, buildDocument };
}
