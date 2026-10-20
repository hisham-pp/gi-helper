import type { DetectedItem } from "@gi/scanner";
import { buildGOODDocument } from "./export";
import { toGOODKey } from "./keys";
import type { GoodDocument } from "./types";

/** GOOD key of a material name (see toGOODKey). */
export const toGOODFormatName = (name: string) => toGOODKey(name);

/** The GOOD document for scanned materials alone. */
export const buildGOODData = (detectedItems: DetectedItem[]) =>
  buildGOODDocument({
    materials: detectedItems,
    extraMaterials: {},
    characters: [],
    weapons: [],
    artifacts: [],
  });

/** Saves a GOOD document as a JSON file. */
export function downloadGOOD(doc: GoodDocument, fileName = "inventory.json"): void {
  const blob = new Blob([JSON.stringify(doc, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export const exportToGOODFormat = (detectedItems: DetectedItem[]) =>
  downloadGOOD(buildGOODData(detectedItems));
