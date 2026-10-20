import type { RgbaImage } from "../types";
import { MIN_IMAGE_SIDE, MAX_IMAGE_SIDE, MAX_IMAGE_PIXELS } from "../const";
import { DetectionError } from "./errors.utils";

export function validateRgbaImage(image: RgbaImage): void {
  const { width, height, data } = image;
  if (
    !Number.isInteger(width) ||
    !Number.isInteger(height) ||
    width <= 0 ||
    height <= 0
  ) {
    throw new DetectionError(
      "INVALID_IMAGE",
      "The image has invalid dimensions.",
    );
  }
  if (width < MIN_IMAGE_SIDE || height < MIN_IMAGE_SIDE) {
    throw new DetectionError(
      "IMAGE_TOO_SMALL",
      `Image is too small (${width}×${height}). Minimum dimension is ${MIN_IMAGE_SIDE}px.`,
    );
  }
  if (width > MAX_IMAGE_SIDE || height > MAX_IMAGE_SIDE) {
    throw new DetectionError(
      "IMAGE_TOO_LARGE",
      `Image is too large (${width}×${height}). Maximum dimension is ${MAX_IMAGE_SIDE}px.`,
    );
  }
  if (width * height > MAX_IMAGE_PIXELS) {
    throw new DetectionError(
      "IMAGE_TOO_LARGE",
      `Image has too many pixels (${width}×${height}).`,
    );
  }
  const expectedBytes = width * height * 4;
  if (data.length !== expectedBytes) {
    throw new DetectionError(
      "INVALID_IMAGE",
      `Pixel buffer length (${data.length}) does not match dimensions ${width}×${height}×4 = ${expectedBytes}.`,
    );
  }
}
