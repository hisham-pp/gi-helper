/**
 * From the OCR text of the panel's fields to stats: numbers with the usual
 * OCR confusions undone, stat lines split into name and value, and names
 * snapped to the vocabulary.
 */
import { snap, vocabulary, type PanelLanguage, type StatName } from "./vocabulary";

/** Letters OCR returns for digits in a number. */
const DIGIT_LOOKALIKES: Record<string, string> = {
  O: "0",
  o: "0",
  D: "0",
  Q: "0",
  l: "1",
  I: "1",
  i: "1",
  "|": "1",
  "!": "1",
  Z: "2",
  z: "2",
  S: "5",
  s: "5",
  B: "8",
  g: "9",
};

export interface ParsedNumber {
  value: number;
  /** A "%" or a decimal point (flat values never have decimals). */
  percent: boolean;
}

/**
 * The number in a value text: "4,780" → 4780, "22.3%" → 22.3 (percent),
 * "+1O.5%" → 10.5. Thousands separators are dropped; a lone "," followed by
 * one digit is a decimal comma.
 */
export function parseNumber(text: string): ParsedNumber | null {
  const cleaned = text
    .replace(/[OoDQlIi|!ZzSsBg]/g, (c) => DIGIT_LOOKALIKES[c] ?? c)
    .replace(/\s+/g, "");
  const m = cleaned.match(/(\d[\d,.]*)(%?)/);
  if (!m) return null;
  let num = m[1].replace(/[.,]+$/, "");
  const percentSign = m[2] === "%" || /%/.test(cleaned.slice(m.index! + m[0].length));
  // "4,780": thousands; "12,4": a decimal comma.
  num = /,\d{3}(?!\d)/.test(num) ? num.replace(/,/g, "") : num.replace(/,/g, ".");
  const parts = num.split(".");
  if (parts.length > 2) num = parts.slice(0, -1).join("") + "." + parts[parts.length - 1];
  const value = Number(num);
  if (!Number.isFinite(value)) return null;
  return { value, percent: percentSign || num.includes(".") };
}

/** The GOOD key of a stat name with its value's kind: "HP" + "%" → "hp_". */
export function statKey(name: StatName, percent: boolean): string {
  if (name === "hp" || name === "atk" || name === "def") return percent ? `${name}_` : name;
  return name;
}

/** Whether a stat is shown as a percentage. */
const PERCENT_NAMES = new Set<StatName>(["enerRech_", "critRate_", "critDMG_", "heal_", "physical_dmg_", "anemo_dmg_", "geo_dmg_", "electro_dmg_", "hydro_dmg_", "pyro_dmg_", "cryo_dmg_", "dendro_dmg_"]);

export interface ParsedStat {
  key: string;
  value: number;
  /** The 4th substat of a +0 artifact that is shown but not active yet. */
  unactivated: boolean;
}

/** Text after a value that marks a substat as not yet active ("(unactivated)", "（待激活）"). */
const UNACTIVATED = /activ|待激活|未激活/i;

/**
 * One substat line: "· CRIT Rate+7.8%" → critRate_ 7.8. The name is
 * everything before the last "+" (or the first digit), snapped to the stat
 * names; null when the line isn't a stat.
 */
