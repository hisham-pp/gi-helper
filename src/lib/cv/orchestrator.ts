import { sliceGridFromImage, GridConfig } from "./grid-detector";
import { calculateFingerprint, isEmptyCell, getCellStats } from "./image-hasher";
import { findBestMatch } from "./item-matcher";
import { detectCellRarity } from "./rarity-detector";
import materialsData from "@/data/materials.json";
import { DetectedItem } from "@/lib/types";
import Tesseract from "tesseract.js";

export async function processInventoryImages(
  files: FileList | File[],
  config: GridConfig | null,
  onProgress: (
    progress: number,
    currentFileIndex: number,
    totalFiles: number,
  ) => void,
): Promise<DetectedItem[]> {
  const fileArray = Array.from(files);
  const foundItems: Record<string, DetectedItem> = {};

  // Initialize a single reusable worker for faster performance
  const worker = await Tesseract.createWorker("eng");
  await worker.setParameters({
    tessedit_char_whitelist: "0123456789",
  });

  for (let i = 0; i < fileArray.length; i++) {
    const file = fileArray[i];

    // Slice image into grid cells
    const cells = await sliceGridFromImage(file, config || undefined);
    let cellIndex = 0;

    for (const cell of cells) {
      // 1. Skip blank slots (partial last row, empty inventory pages)
      if (isEmptyCell(cell.icon)) continue;

      // 1b. Skip cut-off/incomplete cells by checking if the quantity area
      // contains any text. A valid item always has a quantity number (high variance).
      // A cut-off cell falls on the solid UI background (low variance).
      const qtyStats = getCellStats(cell.quantityArea, 10);
      if (qtyStats.isEmpty) continue;

      // 2. Rarity & Star Detection
      const cellRarity = detectCellRarity(cell.cellBitmap);

      // 3. Image Recognition (with rarity weighting)
      const fingerprint = await calculateFingerprint(cell.icon);
      const match = findBestMatch(fingerprint, {
        expectedRarity: cellRarity.rarity,
        minConfidence: 0.55,
      });

      if (match) {
        // Look up material metadata (such as true rarity)
        const material = materialsData.find((m) => m.id === match.id);
        const itemRarity = material?.rarity ?? cellRarity.rarity ?? undefined;

        // 4. Quantity OCR (only if we found a match)
        let quantity = 1;
        try {
          // Convert ImageBitmap to Canvas for Tesseract
          const canvas = document.createElement("canvas");
          canvas.width = cell.quantityArea.width;
          canvas.height = cell.quantityArea.height;
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          if (ctx) {
            ctx.drawImage(cell.quantityArea, 0, 0);

            // Pre-process for Tesseract: Black text on White background
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imgData.data;
            for (let i = 0; i < data.length; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              const luminance = r * 0.299 + g * 0.587 + b * 0.114;
              
              // Genshin's quantity text is bright white with a dark shadow.
              // We turn bright pixels BLACK (for Tesseract), and everything else WHITE.
              if (luminance > 160) {
                data[i] = 0;     // R
                data[i + 1] = 0; // G
                data[i + 2] = 0; // B
              } else {
                data[i] = 255;
                data[i + 1] = 255;
                data[i + 2] = 255;
              }
            }
            ctx.putImageData(imgData, 0, 0);

            // Fast OCR using the initialized worker
            const result = await worker.recognize(canvas);
            const text = result.data.text.trim().replace(/[^0-9]/g, "");
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
            quantity,
            rarity: itemRarity,
          };
        }
      }

      cellIndex++;
      // Calculate overall progress across files and cells
      const baseProgress = (i / fileArray.length) * 100;
      const cellProgress =
        (cellIndex / cells.length) * (100 / fileArray.length);
      onProgress(
        Math.min(100, Math.round(baseProgress + cellProgress)),
        i + 1,
        fileArray.length,
      );
    }
  }

  await worker.terminate();
  return Object.values(foundItems);
}
