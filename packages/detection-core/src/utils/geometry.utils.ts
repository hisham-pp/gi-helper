import type { PixelRect, Point } from "../types";

export function clampRect(rect: PixelRect, maxWidth: number, maxHeight: number): PixelRect {
  const x = Math.max(0, Math.min(rect.x, maxWidth));
  const y = Math.max(0, Math.min(rect.y, maxHeight));
  const width = Math.max(0, Math.min(rect.width, maxWidth - x));
  const height = Math.max(0, Math.min(rect.height, maxHeight - y));
  return { x, y, width, height };
}

export function rectContainsPoint(rect: PixelRect, point: Point): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

export function rectIntersection(a: PixelRect, b: PixelRect): PixelRect | null {
  const x = Math.max(a.x, b.x);
  const y = Math.max(a.y, b.y);
  const width = Math.min(a.x + a.width, b.x + b.width) - x;
  const height = Math.min(a.y + a.height, b.y + b.height) - y;
  if (width <= 0 || height <= 0) return null;
  return { x, y, width, height };
}

export function rectArea(rect: PixelRect): number {
  return Math.max(0, rect.width) * Math.max(0, rect.height);
}

export function rectOverlap(a: PixelRect, b: PixelRect): number {
  const inter = rectIntersection(a, b);
  if (!inter) return 0;
  const areaInter = rectArea(inter);
  const areaUnion = rectArea(a) + rectArea(b) - areaInter;
  return areaUnion > 0 ? areaInter / areaUnion : 0;
}
