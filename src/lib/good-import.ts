"use client";

import type { ParsedGOOD } from "./good/document";
import { splitGOODMaterials } from "./good/materials";
import {
  newEntryId,
  setExtraMaterials,
  setOwnedArtifacts,
  setOwnedCharacters,
  setOwnedWeapons,
} from "./good-inventory";
import { setScannerInventory } from "./scanner-inventory";
import type { DetectedItem } from "./types";

export type ImportSection = "characters" | "weapons" | "artifacts" | "materials";

export interface ImportSummary {
  characters: number;
  weapons: number;
  artifacts: number;
  /** Catalog materials (both bag tabs). */
  materials: number;
  /** Other materials, kept by GOOD key. */
  extraMaterials: number;
}

/**
 * Applies the chosen sections of a GOOD file. Characters, weapons and
 * artifacts replace what's stored (a file is a snapshot of the account).
 * Material counts from the file overwrite those materials; materials the file
 * doesn't list are kept.
 */
export function applyGOODImport(data: ParsedGOOD, sections: Set<ImportSection>): ImportSummary {
  const summary: ImportSummary = {
    characters: 0,
    weapons: 0,
    artifacts: 0,
    materials: 0,
    extraMaterials: 0,
  };

  if (sections.has("characters") && data.characters) {
    setOwnedCharacters(data.characters);
    summary.characters = data.characters.length;
  }
  if (sections.has("weapons") && data.weapons) {
    setOwnedWeapons(data.weapons.map((w) => ({ ...w, id: newEntryId("w") })));
    summary.weapons = data.weapons.length;
  }
  if (sections.has("artifacts") && data.artifacts) {
    setOwnedArtifacts(data.artifacts.map((a) => ({ ...a, id: newEntryId("a") })));
    summary.artifacts = data.artifacts.length;
  }
  if (sections.has("materials") && data.materials) {
    const { items, extra } = splitGOODMaterials(data.materials);
    setScannerInventory((prev) => {
      const byId = new Map<string, DetectedItem>(prev.map((i) => [i.id, i]));
      for (const item of items) byId.set(item.id, item);
      return [...byId.values()];
    });
    setExtraMaterials((prev) => ({ ...prev, ...extra }));
    summary.materials = items.length;
    summary.extraMaterials = Object.keys(extra).length;
  }
  return summary;
}
