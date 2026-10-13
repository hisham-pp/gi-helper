/**
 * Browser-side helpers shared by the detection Web Worker and the main-thread
 * fallback: decoding, rasterising for analysis, and cropping detected cards
 * at original quality. Nothing here depends on React.
 */
import type { DetectionInput } from "./engine/detect";
import { GridDetectionError } from "./engine/errors";
import { computeAnalysisSize } from "./engine/image";
import type { DetectionSettings, PixelRect } from "./types";
import { validateImageDimensions, validateImageFile } from "./validation";

type AnyCanvas = OffscreenCanvas | HTMLCanvasElement;
type AnyContext = OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;

function createCanvas(width: number, height: number): AnyCanvas {
  if (typeof OffscreenCanvas !== "undefined") return new OffscreenCanvas(width, height);
  if (typeof document !== "undefined") {
    const c = document.createElement("canvas");
    c.width = width;
    c.height = height;
    return c;
  }
  throw new GridDetectionError("PROCESSING_FAILED", "Image processing is not available in this browser.");
}

function context2d(canvas: AnyCanvas): AnyContext {
  const ctx = canvas.getContext("2d", { willReadFrequently: true }) as AnyContext | null;
  if (!ctx) {
    throw new GridDetectionError("PROCESSING_FAILED", "Could not create a canvas for image processing.");
  }
  return ctx;
}

/** Frees the canvas backing store right away instead of waiting for GC. */
function releaseCanvas(canvas: AnyCanvas) {
  canvas.width = 0;
  canvas.height = 0;
}

/** Validates and decodes an uploaded image. The caller owns (and must close) the bitmap. */
export async function decodeImage(blob: Blob, name?: string): Promise<ImageBitmap> {
  validateImageFile({ type: blob.type, size: blob.size, name });
  let bitmap: ImageBitmap;
  try {
    // Analyse the encoded pixel values. Colour management (e.g. a phone's
    // Display-P3 profile) would make results depend on the browser/display
    // and differ from the Node test harness.
    bitmap = await createImageBitmap(blob, { colorSpaceConversion: "none", premultiplyAlpha: "none" });
  } catch (err) {
    throw new GridDetectionError(
      "DECODE_FAILED",
      "The image could not be read. It may be corrupt or in an unsupported format.",
      err,
    );
  }
  try {
    validateImageDimensions(bitmap.width, bitmap.height);
  } catch (err) {
    bitmap.close();
    throw err;
  }
  return bitmap;
}

function clipRegion(region: PixelRect | null, w: number, h: number): PixelRect {
  if (!region) return { x: 0, y: 0, width: w, height: h };
  const x = Math.max(0, Math.min(w, Math.round(region.x)));
  const y = Math.max(0, Math.min(h, Math.round(region.y)));
  const x1 = Math.max(0, Math.min(w, Math.round(region.x + region.width)));
  const y1 = Math.max(0, Math.min(h, Math.round(region.y + region.height)));
  if (x1 - x < 16 || y1 - y < 16) {
    throw new GridDetectionError("INVALID_REGION", "The selected region is empty or too small to analyse.");
  }
  return { x, y, width: x1 - x, height: y1 - y };
}

/**
 * Pixel budget for reading the image at native resolution. Typical
 * screenshots (up to 4K) stay below it, so the engine's own area-average
 * resampler does the downscaling — identical to the Node tests, unlike the
 * browser's bilinear canvas smoothing, which can tip borderline cards.
 */
const NATIVE_PIXEL_BUDGET = 16_000_000;

/**
 * Draws the (region of interest of the) image once and reads its pixels.
 * Huge images are pre-reduced on the canvas to twice the analysis size only,
 * leaving the final reduction to the engine.
 */
export function rasterizeForDetection(
  bitmap: ImageBitmap,
  settings: Pick<DetectionSettings, "region" | "maxAnalysisSide">,
): DetectionInput {
  const region = clipRegion(settings.region, bitmap.width, bitmap.height);
  const size =
    region.width * region.height <= NATIVE_PIXEL_BUDGET
      ? { width: region.width, height: region.height }
      : computeAnalysisSize(region.width, region.height, settings.maxAnalysisSide * 2);
  const canvas = createCanvas(size.width, size.height);
  try {
    const ctx = context2d(canvas);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, region.x, region.y, region.width, region.height, 0, 0, size.width, size.height);
    const image = ctx.getImageData(0, 0, size.width, size.height);
    return { image, source: { width: bitmap.width, height: bitmap.height, region } };
  } finally {
    releaseCanvas(canvas);
  }
}

/** Crops one card at full original resolution. */
export function cropToBitmap(bitmap: ImageBitmap, rect: PixelRect): Promise<ImageBitmap> {
  const r = clipRegion(rect, bitmap.width, bitmap.height);
  return createImageBitmap(bitmap, r.x, r.y, r.width, r.height);
}

/** Crops one card at full original resolution and encodes it (PNG by default, lossless). */
export async function cropToBlob(
  bitmap: ImageBitmap,
  rect: PixelRect,
  type: "image/png" | "image/webp" | "image/jpeg" = "image/png",
): Promise<Blob> {
  const r = clipRegion(rect, bitmap.width, bitmap.height);
  const canvas = createCanvas(r.width, r.height);
  try {
    context2d(canvas).drawImage(bitmap, r.x, r.y, r.width, r.height, 0, 0, r.width, r.height);
    if ("convertToBlob" in canvas) return await canvas.convertToBlob({ type });
    return await new Promise<Blob>((resolve, reject) =>
      (canvas as HTMLCanvasElement).toBlob(
        (b) => (b ? resolve(b) : reject(new GridDetectionError("PROCESSING_FAILED", "Could not encode the crop."))),
        type,
      ),
    );
  } finally {
    releaseCanvas(canvas);
  }
}
