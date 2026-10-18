import characters from "@/data/characters.json";

export type TalentType = "auto" | "skill" | "burst";

export interface TalentBoosts {
  c3: TalentType;
  c5: TalentType;
}

/**
 * Playable characters (src/data/characters.json, built by
 * `pnpm scrape:characters`). The feedback form uses them for a random name
 * and avatar, and GOOD files name them by key.
 */
export interface Character {
  /** Slug of the name, e.g. "hu-tao"; also the avatar file name. */
  id: string;
  /** GOOD key, e.g. "HuTao" ("Traveler" for Aether and Lumine). */
  key: string;
  name: string;
  /** In-game title, e.g. "Endless Solo of Solitude" (none for the Travelers). */
  title?: string;
  rarity: number;
  element: string;
  /** "sword", "claymore", "polearm", "bow" or "catalyst". */
  weaponType: string;
  /** Home region, e.g. "Fontaine" (none for the Travelers). */
  region?: string;
  /** Constellation talent boosts (+3 levels): C3 and C5 boost skill, burst or normal attack. */
  talentBoosts?: TalentBoosts;
  /** For the Traveler: C3/C5 talent boosts keyed by element ("Anemo", "Geo", etc.). */
  talentBoostsByElement?: Record<string, TalentBoosts>;
}

const ALL = characters as Character[];
const BY_ID = new Map(ALL.map((character) => [character.id, character]));

export function getAllCharacters(): Character[] {
  return ALL;
}

export function getCharacter(id: string | null | undefined): Character | undefined {
  return id ? BY_ID.get(id) : undefined;
}

/** 128² WebP avatar in public/images/character-avatars. */
export function characterAvatarUrl(id: string): string {
  return `/images/character-avatars/${id}.webp`;
}

/** A random character; never `exceptId`, so a re-roll always changes. */
export function randomCharacter(exceptId?: string): Character {
  const pool = exceptId && ALL.length > 1 ? ALL.filter((c) => c.id !== exceptId) : ALL;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Resolves the constellation talent boosts for a character (and Traveler's active element).
 */
export function getTalentBoosts(character?: Character, travelerElement?: string): TalentBoosts | undefined {
  if (!character) return undefined;
  if (character.talentBoosts) return character.talentBoosts;
  if (character.talentBoostsByElement) {
    const el = travelerElement ?? "Anemo";
    return character.talentBoostsByElement[el];
  }
  return undefined;
}

/**
 * Calculates base talent levels (without constellation +3 boosts) as stored in GOOD format.
 * C3 adds +3 to the c3-boosted talent; C5 adds +3 to the c5-boosted talent.
 */
export function calculateBaseTalents(
  scanned: { auto: number; skill: number; burst: number },
  constellation: number,
  boosts?: TalentBoosts,
): { auto: number; skill: number; burst: number } {
  const result = { ...scanned };
  if (!boosts) return result;
  if (constellation >= 3 && boosts.c3) {
    result[boosts.c3] = Math.max(1, result[boosts.c3] - 3);
  }
  if (constellation >= 5 && boosts.c5) {
    result[boosts.c5] = Math.max(1, result[boosts.c5] - 3);
  }
  return result;
}
