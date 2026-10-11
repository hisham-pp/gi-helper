import {
  hammingDistance,
  histogramIntersection,
  ImageFingerprint,
} from "./image-hasher";
import materialsData from "@/data/materials.json";
import materialHashes from "@/data/material-hashes.json";

export interface MatchResult {
  id: string;
  name: string;
  confidence: number;
  constraintRelaxed: boolean; // true when the order constraint was relaxed (no candidate passed)
  order: number | null; // Inventory_Order of the matched candidate, or null if unavailable
  blockId: string | null; // "{sortRank}:{rarity}" of the matched candidate, or null
}

/**
 * The stored hash data format (v2).
 * Supports both the legacy string format and the new fingerprint format.
 */
type StoredHash = string | { dHash: string; colorHist: number[] };

export interface MatchCandidate {
  id: string;
  name: string;
  rarity?: number;
  image?: string;
  score: number;
  confidence: number;
  hashSim: number;
  colorSim: number;
  hammingDist: number;
  rarityMatch?: boolean;
  siblingMatch?: boolean;
  order: number | null;
  blockId: string | null; // "{sortRank}:{rarity}" or null
}

/**
 * Finds top matching material candidates for a given fingerprint using
 * combined dHash + color histogram scoring and optional rarity star weighting.
 */
