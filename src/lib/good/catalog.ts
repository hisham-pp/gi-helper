import artifactSets from "@/data/artifact-sets.json";
import weapons from "@/data/weapons.json";
import { getAllCharacters, type Character } from "@/lib/characters";
import { toGOODKey } from "./keys";
import type { SlotKey } from "./types";

/**
 * Lookups from GOOD keys to the game data (src/data/weapons.json,
 * artifact-sets.json and characters.json, built from genshin-db by the
 * scrape:* scripts). Keys we don't know yet (a release newer than genshin-db)
 * still work: they get a name from the key and no icon.
 */

export interface WeaponInfo {
  /** Slug of the name; also the icon file name. */
  id: string;
  key: string;
  name: string;
  rarity: number;
  type: string;
  /** Base ATK at max level (90, or 70 for 1-2★). */
  atk: number;
  /** Secondary stat at max level (none on 1-2★). */
  substat?: { name: string; value: string };
  /** Name of the passive (none on 1-2★). */
  passive?: string;
}

export interface ArtifactSetInfo {
  id: string;
  key: string;
  name: string;
  rarities: number[];
  pieces: Partial<Record<SlotKey, string>>;
  /** Set bonus by piece count ("1" for the one-piece Prayers sets). */
  bonuses: Partial<Record<"1" | "2" | "4", string>>;
}

export const WEAPON_TYPES = ["sword", "claymore", "polearm", "bow", "catalyst"] as const;

export const WEAPON_TYPE_NAMES: Record<string, string> = {
  sword: "Sword",
  claymore: "Claymore",
  polearm: "Polearm",
  bow: "Bow",
  catalyst: "Catalyst",
};

const WEAPONS = weapons as unknown as WeaponInfo[];
const SETS = artifactSets as unknown as ArtifactSetInfo[];
const WEAPON_BY_KEY = new Map(WEAPONS.map((w) => [w.key, w]));
const SET_BY_KEY = new Map(SETS.map((s) => [s.key, s]));
const WEAPON_BY_ID = new Map(WEAPONS.map((w) => [w.id, w]));
const SET_BY_ID = new Map(SETS.map((s) => [s.id, s]));
const CHARACTER_BY_KEY = new Map(
  getAllCharacters()
    .filter((c) => c.key !== "Traveler")
    .map((c) => [c.key, c]),
);
/** Shown for every Traveler (GOOD doesn't say which one). */
const TRAVELER = getAllCharacters().find((c) => c.id === "aether");

export function getAllWeapons(): WeaponInfo[] {
  return WEAPONS;
}

export function getAllArtifactSets(): ArtifactSetInfo[] {
  return SETS;
}

export function getWeapon(key: string): WeaponInfo | undefined {
  return WEAPON_BY_KEY.get(key);
}

export function getArtifactSet(key: string): ArtifactSetInfo | undefined {
  return SET_BY_KEY.get(key);
}

/** By our id (the icon's file name), as the scanner reports weapons. */
export function getWeaponById(id: string): WeaponInfo | undefined {
  return WEAPON_BY_ID.get(id);
}

/** By our id, as the scanner reports artifact pieces ("<set id>:<slot>"). */
export function getArtifactSetById(id: string): ArtifactSetInfo | undefined {
  return SET_BY_ID.get(id);
}

/** 128² WebP in public/images/weapons. */
export function weaponIconUrl(id: string): string {
  return `/images/weapons/${id}.webp`;
}

/** 128² WebP in public/images/artifacts. */
export function artifactIconUrl(setId: string, slot: SlotKey): string {
  return `/images/artifacts/${setId}-${slot}.webp`;
}

/** "QuantumCatalyst" → "Quantum Catalyst", for keys newer than our data. */
export function nameFromKey(key: string): string {
  return key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/([A-Z])([A-Z][a-z])/g, "$1 $2");
}

const TRAVELER_ELEMENT = /^Traveler(Anemo|Geo|Electro|Dendro|Hydro|Pyro|Cryo)$/;

export interface CharacterInfo {
  key: string;
  name: string;
  /** Avatar id (public/images/character-avatars), when we have one. */
  avatarId?: string;
  rarity?: number;
  element?: string;
  weaponType?: string;
}

/**
 * A GOOD character key ("HuTao", "TravelerAnemo") or location key
 * ("Traveler") with its name and avatar.
 */
export function describeCharacter(key: string): CharacterInfo {
  const traveler = key === "Traveler" ? null : key.match(TRAVELER_ELEMENT);
  if (key === "Traveler" || traveler) {
    return {
      key,
      name: traveler ? `Traveler (${traveler[1]})` : "Traveler",
      avatarId: TRAVELER?.id,
      rarity: 5,
      element: traveler?.[1],
      weaponType: "sword",
    };
  }
  const character: Character | undefined = CHARACTER_BY_KEY.get(key);
  if (!character) return { key, name: nameFromKey(key) };
  return {
    key,
    name: character.name,
    avatarId: character.id,
    rarity: character.rarity,
    element: character.element,
    weaponType: character.weaponType,
  };
}

/** The GOOD location key of a character key: both Travelers are "Traveler". */
export function locationKeyOf(characterKey: string): string {
  return TRAVELER_ELEMENT.test(characterKey) ? "Traveler" : characterKey;
}

export { toGOODKey };
