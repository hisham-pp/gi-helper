import materialsData from "@/data/materials.json";
import { MaterialItem } from "@/lib/types";

export interface MatchedMaterial {
  id: string;
  name: string;
  rarity?: number;
}

const materials = materialsData as MaterialItem[];

// Pre-build index maps
const byId = new Map<string, MaterialItem>();
const byExactName = new Map<string, MaterialItem>();
const byNormalized = new Map<string, MaterialItem>();

function normalize(str: string): string {
  return str
    .toLowerCase()
    .replace(/["'“”‘’\-_\s]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

for (const mat of materials) {
  byId.set(mat.id.toLowerCase(), mat);
  byExactName.set(mat.name.toLowerCase(), mat);
  byNormalized.set(normalize(mat.name), mat);
  byNormalized.set(normalize(mat.id), mat);
}

/**
 * Levenshtein distance helper for fuzzy matching small typos
 */
function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0),
  );

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}

/**
 * Match a raw name or ID from AI vision to a canonical Genshin Material
 */
export function resolveMaterial(rawInput: string): MatchedMaterial | null {
  if (!rawInput || typeof rawInput !== "string") return null;

  const trimmed = rawInput.trim();
  const lower = trimmed.toLowerCase();

  // 1. Direct ID match
  if (byId.has(lower)) {
    const mat = byId.get(lower)!;
    return { id: mat.id, name: mat.name, rarity: mat.rarity };
  }

  // 2. Direct exact name match
  if (byExactName.has(lower)) {
    const mat = byExactName.get(lower)!;
    return { id: mat.id, name: mat.name, rarity: mat.rarity };
  }

  // 3. Normalized alphanumeric match
  const norm = normalize(lower);
  if (byNormalized.has(norm)) {
    const mat = byNormalized.get(norm)!;
    return { id: mat.id, name: mat.name, rarity: mat.rarity };
  }

  // 4. Fuzzy distance search against all materials
  let bestMatch: MaterialItem | null = null;
  let minDistance = Infinity;

  for (const mat of materials) {
    const targetNorm = normalize(mat.name);
    // If one contains the other
    if (
      norm.length > 5 &&
      (targetNorm.includes(norm) || norm.includes(targetNorm))
    ) {
      return { id: mat.id, name: mat.name, rarity: mat.rarity };
    }

    const dist = levenshteinDistance(norm, targetNorm);
    const maxAllowed = Math.floor(
      Math.max(norm.length, targetNorm.length) * 0.25,
    ); // allow ~25% edit distance

    if (dist <= maxAllowed && dist < minDistance) {
      minDistance = dist;
      bestMatch = mat;
    }
  }

  if (bestMatch) {
    return { id: bestMatch.id, name: bestMatch.name, rarity: bestMatch.rarity };
  }

  return null;
}
