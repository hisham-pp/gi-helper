import type { EquipmentKind } from "../types/equipment.types";
import type { ScanStage } from "../types/orchestration.types";

export const EQUIPMENT_KINDS: readonly EquipmentKind[] = [
  "weapon",
  "artifact",
  "character",
];

/** Share of a single file's progress bar reached when each stage starts. */
export const STAGE_START_PROGRESS: Record<ScanStage, number> = {
  decoding: 0,
  detecting: 0.05,
  "loading-references": 0.2,
  recognizing: 0.25,
};

/** The Traveler's elements, as in GOOD keys ("TravelerAnemo"). */
export const TRAVELER_ELEMENTS = [
  "Anemo",
  "Geo",
  "Electro",
  "Dendro",
  "Hydro",
  "Pyro",
  "Cryo",
] as const;
