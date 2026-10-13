/**
 * Stage 5 — Card dimension clustering.
 *
 * Cards of one grid share (nearly) the same size, so grouping candidates by
 * width/height separates real cards from icon fragments, card sub-parts and
 * multi-card blocks, and separates grids that use different card sizes.
 */
import type { Candidate } from "./filter";

export interface SizeCluster {
  width: number;
  height: number;
  members: Candidate[];
  totalQuality: number;
}

/**
 * Greedy clustering in quality order: the strongest candidate seeds a cluster
 * and later candidates join the closest cluster within ±`tolerance` on both
 * dimensions. Cluster centres are quality-weighted means, so weak outliers
 * barely move them.
 */
export function clusterBySize(
  cands: Candidate[],
  tolerance: number,
): SizeCluster[] {
  const sorted = [...cands].sort((a, b) => b.quality - a.quality);
  const clusters: (SizeCluster & { sw: number; sh: number })[] = [];
  for (const c of sorted) {
    const w = c.right - c.left;
    const h = c.bottom - c.top;
    let best: (typeof clusters)[number] | null = null;
    let bestDist = Infinity;
    for (const k of clusters) {
      const dw = Math.abs(w - k.width) / k.width;
      const dh = Math.abs(h - k.height) / k.height;
      if (dw > tolerance || dh > tolerance) continue;
      const d = dw + dh;
      if (d < bestDist) {
        bestDist = d;
        best = k;
      }
    }
    if (best) {
      best.members.push(c);
      best.totalQuality += c.quality;
      best.sw += w * c.quality;
      best.sh += h * c.quality;
      best.width = best.sw / best.totalQuality;
      best.height = best.sh / best.totalQuality;
    } else {
      clusters.push({
        width: w,
        height: h,
        members: [c],
        totalQuality: c.quality,
        sw: w * c.quality,
        sh: h * c.quality,
      });
    }
  }
  return clusters
    .map(({ width, height, members, totalQuality }) => ({
      width,
      height,
      members,
      totalQuality,
    }))
    .sort((a, b) => b.totalQuality - a.totalQuality);
}

export function median(values: number[]): number {
  if (values.length === 0) return NaN;
  const s = [...values].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
