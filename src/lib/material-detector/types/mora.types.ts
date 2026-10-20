import type { PixelRect } from "../../grid-detector/types";

/**
 * A Mora count reading extracted from the bag header currency bar.
 */
export interface MoraReading {
  /** The Mora count, or null when the digits could not be read cleanly. */
  value: number | null;
  /** Raw recognised digit characters; "?" marks an unreadable glyph. */
  text: string;
  /** Center and radius of the golden Mora coin icon in original image pixels. */
  coin: { x: number; y: number; radius: number };
  /** Bounding box of the Mora header pill in original image pixels. */
  box: PixelRect;
  /** Confidence score between 0 and 1. */
  confidence: number;
  /** Scanned crop of the bag header Mora pill, if captured. */
  crop?: Blob | null;
}
