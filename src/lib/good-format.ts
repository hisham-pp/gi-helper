import { DetectedItem } from "./types";

export const toGOODFormatName = (name: string) => {
  return name
    .replace(/['"-]/g, '')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
};

export const exportToGOODFormat = (detectedItems: DetectedItem[]) => {
  const goodMaterials: Record<string, number> = {};
  
  detectedItems.forEach(item => {
    goodMaterials[toGOODFormatName(item.name)] = item.quantity;
  });

  const goodData = {
    format: "GOOD",
    version: 2,
    source: "GenshinMaterialScanner",
    materials: goodMaterials
  };

  const blob = new Blob([JSON.stringify(goodData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "inventory.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
