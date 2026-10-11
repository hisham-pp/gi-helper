import {
  sliceGridFromImage,
  GridConfig,
  isSingleItemImage,
} from "./grid-detector";
import {
  calculateFingerprint,
  isEmptyCell,
  getCellStats,
} from "./image-hasher";
import { findBestMatch } from "./item-matcher";
import { detectCellRarity } from "./rarity-detector";
import materialsData from "@/data/materials.json";
import {
  DetectedItem,
  ScannedReviewItem,
  ProcessScanResult,
} from "@/lib/types";
import Tesseract from "tesseract.js";

function cellBitmapToDataUrl(bitmap: ImageBitmap): string {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(bitmap, 0, 0);
      return canvas.toDataURL("image/png");
    }
  } catch (e) {
    console.warn("Failed to generate image snippet for cell", e);
  }
  return "";
}

export async function processInventoryImages(
  files: FileList | File[],
  config: GridConfig | (GridConfig | null)[] | null,
  onProgress: (
    progress: number,
    currentFileIndex: number,
    totalFiles: number,
  ) => void,
  options?: {
    continueOrder?: boolean;
  },
): Promise<ProcessScanResult> {
  const fileArray = Array.from(files);
  const foundItems: Record<string, DetectedItem> = {};
  const reviewItems: ScannedReviewItem[] = [];

  // Initialize a single reusable worker for faster performance
  const worker = await Tesseract.createWorker("eng");
  await worker.setParameters({
    tessedit_char_whitelist: "0123456789",
  });

  let previousMatchName: string | null = null;

  // Order-constraint state tracked across cells (and optionally across files)
  let lastMatchedOrder = 0;
  let lastBlockId: string | null = null;

  for (let i = 0; i < fileArray.length; i++) {
    const file = fileArray[i];

    // Reset order state at the start of each file unless the caller explicitly
    // asked to continue the order sequence across files (continueOrder: true).
    // The first file always resets regardless of continueOrder.
    if (i === 0 || !options?.continueOrder) {
      lastMatchedOrder = 0;
      lastBlockId = null;
    }

    // Determine config for this image: if array of configs, pick config[i], else single config
    const activeConfig = Array.isArray(config) ? config[i] || null : config;

    // Detect whether this file is a single-item crop (small/portrait image).
    // For single-item crops we skip the order constraint so the matcher is unconstrained.
    const bitmap = await createImageBitmap(file);
    const isSingleItem = isSingleItemImage(bitmap.width, bitmap.height);
    bitmap.close();

    // Slice image into grid cells
    const cells = await sliceGridFromImage(file, activeConfig || undefined);
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

      // 3. Image Recognition (with rarity weighting and contextual sibling boosting)
      const fingerprint = await calculateFingerprint(cell.icon);
      const match = findBestMatch(fingerprint, {
        expectedRarity: cellRarity.rarity,
        minConfidence: 0.55,
        neighborNames: previousMatchName ? [previousMatchName] : undefined,
        orderConstraint: isSingleItem
          ? undefined
          : { minOrder: lastMatchedOrder, blockId: lastBlockId },
      });

      if (match) {
        previousMatchName = match.name;

        // Update order-constraint state after a non-null match.
        // Rules:
        //  1. If constraintRelaxed → do NOT update state (preserve last valid position).
        //  2. If not relaxed AND blockId changed → advance lastMatchedOrder and lastBlockId.
        //  3. If not relaxed AND same block peer (blockId unchanged) → do NOT update state.
        if (!match.constraintRelaxed && match.blockId !== lastBlockId) {
          lastMatchedOrder = match.order ?? lastMatchedOrder;
          lastBlockId = match.blockId;
        }

        // Look up material metadata (such as true rarity)
        const material = materialsData.find((m) => m.id === match.id);
        const itemRarity = material?.rarity ?? cellRarity.rarity ?? undefined;

        // 4. Quantity OCR (only if we found a match)
        const MIN_OCR_HEIGHT = 64;
        let quantity = 1;
        try {
          // Convert ImageBitmap to Canvas for Tesseract
          const canvas = document.createElement("canvas");
          const nativeW = cell.quantityArea.width;
          const nativeH = cell.quantityArea.height;
          // Upscale small quantity regions so Tesseract can read digits reliably.
          // At 2800×1272 the region is only ~29px tall; Tesseract needs ≥40px.
          const ocrScale =
            nativeH < MIN_OCR_HEIGHT ? Math.ceil(MIN_OCR_HEIGHT / nativeH) : 1;
          canvas.width = nativeW * ocrScale;
          canvas.height = nativeH * ocrScale;
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          if (ctx) {
            ctx.imageSmoothingEnabled = false; // nearest-neighbor: keeps digit edges sharp
            ctx.drawImage(cell.quantityArea, 0, 0, canvas.width, canvas.height);

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
                data[i] = 0; // R
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

        // Capture image snippet for the review modal
        const snippetUrl = cellBitmapToDataUrl(cell.cellBitmap);
        reviewItems.push({
          id: `${i}-${cell.row}-${cell.col}-${cellIndex}`,
          materialId: match.id,
          name: match.name,
          quantity,
          rarity: itemRarity,
          imageSnippet: snippetUrl,
          sourceImageName: file.name,
          row: cell.row,
          col: cell.col,
        });
      } else {
        // If it was not empty but didn't match anything, we break the chain
        previousMatchName = null;
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
  return {
    items: Object.values(foundItems),
    reviewItems,
  };
}
