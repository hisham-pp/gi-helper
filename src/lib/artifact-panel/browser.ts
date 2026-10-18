/**
 * Reading artifact detail panels in the browser. Tesseract (≈3 MB of
 * WebAssembly plus ≈3 MB of English or ≈2 MB of Chinese language data) is
 * served from our own /ocr/ folder, copied out of the pinned npm packages
 * by scripts/copy-ocr-assets.mjs, and only downloaded once a scan actually
 * shows a panel. Import this module dynamically.
 */
import { createTesseractOcr, type PanelOcr } from "./ocr";
import { readArtifactPanel, type ArtifactPanelReading } from "./read";
import type { ArtifactPanelCapture } from "./engine/capture";
import type { PanelLanguage } from "./engine/vocabulary";

export const OCR_BASE = "/ocr";

let ocr: PanelOcr | null = null;
/** The game language of the last panel read: recordings and batches are in one language. */
let lastLanguage: PanelLanguage = "en";

function getOcr(): PanelOcr {
  ocr ??= createTesseractOcr({
    workerPath: `${OCR_BASE}/worker.min.js`,
    corePath: OCR_BASE,
    langPath: () => OCR_BASE,
  });
  return ocr;
}

/** Reads a panel captured by the scan worker; null when it isn't an artifact's. */
export async function readPanel(capture: ArtifactPanelCapture): Promise<ArtifactPanelReading | null> {
  const reading = await readArtifactPanel(capture, getOcr(), { preferLanguage: lastLanguage });
  if (reading) lastLanguage = reading.language;
  return reading;
}

/** Stops the OCR workers (they hold ~100 MB); the next panel starts them again. */
export async function releasePanelReader(): Promise<void> {
  const current = ocr;
  ocr = null;
  await current?.dispose();
}
