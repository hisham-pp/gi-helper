import {
  getAllCharacters,
  getAllMaterials,
  getAllWeapons,
} from "@/lib/static-data";

type ItemType = "character" | "weapon" | "material";

type Candidate = {
  type: ItemType;
  id: string;
  name: string;
};

/**
 * Matches item references the model already wrote correctly
 * (`[character:id]`), inline code, and markdown links — none of these
 * should be touched by the auto-tagger.
 */
const PROTECTED_PATTERN =
  /(\[(?:character|weapon|material):[a-z0-9-]+\]|`[^`]*`|\[[^\]]*\]\([^)]*\))/gi;

let cachedCandidates: Candidate[] | null = null;

/**
 * Names sorted longest-first so a specific match (e.g. "Sacrificial Sword")
 * claims its range before a shorter substring (e.g. "Sword") gets a chance
 * to split it apart.
 */
function getCandidates(): Candidate[] {
  if (cachedCandidates) {
    return cachedCandidates;
  }

  const candidates: Candidate[] = [
    ...getAllCharacters().map((c) => ({
      type: "character" as const,
      id: c.id,
      name: c.name,
    })),
    ...getAllWeapons().map((w) => ({
      type: "weapon" as const,
      id: w.id,
      name: w.name,
    })),
    ...getAllMaterials().map((m) => ({
      type: "material" as const,
      id: m.id,
      name: m.name,
    })),
  ].filter((candidate) => candidate.name.trim().length > 3);

  candidates.sort((a, b) => b.name.length - a.name.length);
  cachedCandidates = candidates;

  return candidates;
}

function isWordBoundary(char: string | undefined) {
  return char === undefined || !/[a-z0-9]/i.test(char);
}

/**
 * Tags the first unclaimed occurrence of each candidate name found in a
 * plain-text segment, longest names first so overlapping names (e.g. a
 * material that is a substring of another material) never get split.
 */
function tagSegment(segment: string, usedIds: Set<string>): string {
  if (!segment) {
    return segment;
  }

  const lowerSegment = segment.toLowerCase();
  const claimed: Array<[number, number]> = [];
  const insertions: Array<{ start: number; end: number; tag: string }> = [];

  for (const candidate of getCandidates()) {
    if (usedIds.has(candidate.id)) {
      continue;
    }

    const lowerName = candidate.name.toLowerCase();
    const index = lowerSegment.indexOf(lowerName);

    if (index === -1) {
      continue;
    }

    const end = index + lowerName.length;
    const overlaps = claimed.some(
      ([claimedStart, claimedEnd]) => index < claimedEnd && end > claimedStart,
    );
    const hasWordBoundaries =
      isWordBoundary(segment[index - 1]) && isWordBoundary(segment[end]);

    if (overlaps || !hasWordBoundaries) {
      continue;
    }

    claimed.push([index, end]);
    insertions.push({
      start: index,
      end,
      tag: `[${candidate.type}:${candidate.id}]`,
    });
    usedIds.add(candidate.id);
  }

  if (insertions.length === 0) {
    return segment;
  }

  insertions.sort((a, b) => a.start - b.start);

  let result = "";
  let cursor = 0;
  for (const insertion of insertions) {
    result += segment.slice(cursor, insertion.start) + insertion.tag;
    cursor = insertion.end;
  }
  result += segment.slice(cursor);

  return result;
}

/**
 * Best-effort fallback for models that ignore the `[type:id]` formatting
 * instruction: finds plain-text mentions of known characters, weapons, and
 * materials and wraps the first mention of each in the same tag syntax the
 * Markdown renderer already understands, so their icon still shows up
 * regardless of how well the underlying model follows instructions.
 *
 * Already-tagged references, inline code, and markdown links are left
 * untouched so a compliant model's output is never double-wrapped.
 */
export function autoTagItemReferences(text: string): string {
  if (!text) {
    return text;
  }

  const segments = text.split(PROTECTED_PATTERN);
  const usedIds = new Set<string>();

  return segments
    .map((segment, index) =>
      // Odd indexes are the captured protected matches — leave them as-is.
      index % 2 === 1 ? segment : tagSegment(segment, usedIds),
    )
    .join("");
}
