/**
 * Loads reference banks in the browser (Web Worker or main thread): each
 * kind's manifest and icon atlas from /data, decoded without colour
 * management so templates match the Node tests. Each bank is built once per
 * context, when a screenshot first needs it.
 */
import { ATLAS_FILES, createReferenceBank, type ReferenceBank, validateManifest } from "./engine/bank";
import { MaterialDetectionError, isMaterialDetectionError } from "./engine/errors";
import type { CardKind } from "./types";

export const ATLAS_MANIFEST_URL = ATLAS_FILES.material.manifest;
export const ATLAS_IMAGE_URL = ATLAS_FILES.material.image;

const pending = new Map<CardKind, Promise<ReferenceBank>>();

/**
 * An absolute URL on this site. In a worker a root-relative path resolves
 * against the worker script's URL, which is a blob: URL under Turbopack
 * (next dev --turbopack), so resolve against the page's origin instead.
 */
function siteUrl(path: string): string {
  return typeof location !== "undefined" && location.origin && location.origin !== "null"
    ? new URL(path, location.origin).href
    : path;
}

const unavailable = (cause?: unknown) => {
  const isOffline = typeof navigator !== "undefined" && navigator.onLine === false;
  const message = isOffline
    ? "Scanner reference data is not cached for offline use yet. Please connect to the internet once to download and cache the reference atlases."
    : "The scanner's reference data could not be loaded. Check your connection and try again.";
  return new MaterialDetectionError("REFERENCES_UNAVAILABLE", message, cause);
};

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

async function load(kind: CardKind): Promise<ReferenceBank> {
  const files = ATLAS_FILES[kind];
  let manifestJson: unknown;
  try {
    const res = await fetch(siteUrl(files.manifest));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    manifestJson = await res.json();
  } catch (err) {
    throw unavailable(err);
  }
  const manifest = validateManifest(manifestJson);
  let pixels: ImageData;
  try {
    // The hash makes the (immutable) atlas cacheable across deployments.
    const res = await fetch(siteUrl(`${files.image}?v=${encodeURIComponent(manifest.hash)}`));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    pixels = await readPixels(await res.blob());
  } catch (err) {
    throw unavailable(err);
  }
  return createReferenceBank(manifest, pixels);
}

/** A kind's reference bank for this context; retried on the next call after a failure. */
export function loadReferenceBank(kind: CardKind = "material"): Promise<ReferenceBank> {
  let bank = pending.get(kind);
  if (!bank) {
    bank = load(kind).catch((err) => {
      pending.delete(kind);
      throw isMaterialDetectionError(err) ? err : unavailable(err);
    });
    pending.set(kind, bank);
  }
  return bank;
}

/** The banks for some kinds, by kind. */
export async function loadReferenceBanks(kinds: Iterable<CardKind>): Promise<Partial<Record<CardKind, ReferenceBank>>> {
  const unique = [...new Set(kinds)];
  const banks = await Promise.all(unique.map((k) => loadReferenceBank(k)));
  return Object.fromEntries(unique.map((k, i) => [k, banks[i]]));
}
