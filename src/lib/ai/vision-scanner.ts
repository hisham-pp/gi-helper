import { resolveMaterial } from "./material-matcher";
import { DetectedItem } from "@/lib/types";
import { getAiAdapter, RawExtractedItem, VisionScanOptions } from "./adapters";

export interface AiVisionScanResult {
  success: boolean;
  items: DetectedItem[];
  rawCount: number;
  error?: string;
}

/**
 * Process an inventory image using the chosen AI Vision adapter
 */
export async function executeAiVisionScan(
  imageData: string,
  providerId: string,
  options: VisionScanOptions,
): Promise<{ items: DetectedItem[]; rawCount: number }> {
  const adapter = getAiAdapter(providerId);
  const rawItems = await adapter.scanImage(imageData, options);
  return mapAiItemsToMaterials(rawItems);
}

/**
 * Process raw AI items and map them to canonical Genshin materials
 */
export function mapAiItemsToMaterials(rawItems: RawExtractedItem[]): {
  items: DetectedItem[];
  rawCount: number;
} {
  const detectedItems: DetectedItem[] = [];

  for (const raw of rawItems) {
    const rawNameOrId = raw.name || raw.id;
    if (!rawNameOrId) continue;

    let qty =
      typeof raw.quantity === "number"
        ? raw.quantity
        : parseInt(String(raw.quantity || 1), 10);
    if (isNaN(qty) || qty <= 0) qty = 1;

    const matched =
      resolveMaterial(rawNameOrId) || (raw.id ? resolveMaterial(raw.id) : null);

    if (matched) {
      detectedItems.push({
        id: matched.id,
        name: matched.name,
        quantity: qty,
        rarity: matched.rarity,
      });
    } else {
      // Fallback: create slugified ID
      const fallbackId = String(raw.id || rawNameOrId)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      detectedItems.push({
        id: fallbackId,
        name: raw.name || raw.id || "Unknown Material",
        quantity: qty,
      });
    }
  }

  return {
    items: detectedItems,
    rawCount: rawItems.length,
  };
}

/**
 * Test connection with the specified adapter
 */
export async function testAiApiConnection(
  providerId: string,
  options: VisionScanOptions,
): Promise<{ success: boolean; message: string }> {
  const adapter = getAiAdapter(providerId);
  return adapter.testConnection(options);
}