export function parseStatLine(line: string, lang: PanelLanguage): ParsedStat | null {
  const text = line.trim();
  let split = text.lastIndexOf("+");
  if (split < 0) split = text.search(/\d/);
  if (split <= 0) return null;
  // Bullets and noise before the name.
  const rawName = text.slice(0, split).replace(lang === "en" ? /^[^A-Za-z]+/ : /^[^\p{Script=Han}A-Za-z]+/u, "");
  const rest = text.slice(split + (text[split] === "+" ? 1 : 0));
  const name = snap(rawName, vocabulary(lang).stats, lang);
  if (!name) return null;
  const num = parseNumber(rest.replace(/\(.*$|（.*$/, ""));
  if (!num) return null;
  const percent = PERCENT_NAMES.has(name.value) ? true : name.value === "eleMas" ? false : num.percent;
  return { key: statKey(name.value, percent), value: num.value, unactivated: UNACTIVATED.test(rest) };
}

/** Every stat line of the substat block, in order. */
export function parseStatBlock(text: string, lang: PanelLanguage): ParsedStat[] {
  return text
    .split(/\n+/)
    .map((l) => parseStatLine(lang === "zh" ? l.replace(/\s+/g, "") : l, lang))
    .filter((s): s is ParsedStat => s !== null);
}

/** "+20" → 20 (the badge can't exceed +20). */
export function parseLevel(text: string): number | null {
  const n = parseNumber(text.replace(/^[^\d+]*\+?/, ""));
  if (!n || n.percent) return null;
  let level = Math.round(n.value);
  // A "+" read as "4" or "1": "420", "120".
  if (level > 20 && level < 1000) level = level % 100;
  return level >= 0 && level <= 20 ? level : null;
}

/** A name over one or two lines (long piece names wrap). */
export function joinLines(text: string): string {
  return text.split(/\n+/).map((l) => l.trim()).filter(Boolean).join(" ");
}

const CHINESE_REFINEMENT_DIGITS: Record<string, number> = {
  一: 1,
  二: 2,
  三: 3,
  四: 4,
  五: 5,
};

/** Refinement rank 1-5 from text ("Refinement Rank 1", "EB Refinement Rank |", "精炼1阶"). */
export function parseRefinement(text: string): number | null {
  const cleaned = text.trim();
  const m =
    cleaned.match(/(?:refinement(?:\s*rank)?|rank|精炼)\s*[:：]?\s*([1-5|lI!一二三四五])/i) ??
    cleaned.match(/\[([1-5])\]/) ??
    cleaned.match(/([1-5|lI!一二三四五])\s*阶/) ??
    cleaned.match(/\bR([1-5])\b/i);
  if (!m) return null;
  const raw = m[1];
  if (CHINESE_REFINEMENT_DIGITS[raw]) return CHINESE_REFINEMENT_DIGITS[raw];
  if (raw === "|" || raw === "l" || raw === "I" || raw === "!") return 1;
  const val = Number(raw);
  return val >= 1 && val <= 5 ? val : null;
}

export const WEAPON_ASCENSION_MAX_LEVEL = [20, 40, 50, 60, 70, 80, 90] as const;

export function weaponAscensionFromCap(cap: number): number {
  let bestIdx = 0;
  let bestDiff = Math.abs(cap - WEAPON_ASCENSION_MAX_LEVEL[0]);
  for (let i = 1; i < WEAPON_ASCENSION_MAX_LEVEL.length; i++) {
    const diff = Math.abs(cap - WEAPON_ASCENSION_MAX_LEVEL[i]);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestIdx = i;
    }
  }
  return bestIdx;
}

export interface WeaponLevelCap {
  level: number;
  cap: number;
  ascension: number;
}

/** Parses weapon level badge: "Lv. 80/80" -> level 80, cap 80, ascension 5. */
export function parseWeaponLevelAndCap(text: string): WeaponLevelCap | null {
  const cleaned = text
    .replace(/[OoDQ]/g, "0")
    .replace(/[lIi|!]/g, "1")
    .replace(/[Zz]/g, "2")
    .replace(/[Ss]/g, "5")
    .replace(/[B]/g, "8")
    .replace(/[g]/g, "9");

  const m = cleaned.match(/(\d{1,2})\s*[\/|\\]\s*(\d{1,2})/);
  if (m) {
    const level = parseInt(m[1], 10);
    const cap = parseInt(m[2], 10);
    if (Number.isFinite(level) && Number.isFinite(cap) && level > 0 && level <= 90) {
      const ascension = weaponAscensionFromCap(cap);
      const snappedCap = WEAPON_ASCENSION_MAX_LEVEL[ascension];
      return {
        level: Math.min(level, snappedCap),
        cap: snappedCap,
        ascension,
      };
    }
  }

  const single = parseNumber(cleaned)?.value;
  if (single != null && single >= 1 && single <= 90) {
    const level = Math.round(single);
    let asc = 0;
    if (level > 80) asc = 6;
    else if (level > 70) asc = 5;
    else if (level > 60) asc = 4;
    else if (level > 50) asc = 3;
    else if (level > 40) asc = 2;
    else if (level > 20) asc = 1;
    return { level, cap: WEAPON_ASCENSION_MAX_LEVEL[asc], ascension: asc };
  }
  return null;
}