export function findTopCandidates(
  fingerprint: ImageFingerprint,
  limit: number = 5,
  options?: {
    hashWeight?: number;
    colorWeight?: number;
    minConfidence?: number;
    expectedRarity?: number | null;
    neighborNames?: string[];
  },
): MatchCandidate[] {
  const MAX_HASH_BITS = 256;
  const hashWeight = options?.hashWeight ?? 0.6;
  const colorWeight = options?.colorWeight ?? 0.4;
  const minConfidence = options?.minConfidence ?? 0;
  const expectedRarity = options?.expectedRarity ?? null;

  const candidates: MatchCandidate[] = [];

  for (const [id, stored] of Object.entries(
    materialHashes as Record<string, StoredHash>,
  )) {
    const storedHash = typeof stored === "string" ? stored : stored.dHash;
    const storedHist =
      typeof stored === "object" && stored.colorHist ? stored.colorHist : null;

    const dist = hammingDistance(fingerprint.dHash, storedHash);
    const hashSim = 1 - dist / MAX_HASH_BITS;

    let colorSim = 0.5;
    if (storedHist) {
      colorSim = histogramIntersection(fingerprint.colorHist, storedHist);
    }

    const rawScore = storedHist
      ? hashWeight * hashSim + colorWeight * colorSim
      : hashSim;

    const material = materialsData.find((m) => m.id === id);
    const matRarity = material?.rarity;
    const matOrder: number | null = (material as any)?.order ?? null;
    const matSortRank: number | null = (material as any)?.sortRank ?? null;
    const blockId: string | null =
      matSortRank !== null && matRarity != null
        ? `${matSortRank}:${matRarity}`
        : null;

    let finalScore = rawScore;
    let rarityMatch: boolean | undefined = undefined;

    // Apply rarity weighting if cell rarity (stars/background) was detected
    if (expectedRarity && matRarity) {
      const diff = Math.abs(matRarity - expectedRarity);
      if (diff === 0) {
        finalScore *= 1.1; // Boost exact star/rarity match
        rarityMatch = true;
      } else if (diff === 1) {
        finalScore *= 0.85; // Slight penalty for 1 star difference
        rarityMatch = false;
      } else {
        finalScore *= 0.4; // Heavy penalty for difference >= 2 stars (eliminates 1-star matching 4-star)
        rarityMatch = false;
      }
    }

    let siblingMatch = false;
    if (options?.neighborNames && material) {
      const matWords = material.name.toLowerCase().split(/[\s-']+/);
      for (const neighborName of options.neighborNames) {
        if (!neighborName) continue;

        // 1. Check if families match explicitly from scraped JSON data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const neighborMaterial = materialsData.find(
          (m: any) => m.name === neighborName,
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (
          (material as any).family &&
          neighborMaterial &&
          (neighborMaterial as any).family === (material as any).family
        ) {
          finalScore *= 1.15; // 15% boost for explicit family match
          siblingMatch = true;
          break;
        }

        // 2. Fallback to dynamic string match if no family is defined
        const neighborWords = neighborName.toLowerCase().split(/[\s-']+/);
        // Look for shared significant words (length >= 4)
        const sharesWord = matWords.some(
          (w) => w.length >= 4 && neighborWords.includes(w),
        );
        if (sharesWord) {
          finalScore *= 1.15; // 15% boost if it shares a word with a neighbor (sibling material)
          siblingMatch = true;
          break;
        }
      }
    }

    const confidence = Math.min(100, Math.round(finalScore * 100));

    if (finalScore >= minConfidence) {
      candidates.push({
        id,
        name: material ? material.name : id,
        rarity: matRarity,
        image: material?.image,
        score: finalScore,
        confidence,
        hashSim: Math.round(hashSim * 1000) / 10,
        colorSim: Math.round(colorSim * 1000) / 10,
        hammingDist: dist,
        rarityMatch,
        siblingMatch,
        order: matOrder,
        blockId,
      });
    }
  }

  candidates.sort((a, b) => b.score - a.score);
  return candidates.slice(0, limit);
}

/**
 * Finds the best matching material for a given fingerprint using a combined
 * dHash + color histogram score and optional rarity star weighting.
 */
export function findBestMatch(
  fingerprint: ImageFingerprint,
  options?: {
    expectedRarity?: number | null;
    minConfidence?: number;
    neighborNames?: string[];
    orderConstraint?: { minOrder: number; blockId: string | null };
  },
): MatchResult | null {
  const orderConstraint = options?.orderConstraint;

  // When an order constraint is provided, we need the full candidate list to
  // partition into constrained vs. unconstrained pools.  When there is no
  // constraint we can short-circuit with limit=1 for efficiency.
  const limit = orderConstraint ? 9999 : 1;

  const all = findTopCandidates(fingerprint, limit, {
    hashWeight: 0.6,
    colorWeight: 0.4,
    minConfidence: options?.minConfidence ?? 0.55,
    expectedRarity: options?.expectedRarity,
    neighborNames: options?.neighborNames,
  });

  if (all.length === 0) {
    return null;
  }

  // No constraint — return the top candidate directly (legacy behaviour).
  if (!orderConstraint) {
    return {
      id: all[0].id,
      name: all[0].name,
      confidence: all[0].confidence,
      constraintRelaxed: false,
      order: all[0].order,
      blockId: all[0].blockId,
    };
  }

  // Partition into a constrained pool:
  // A candidate is eligible when:
  //   • order >= minOrder  (advances the sequence), OR
  //   • blockId === orderConstraint.blockId AND blockId !== null  (same block peer)
  // Candidates with order === null are excluded from the constrained pool
  // and are only eligible in the unconstrained fallback.
  const { minOrder, blockId: constraintBlockId } = orderConstraint;

  const constrained = all.filter((c) => {
    if (c.order === null) return false;
    if (c.order >= minOrder) return true;
    if (constraintBlockId !== null && c.blockId === constraintBlockId)
      return true;
    return false;
  });

  if (constrained.length > 0) {
    // constrained is already sorted by score descending (inherited from findTopCandidates)
    return {
      id: constrained[0].id,
      name: constrained[0].name,
      confidence: constrained[0].confidence,
      constraintRelaxed: false,
      order: constrained[0].order,
      blockId: constrained[0].blockId,
    };
  }

  // Graceful fallback: no candidate passed the constraint — return the best
  // overall candidate (including null-order ones) and flag the relaxation.
  return {
    id: all[0].id,
    name: all[0].name,
    confidence: all[0].confidence,
    constraintRelaxed: true,
    order: all[0].order,
    blockId: all[0].blockId,
  };
}
