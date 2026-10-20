/**
 * What an artifact's numbers can be, to catch misread values: the main stat
 * is fixed by rarity, stat and level, and each substat value is a sum of
 * roll tiers (src/data/artifact-stats.json, from Genshin Optimizer).
 */
import stats from "@/data/artifact-stats.json";
import { isPercentStat } from "@gi/good";

interface StatData {
  main: Record<string, Record<string, number[]>>;
  rolls: Record<string, Record<string, number[]>>;
  subValues: Record<string, Record<string, Record<string, number[]>>>;
}

const DATA = stats as unknown as StatData;

/** Highest level per rarity: 4 × stars (+20 at 5★, +4 at 1★). */
export const maxArtifactLevel = (rarity: number) => rarity * 4;

/** Substat keys (main-stat-only keys excluded). */
export const SUBSTAT_KEYS = ["hp", "hp_", "atk", "atk_", "def", "def_", "eleMas", "enerRech_", "critRate_", "critDMG_"] as const;

/** The value the game shows for a stat: one decimal for percentages, whole numbers otherwise. */
export function shownValue(key: string, value: number): number {
  return isPercentStat(key) ? Math.round(value * 10) / 10 : Math.round(value);
}

/** The main stat value at a level, as shown; null when the table has no such entry. */
export function mainStatValue(rarity: number, key: string, level: number): number | null {
  const v = DATA.main[String(rarity)]?.[key]?.[level];
  return v === undefined ? null : shownValue(key, v);
}

/** Whether a shown main stat value fits the rarity, stat and level (one step of rounding either way). */
export function mainStatFits(rarity: number, key: string, level: number, value: number): boolean {
  const expected = mainStatValue(rarity, key, level);
  if (expected === null) return false;
  return Math.abs(expected - value) <= (isPercentStat(key) ? 0.11 : 1.01);
}

/** The levels at which a rarity's main stat shows this value (to recover an unreadable level). */
export function levelsForMainValue(rarity: number, key: string, value: number): number[] {
  const values = DATA.main[String(rarity)]?.[key] ?? [];
  const out: number[] = [];
  values.forEach((_, level) => {
    if (mainStatFits(rarity, key, level, value)) out.push(level);
  });
  return out;
}

/** "7.0" for percentages, "19" otherwise: the keys of `subValues`. */
const shownKey = (key: string, value: number) => (isPercentStat(key) ? value.toFixed(1) : String(Math.round(value)));

/** How many rolls can show this substat value at this rarity (empty when none can). */
export function substatRolls(rarity: number, key: string, value: number): number[] {
  return DATA.subValues[String(rarity)]?.[key]?.[shownKey(key, value)] ?? [];
}

/** Initial substats and upgrades: 5★ starts with 3–4 and gains a roll every 4 levels. */
export function rollBudget(rarity: number, level: number): { initial: [number, number]; upgrades: number } {
  return {
    initial: [Math.max(0, rarity - 2), Math.max(0, rarity - 1)],
    upgrades: Math.floor(Math.min(level, maxArtifactLevel(rarity)) / 4),
  };
}

export interface SubstatCheck {
  /** Per substat: whether its value can be rolled at all. */
  possible: boolean[];
  /** Whether some choice of roll counts adds up to what the rarity and level allow. */
  consistent: boolean;
}

/**
 * Checks a list of substats against the rolls a rarity and level allow:
 * each value must be a sum of roll tiers, and the roll counts together must
 * match the starting substats plus one roll per 4 levels (a 4th substat
 * that is still to be unlocked doesn't count).
 */
export function checkSubstats(
  rarity: number,
  level: number,
  substats: readonly { key: string; value: number }[],
): SubstatCheck {
  const options = substats.map((s) => substatRolls(rarity, s.key, s.value));
  const possible = options.map((o) => o.length > 0);
  if (possible.some((p) => !p) || substats.length === 0) return { possible, consistent: false };

  const { initial, upgrades } = rollBudget(rarity, level);
  const totals = new Set<number>();
  for (let start = initial[0]; start <= initial[1]; start++) {
    // A substat line only appears once it is rolled; until then the lines are the rolls.
    const total = start + upgrades;
    const lines = Math.min(4, total);
    if (lines === substats.length) totals.add(total);
  }
  if (totals.size === 0) return { possible, consistent: false };

  // Sum of one choice per substat must hit an allowed total.
  let sums = new Set<number>([0]);
  for (const o of options) {
    const next = new Set<number>();
    for (const s of sums) for (const k of o) next.add(s + k);
    sums = next;
  }
  return { possible, consistent: [...sums].some((s) => totals.has(s)) };
}
