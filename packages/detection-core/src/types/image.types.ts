/** Minimal RGBA buffer contract — satisfied by browser `ImageData` and Jimp bitmaps. */
export interface RgbaImage {
  width: number;
  height: number;
  data: Uint8ClampedArray | Uint8Array;
}
