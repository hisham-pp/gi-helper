import {
  ASCENSION_MAX_LEVEL,
  type GoodArtifact,
  type GoodCharacter,
  type GoodSubstat,
  type GoodWeapon,
  type SlotKey,
} from "../../good/types";
import type { ArtifactSetInfo, WeaponInfo } from "../../good/catalog";
import type { EquipmentSighting } from "../types/equipment.types";

/**
 * A weapon's ascension from its level: the lowest whose cap reaches the
 * level (a weapon at 80 is taken as 80/80, not 80/90), and at least 2 when
 * the bag showed the awakened icon (which only appears from ascension 2).
 * 1-2★ weapons stop at level 70 (ascension 4).
 */
export function weaponAscension(
  level: number,
  awakened: boolean,
  rarity: number,
): number {
  const maxAscension = rarity <= 2 ? 4 : 6;
  let ascension = ASCENSION_MAX_LEVEL.findIndex((cap) => level <= cap);
  if (ascension < 0) ascension = maxAscension;
  if (awakened && ascension < 2 && level >= 40) ascension = 2;
  return Math.min(ascension, maxAscension);
}

/** A character's ascension from its level: the lowest whose cap reaches it (past 90: 6). */
export function characterAscension(level: number): number {
  const ascension = ASCENSION_MAX_LEVEL.findIndex((cap) => level <= cap);
  return ascension < 0 ? 6 : ascension;
}

/**
 * A scanned character as a GOOD character. The party setup only shows the
 * level: one already in the inventory keeps its constellation and talents
 * (and its ascension when it still fits the level); a new one starts at C0
 * with level-1 talents.
 */
export function toGoodCharacter(
  key: string,
  level: number,
  existing?: GoodCharacter,
): GoodCharacter {
  const cap = (a: number) => ASCENSION_MAX_LEVEL[a] ?? Infinity;
  const fits =
    existing &&
    level <= cap(existing.ascension) &&
    (existing.ascension === 0 || level >= cap(existing.ascension - 1));
  return {
    key,
    level,
    constellation: existing?.constellation ?? 0,
    ascension: fits ? existing!.ascension : characterAscension(level),
    talent: existing?.talent ?? { auto: 1, skill: 1, burst: 1 },
  };
}

/** The main stat a slot always has (flower: HP, plume: ATK); null for sands, goblet and circlet. */
export function fixedMainStat(slot: SlotKey): string | null {
  return slot === "flower" ? "hp" : slot === "plume" ? "atk" : null;
}

/** "gladiator-s-finale:flower" → set id and slot. */
export function splitArtifactItem(item: string): {
  setId: string;
  slot: SlotKey;
} {
  const [setId, slot] = item.split(":");
  return { setId, slot: slot as SlotKey };
}

/** A scanned weapon as a GOOD weapon. */
export function toGoodWeapon(
  s: Pick<EquipmentSighting, "variant" | "level" | "refinement" | "locked">,
  info: WeaponInfo,
  details: { location?: string; ascension?: number } = {},
): GoodWeapon {
  const level = s.level ?? 1;
  const ascension =
    details.ascension !== undefined && details.ascension !== null
      ? details.ascension
      : weaponAscension(
          level,
          !!s.variant?.startsWith("awakened"),
          info.rarity,
        );
  return {
    key: info.key,
    level,
    ascension,
    refinement: s.refinement ?? 1,
    location: details.location ?? "",
    lock: s.locked,
  };
}

/** What an artifact's detail panel adds to its card. */
export interface ArtifactDetails {
  substats?: GoodSubstat[];
  /** A +0 artifact's 4th substat, shown but not active yet (GOOD 3). */
  unactivatedSubstats?: GoodSubstat[];
  /** GOOD location key of the character wearing it. */
  location?: string;
}

/**
 * A scanned artifact as a GOOD artifact. The grid shows no substats, and the
 * main stat only for flowers and plumes: `mainStatKey` is "" until it's
 * chosen or read from the artifact's detail panel, which also gives the
 * substats and who wears it (`details`).
 */
export function toGoodArtifact(
  s: Pick<EquipmentSighting, "rarity" | "level" | "locked">,
  set: ArtifactSetInfo,
  slot: SlotKey,
  mainStatKey?: string | null,
  details: ArtifactDetails = {},
): GoodArtifact {
  const rarity =
    s.rarity && set.rarities.includes(s.rarity)
      ? s.rarity
      : Math.max(...set.rarities);
  const artifact: GoodArtifact = {
    setKey: set.key,
    slotKey: slot,
    level: Math.min(s.level ?? 0, rarity * 4),
    rarity,
    mainStatKey: mainStatKey ?? fixedMainStat(slot) ?? "",
    location: details.location ?? "",
    lock: s.locked,
    substats: (details.substats ?? []).map(({ key, value }) => ({
      key,
      value,
    })),
  };
  if (details.unactivatedSubstats?.length) {
    artifact.unactivatedSubstats = details.unactivatedSubstats.map(
      ({ key, value }) => ({ key, value }),
    );
  }
  return artifact;
}
