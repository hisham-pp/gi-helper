import type { ArtifactPanelCapture } from "./engine/capture";
import type { SlotHighlight } from "./engine/selection";

/**
 * The artifact detail panel as the scan worker finds it next to the grid:
 * the capture (fields ready for OCR, stars, lock) and how highlighted each
 * card of the artifact grid looks, to tell which one the panel describes.
 * Coordinates are in the screenshot's own pixels.
 */
export interface ArtifactPanelScan extends ArtifactPanelCapture {
  highlights: SlotHighlight[];
}
