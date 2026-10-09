import materialsData from "@/data/materials.json";
import { DetectedItem } from "./types";

export const parseScannedText = (
  text: string, 
  existingItems: DetectedItem[]
): DetectedItem[] => {
  const foundMap = new Map<string, DetectedItem>();
  
  // Add existing items to map first to merge results
  existingItems.forEach(item => {
    foundMap.set(item.id, { ...item });
  });

  const textLower = text.toLowerCase();

  for (const material of materialsData) {
    const nameLower = material.name.toLowerCase();
    if (textLower.includes(nameLower)) {
      const index = textLower.indexOf(nameLower);
      const surroundingText = textLower.substring(
        Math.max(0, index - 20), 
        Math.min(textLower.length, index + nameLower.length + 20)
      );
      const numbers = surroundingText.match(/\\d+/g);
      
      let quantity = 1;
      if (numbers && numbers.length > 0) {
         quantity = parseInt(numbers[0], 10);
      }

      if (foundMap.has(material.id)) {
         foundMap.get(material.id)!.quantity += quantity;
      } else {
         foundMap.set(material.id, { id: material.id, name: material.name, quantity });
      }
    }
  }

  return Array.from(foundMap.values());
};
