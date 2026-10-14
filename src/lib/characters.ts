import characters from "@/data/characters.json";

/**
 * Playable characters (src/data/characters.json, built by
 * `pnpm scrape:characters`). The feedback form uses them for a random name
 * and avatar.
 */
export interface Character {
  /** Slug of the name, e.g. "hu-tao"; also the avatar file name. */
  id: string;
  name: string;
  rarity: number;
  element: string;
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
