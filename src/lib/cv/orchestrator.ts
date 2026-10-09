import { sliceGridFromImage } from "./grid-detector";
import { calculateDHash } from "./image-hasher";
import { findBestMatch } from "./item-matcher";
import { DetectedItem } from "@/lib/types";
import Tesseract from "tesseract.js";

export async function processInventoryImages(
  files: FileList | File[],
  config: import('./grid-detector').GridConfig,
  onProgress: (progress: number, currentFileIndex: number, totalFiles: number) => void
): Promise<DetectedItem[]> {
  const fileArray = Array.from(files);
  const foundItems: Record<string, DetectedItem> = {};

  // Initialize a single reusable worker for faster performance
  const worker = await Tesseract.createWorker("eng");
  await worker.setParameters({
    tessedit_char_whitelist: '0123456789',
  });

  for (let i = 0; i < fileArray.length; i++) {
    const file = fileArray[i];
    
    // Slice image into grid cells
    const cells = await sliceGridFromImage(file, config);
    let cellIndex = 0;

    for (const cell of cells) {
      // 1. Image Recognition
      const hash = await calculateDHash(cell.icon);
      const match = findBestMatch(hash);

      if (match) {
        // 2. Quantity OCR (only if we found a match)
        let quantity = 1;
        try {
          // Convert ImageBitmap to Canvas for Tesseract
          const canvas = document.createElement("canvas");
          canvas.width = cell.quantityArea.width;
          canvas.height = cell.quantityArea.height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(cell.quantityArea, 0, 0);
            
            // Fast OCR using the initialized worker
            const result = await worker.recognize(canvas);
            const text = result.data.text.trim().replace(/[^0-9]/g, '');
            if (text) {
               quantity = parseInt(text, 10) || 1;
            }
          }
        } catch (e) {
          console.warn("Failed to read quantity for", match.name, e);
        }

        if (foundItems[match.id]) {
          foundItems[match.id].quantity += quantity;
        } else {
          foundItems[match.id] = {
            id: match.id,
            name: match.name,
            quantity
          };
        }
      }

      cellIndex++;
      // Calculate overall progress across files and cells
      const baseProgress = (i / fileArray.length) * 100;
      const cellProgress = (cellIndex / cells.length) * (100 / fileArray.length);
      onProgress(Math.min(100, Math.round(baseProgress + cellProgress)), i + 1, fileArray.length);
    }
  }

  await worker.terminate();
  return Object.values(foundItems);
}
