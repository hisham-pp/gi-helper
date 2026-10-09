export async function calculateDHash(imageBitmap: ImageBitmap): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = 9;
  canvas.height = 8;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Failed to get canvas context");

  // Draw the image scaled down to 9x8
  ctx.drawImage(imageBitmap, 0, 0, 9, 8);
  const imageData = ctx.getImageData(0, 0, 9, 8).data;

  // Convert to grayscale
  const grays = new Uint8Array(9 * 8);
  for (let i = 0; i < imageData.length; i += 4) {
    // Luminance formula
    grays[i / 4] = imageData[i] * 0.299 + imageData[i + 1] * 0.587 + imageData[i + 2] * 0.114;
  }

  // Calculate hash by comparing adjacent pixels in each row
  let hash = "";
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const idx = y * 9 + x;
      // If left pixel is brighter than right pixel, bit is 1, else 0
      hash += grays[idx] > grays[idx + 1] ? "1" : "0";
    }
  }

  // Convert binary string to hex
  let hexHash = "";
  for (let i = 0; i < hash.length; i += 4) {
    hexHash += parseInt(hash.slice(i, i + 4), 2).toString(16);
  }

  return hexHash;
}

export function hammingDistance(hash1: string, hash2: string): number {
  let distance = 0;
  for (let i = 0; i < hash1.length; i++) {
    const val1 = parseInt(hash1[i], 16);
    const val2 = parseInt(hash2[i], 16);
    let xor = val1 ^ val2;
    while (xor > 0) {
      distance += xor & 1;
      xor >>= 1;
    }
  }
  return distance;
}
