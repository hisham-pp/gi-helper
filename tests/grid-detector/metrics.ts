/**
 * Detection accuracy metrics: greedy one-to-one matching of predicted card
 * boxes to ground-truth boxes by IoU.
 */
import type { GridDetectionResult, PixelRect } from "../../src/lib/grid-detector";

export function iou(a: PixelRect, b: PixelRect): number {
  const ix = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
  const iy = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
  if (ix <= 0 || iy <= 0) return 0;
  const inter = ix * iy;
  return inter / (a.width * a.height + b.width * b.height - inter);
}

export interface MatchReport {
  truePositives: number;
  falsePositives: number;
  falseNegatives: number;
  precision: number;
  recall: number;
  /** Mean IoU over matched pairs. */
  meanIoU: number;
  /** Largest corner offset (px) over matched pairs. */
  maxCornerError: number;
}

export function matchBoxes(predicted: PixelRect[], truth: PixelRect[], minIoU = 0.7): MatchReport {
  const pairs: { p: number; t: number; v: number }[] = [];
  predicted.forEach((p, pi) =>
    truth.forEach((t, ti) => {
      const v = iou(p, t);
      if (v >= minIoU) pairs.push({ p: pi, t: ti, v });
    }),
  );
  pairs.sort((a, b) => b.v - a.v);
  const usedP = new Set<number>();
  const usedT = new Set<number>();
  let sumIoU = 0;
  let maxCornerError = 0;
  for (const pair of pairs) {
    if (usedP.has(pair.p) || usedT.has(pair.t)) continue;
    usedP.add(pair.p);
    usedT.add(pair.t);
    sumIoU += pair.v;
    const a = predicted[pair.p];
    const b = truth[pair.t];
    maxCornerError = Math.max(
      maxCornerError,
      Math.abs(a.x - b.x),
      Math.abs(a.y - b.y),
      Math.abs(a.x + a.width - (b.x + b.width)),
      Math.abs(a.y + a.height - (b.y + b.height)),
    );
  }
  const tp = usedP.size;
  return {
    truePositives: tp,
    falsePositives: predicted.length - tp,
    falseNegatives: truth.length - tp,
    precision: predicted.length ? tp / predicted.length : truth.length ? 0 : 1,
    recall: truth.length ? tp / truth.length : 1,
    meanIoU: tp ? sumIoU / tp : 0,
    maxCornerError,
  };
}

export function allCards(result: GridDetectionResult): PixelRect[] {
  return result.grids.flatMap((g) => g.cards.map(({ x, y, width, height }) => ({ x, y, width, height })));
}
