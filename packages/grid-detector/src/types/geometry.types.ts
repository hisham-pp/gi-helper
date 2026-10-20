/**
 * Basic geometric primitives for pixel-space coordinates.
 * All coordinates represent original image pixels unless explicitly noted.
 */

export interface PixelRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}
