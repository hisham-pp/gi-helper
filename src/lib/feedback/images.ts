/**
 * Image checks shared by the send form and the server. Uploads are identified
 * by their magic bytes, never by the declared type or file name, and only
 * types a browser can't run code from are allowed (no SVG).
 */

export const FEEDBACK_IMAGE_TYPES = ["image/webp", "image/jpeg", "image/png"] as const;
export type FeedbackImageType = (typeof FEEDBACK_IMAGE_TYPES)[number];

function startsWith(bytes: Uint8Array, signature: number[], offset = 0): boolean {
  return signature.every((byte, i) => bytes[offset + i] === byte);
}

/** The image type from the file's first bytes, or null for anything else. */
export function detectImageType(bytes: Uint8Array): FeedbackImageType | null {
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return "image/jpeg";
  // "RIFF" <size> "WEBP"
  if (startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) && startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8)) {
    return "image/webp";
  }
  return null;
}
