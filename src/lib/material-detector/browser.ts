/**
 * Loads the reference bank in the browser (Web Worker or main thread): the
 * manifest and the icon atlas from /data, decoded without colour management
 * so templates match the Node tests. The bank is built once per context.
 */
import { createReferenceBank, type ReferenceBank, validateManifest } from "./engine/bank";
import { MaterialDetectionError, isMaterialDetectionError } from "./engine/errors";

export const ATLAS_MANIFEST_URL = "/data/material-atlas.json";
export const ATLAS_IMAGE_URL = "/data/material-atlas.png";

let pending: Promise<ReferenceBank> | null = null;

const unavailable = (cause?: unknown) =>
  new MaterialDetectionError(
    "REFERENCES_UNAVAILABLE",
    "The material reference data could not be loaded. Check your connection and try again.",
    cause,
  );

async function readPixels(blob: Blob) {
  const bitmap = await createImageBitmap(blob, { colorSpaceConversion: "none", premultiplyAlpha: "none" });
  try {
    const { width, height } = bitmap;
    const canvas =
      typeof OffscreenCanvas !== "undefined"
        ? new OffscreenCanvas(width, height)
        : Object.assign(document.createElement("canvas"), { width, height });
    const ctx = canvas.getContext("2d", { willReadFrequently: true }) as
      | OffscreenCanvasRenderingContext2D
      | CanvasRenderingContext2D
      | null;
    if (!ctx) throw new Error("2D canvas unavailable");
    ctx.drawImage(bitmap, 0, 0);
    const data = ctx.getImageData(0, 0, width, height);
    canvas.width = 0;
    canvas.height = 0;
    return data;
  } finally {
    bitmap.close();
  }
}

async function load(): Promise<ReferenceBank> {
  let manifestJson: unknown;
  try {
    const res = await fetch(ATLAS_MANIFEST_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    manifestJson = await res.json();
  } catch (err) {
    throw unavailable(err);
  }
  const manifest = validateManifest(manifestJson);
  let pixels: ImageData;
  try {
    // The hash makes the (immutable) atlas cacheable across deployments.
    const res = await fetch(`${ATLAS_IMAGE_URL}?v=${encodeURIComponent(manifest.hash)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    pixels = await readPixels(await res.blob());
  } catch (err) {
    throw unavailable(err);
  }
  return createReferenceBank(manifest, pixels);
}

/** The reference bank for this context; retried on the next call after a failure. */
export function loadReferenceBank(): Promise<ReferenceBank> {
  pending ??= load().catch((err) => {
    pending = null;
    throw isMaterialDetectionError(err) ? err : unavailable(err);
  });
  return pending;
}
