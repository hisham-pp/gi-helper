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
  candidates?: MatchCandidate[];
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

const GENERIC_STOP_WORDS = new Set([
  "ancient",
  "fragment",
  "piece",
  "shard",
  "broken",
  "damaged",
  "stained",
  "weathered",
  "pristine",
  "refined",
  "heavy",
  "sharp",
  "common",
  "fossilized",
  "glowing",
  "decayed",
  "pure",
  "corrupted",
  "dull",
  "crystal",
  "chunk",
  "silver",
  "golden",
  "iron",
  "copper",
  "mask",
  "horn",
  "drop",
  "branch",
  "core",
  "flower",
  "scale",
  "teeth",
  "fang",
  "bone",
  "scroll",
  "arrowhead",
  "insignia",
  "blade",
  "sword",
  "guide",
  "teachings",
  "philosophies",
  "echo",
  "movement",
  "chapter",
  "sacrificial",
  "blessed",
  "device",
  "mystic",
  "whistle",
]);

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
        finalScore *= 0.7; // Moderate penalty for >= 2 stars difference (retains true matches when star detection fluctuates)
        rarityMatch = false;
      }
    }

    let siblingMatch = false;
    // Guard sibling boost: only apply if the candidate has plausible visual similarity
    if (
      options?.neighborNames &&
      material &&
      rawScore >= 0.52 &&
      hashSim >= 0.46
    ) {
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
          finalScore *= 1.1; // 10% boost for explicit family match
          siblingMatch = true;
          break;
        }

        // 2. Fallback to dynamic string match if no family is defined
        if (rawScore >= 0.55 && hashSim >= 0.48) {
          const neighborWords = neighborName.toLowerCase().split(/[\s-']+/);
          // Look for shared significant non-generic words (length >= 4)
          const sharesWord = matWords.some(
            (w) =>
              w.length >= 4 &&
              !GENERIC_STOP_WORDS.has(w) &&
              neighborWords.includes(w),
          );
          if (sharesWord) {
            finalScore *= 1.08; // 8% boost if it shares a distinctive word with a neighbor
            siblingMatch = true;
            break;
          }
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
  // partition into constrained vs. unconstrained pools. When there is no
  // constraint we retrieve top candidates for alternative suggestions.
  const limit = orderConstraint ? 9999 : 5;

  const all = findTopCandidates(fingerprint, limit, {
    hashWeight: 0.6,
    colorWeight: 0.4,
    minConfidence: options?.minConfidence ?? 0.48,
    expectedRarity: options?.expectedRarity,
    neighborNames: options?.neighborNames,
  });

  if (all.length === 0) {
    return null;
  }

  const topCandidates = all.slice(0, 5);

  // No constraint — return the top candidate directly (legacy behaviour).
  if (!orderConstraint) {
    return {
      id: all[0].id,
      name: all[0].name,
      confidence: all[0].confidence,
      constraintRelaxed: false,
      order: all[0].order,
      blockId: all[0].blockId,
      candidates: topCandidates,
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

  // If the unconstrained top visual candidate is significantly stronger than the
  // best candidate that satisfied the order constraint (e.g. difference >= 0.08),
  // the order sequence was corrupted by an earlier misidentification.
  // Relax the constraint and trust the superior visual match instead of forcing a mismatch.
  const visualDisparity =
    constrained.length > 0 ? all[0].score - constrained[0].score : 1.0;

  if (constrained.length > 0 && visualDisparity < 0.08) {
    return {
      id: constrained[0].id,
      name: constrained[0].name,
      confidence: constrained[0].confidence,
      constraintRelaxed: false,
      order: constrained[0].order,
      blockId: constrained[0].blockId,
      candidates: topCandidates,
    };
  }

  // Graceful fallback: no candidate passed the constraint, or top visual match
  // vastly outperformed the constrained option.
  return {
    id: all[0].id,
    name: all[0].name,
    confidence: all[0].confidence,
    constraintRelaxed: true,
    order: all[0].order,
    blockId: all[0].blockId,
    candidates: topCandidates,
  };
}
