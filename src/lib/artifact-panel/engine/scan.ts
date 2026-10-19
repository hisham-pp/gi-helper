/**
 * The scan worker's part: capture the detail panel of a screenshot or frame
 * (if it shows one) and score the artifact grid's cards for the selection
 * highlight. The OCR happens later, outside the worker (see ../read.ts).
 */
import type { RgbaImage } from "../../grid-detector/engine/image";
import type { DetectedGrid, PixelRect } from "../../grid-detector/types";
import type { GridKindReading } from "../../material-detector/types";
import type { ArtifactPanelScan } from "../types";
import { captureArtifactPanel } from "./capture";
import { slotHighlights } from "./selection";

const scaleRect = (r: PixelRect, s: number): PixelRect => ({ x: r.x * s, y: r.y * s, width: r.width * s, height: r.height * s });

/**
 * @param image the analysed raster (the screenshot at full resolution, or
 *   downscaled for very large ones)
 * @param toSource screenshot pixels per raster pixel
 * @param grids detected grids, in screenshot pixels
 * @param kinds each grid's kind: only artifact grids are scored
 */
export function capturePanelScan(
  image: RgbaImage,
  toSource: number,
  grids: readonly DetectedGrid[],
  kinds: readonly GridKindReading[],
): ArtifactPanelScan | null {
  const capture = captureArtifactPanel(image);
  if (!capture) return null;
  const equipmentGrids = grids
    .filter((g) => {
      const k = kinds.find((entry) => entry.gridId === g.id)?.kind;
      return k === "artifact" || k === "weapon";
    })
    .map((g) =>
      toSource === 1
        ? g
        : {
            ...g,
            cards: g.cards.map((c) => ({ ...c, ...scaleRect(c, 1 / toSource) })),
            emptySlots: g.emptySlots.map((s) => ({ ...s, ...scaleRect(s, 1 / toSource) })),
          },
    );
  const highlights = slotHighlights(image, equipmentGrids).map((h) => ({ ...h, box: scaleRect(h.box, toSource) }));
  return { ...capture, bounds: scaleRect(capture.bounds, toSource), highlights };
}
