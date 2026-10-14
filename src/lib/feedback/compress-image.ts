"use client";

/** Images larger than this are refused before decoding. */
const MAX_SOURCE_BYTES = 25 * 1024 * 1024;
/** Upload target per image; the server allows a little more. */
const TARGET_BYTES = 1024 * 1024;
/** Longest side and quality, tried in order until the image fits. */
const ATTEMPTS: [edge: number, quality: number][] = [
  [1600, 0.85],
  [1280, 0.78],
  [960, 0.7],
];

function encode(
  bitmap: ImageBitmap,
  width: number,
  height: number,
  type: "image/webp" | "image/jpeg",
  quality: number,
): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.resolve(null);
  if (type === "image/jpeg") {
    // JPEG has no transparency; keep see-through areas white, not black
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, width, height);
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

/**
 * Shrinks a picked or pasted image for upload: longest side at most 1600 px,
 * re-encoded as WebP (JPEG where the browser can't write WebP, e.g. Safari).
 * Re-encoding also drops EXIF data such as the GPS location.
 */
export async function compressFeedbackImage(file: Blob): Promise<Blob> {
  if (file.size > MAX_SOURCE_BYTES) {
    throw new Error("That image is over 25 MB.");
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("Couldn't read that image. Try a PNG, JPEG or WebP.");
  }

  try {
    for (const [edge, quality] of ATTEMPTS) {
      const scale = Math.min(1, edge / Math.max(bitmap.width, bitmap.height));
      const width = Math.max(1, Math.round(bitmap.width * scale));
      const height = Math.max(1, Math.round(bitmap.height * scale));

      let blob = await encode(bitmap, width, height, "image/webp", quality);
      // Browsers without a WebP encoder silently return PNG
      if (!blob || blob.type !== "image/webp") {
        blob = await encode(bitmap, width, height, "image/jpeg", quality);
      }
      if (blob && blob.size <= TARGET_BYTES) return blob;
    }
  } finally {
    bitmap.close();
  }

  throw new Error("That image is too detailed to upload, even after shrinking it.");
}
