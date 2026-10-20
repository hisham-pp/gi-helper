/**
 * The GOOD (Genshin Open Object Description) format, as Genshin Optimizer
 * defines it (version 3): characters, weapons, artifacts and materials.
 * https://frzyc.github.io/genshin-optimizer/#/doc
 */

export const SLOT_KEYS = ["flower", "plume", "sands", "goblet", "circlet"] as const;
export type SlotKey = (typeof SLOT_KEYS)[number];

export const SLOT_NAMES: Record<SlotKey, string> = {
  flower: "Flower of Life",
  plume: "Plume of Death",
  sands: "Sands of Eon",
  goblet: "Goblet of Eonothem",
  circlet: "Circlet of Logos",
};

/** Every stat key GOOD uses for artifact main stats and substats. */
export const STAT_KEYS = [
  "hp",
  "hp_",
  "atk",
  "atk_",
  "def",
  "def_",
  "eleMas",
  "enerRech_",
  "critRate_",
  "critDMG_",
  "heal_",
  "physical_dmg_",
  "anemo_dmg_",
  "geo_dmg_",
  "electro_dmg_",
  "hydro_dmg_",
  "pyro_dmg_",
  "cryo_dmg_",
  "dendro_dmg_",
] as const;
export type StatKey = (typeof STAT_KEYS)[number];

export const STAT_NAMES: Record<StatKey, string> = {
  hp: "HP",
  hp_: "HP%",
  atk: "ATK",
  atk_: "ATK%",
  def: "DEF",
  def_: "DEF%",
  eleMas: "Elemental Mastery",
  enerRech_: "Energy Recharge",
  critRate_: "CRIT Rate",
  critDMG_: "CRIT DMG",
  heal_: "Healing Bonus",
  physical_dmg_: "Physical DMG Bonus",
  anemo_dmg_: "Anemo DMG Bonus",
  geo_dmg_: "Geo DMG Bonus",
  electro_dmg_: "Electro DMG Bonus",
  hydro_dmg_: "Hydro DMG Bonus",
  pyro_dmg_: "Pyro DMG Bonus",
  cryo_dmg_: "Cryo DMG Bonus",
  dendro_dmg_: "Dendro DMG Bonus",
};

const ELEMENT_DMG = ["physical_dmg_", "anemo_dmg_", "geo_dmg_", "electro_dmg_", "hydro_dmg_", "pyro_dmg_", "cryo_dmg_", "dendro_dmg_"] as const;

/** The main stats each slot can roll. */
export const MAIN_STATS_BY_SLOT: Record<SlotKey, readonly StatKey[]> = {
  flower: ["hp"],
  plume: ["atk"],
  sands: ["hp_", "atk_", "def_", "eleMas", "enerRech_"],
  goblet: ["hp_", "atk_", "def_", "eleMas", ...ELEMENT_DMG],
  circlet: ["hp_", "atk_", "def_", "eleMas", "critRate_", "critDMG_", "heal_"],
};

/** Stats whose value is a percentage (keys ending in "_"). */
export function isPercentStat(key: string): boolean {
  return key.endsWith("_");
}

/** "CRIT Rate 10.5%", "ATK 19". */
export function formatStat(key: string, value: number): string {
  const name = STAT_NAMES[key as StatKey] ?? key;
  if (!isPercentStat(key)) return `${name} ${Math.round(value)}`;
  return `${name} ${Number.isInteger(value) ? value : value.toFixed(1)}%`;
}

export interface GoodCharacter {
  /** GOOD character key, e.g. "HuTao", "TravelerAnemo". */
  key: string;
  level: number;
  constellation: number;
  ascension: number;
  /** Base talent levels, without constellation boosts. */
  talent: { auto: number; skill: number; burst: number };
}

export interface GoodWeapon {
  key: string;
  level: number;
  ascension: number;
  refinement: number;
  /** GOOD location key of the character holding it ("Traveler" for either Traveler), or "". */
  location: string;
  lock: boolean;
}

export interface GoodSubstat {
  key: string;
  value: number;
  /** GOOD 3: the first roll, when known. */
  initialValue?: number;
}

export interface GoodArtifact {
  setKey: string;
  slotKey: SlotKey;
  level: number;
  rarity: number;
  mainStatKey: string;
  location: string;
  lock: boolean;
  substats: GoodSubstat[];
  /** GOOD 3 fields, kept when a file has them. */
  totalRolls?: number;
  astralMark?: boolean;
  elixirCrafted?: boolean;
  unactivatedSubstats?: GoodSubstat[];
}

export interface GoodDocument {
  format: "GOOD";
  version: number;
  source: string;
  characters?: GoodCharacter[];
  weapons?: GoodWeapon[];
  artifacts?: GoodArtifact[];
  materials?: Record<string, number>;
}

/** Weapons and artifacts in the inventory carry a local id (not exported). */
export type OwnedWeapon = GoodWeapon & { id: string };
export type OwnedArtifact = GoodArtifact & { id: string };

/** Highest level reachable at each ascension (shared by characters and weapons). */
export const ASCENSION_MAX_LEVEL = [20, 40, 50, 60, 70, 80, 90] as const;

/** "80/90": level over the cap of its ascension (characters past 90 show their level alone). */
export function formatLevel(level: number, ascension: number): string {
  const cap = ASCENSION_MAX_LEVEL[ascension];
  return cap && level <= cap ? `${level}/${cap}` : String(level);
}
