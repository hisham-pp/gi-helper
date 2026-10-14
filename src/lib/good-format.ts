import { DetectedItem } from "./types";

/**
 * GOOD keys are the English name in PascalCase with only letters and digits:
 * apostrophes and quotes join their word ("Hero's Wit" → "HerosWit"), and any
 * other separator (space, hyphen, colon, dash) starts a new word
 * ("Ascended Sample: Knight" → "AscendedSampleKnight").
 */
export const toGOODFormatName = (name: string) => {
  return name
    .replace(/['‘’"“”]/g, "")
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
};

/** The GOOD document for the scanned materials. */
export const buildGOODData = (detectedItems: DetectedItem[]) => {
  const goodMaterials: Record<string, number> = {};

  detectedItems.forEach((item) => {
    goodMaterials[toGOODFormatName(item.name)] = item.quantity;
  });

  return {
    format: "GOOD",
    version: 2,
    source: "GenshinMaterialScanner",
    materials: goodMaterials,
  };
};

export const exportToGOODFormat = (detectedItems: DetectedItem[]) => {
  const goodData = buildGOODData(detectedItems);

  const blob = new Blob([JSON.stringify(goodData, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "inventory.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
