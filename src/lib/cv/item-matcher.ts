import { hammingDistance } from "./image-hasher";
import materialsData from "@/data/materials.json";
import materialHashes from "@/data/material-hashes.json";

export interface MatchResult {
  id: string;
  name: string;
  confidence: number;
}

export function findBestMatch(hash: string): MatchResult | null {
  let bestMatchId: string | null = null;
  let lowestDistance = Infinity;

  for (const [id, targetHash] of Object.entries(materialHashes as Record<string, string>)) {
    const distance = hammingDistance(hash, targetHash);
    
    if (distance < lowestDistance) {
      lowestDistance = distance;
      bestMatchId = id;
    }
  }

  // If distance is too high, it's not a confident match (e.g., max 25 bit difference for a 64-bit hash)
  if (!bestMatchId || lowestDistance > 25) {
    return null;
  }

  const material = materialsData.find(m => m.id === bestMatchId);
  if (!material) return null;

  return {
    id: material.id,
    name: material.name,
    // Turn distance into a pseudo-confidence percentage (0 dist = 100%, 25 dist = 0%)
    confidence: Math.max(0, 100 - (lowestDistance / 25) * 100)
  };
}
