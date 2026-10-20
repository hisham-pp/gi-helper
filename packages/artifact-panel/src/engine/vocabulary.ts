/**
 * The closed vocabulary of the artifact detail panel, in the game languages
 * the reader supports (English and Simplified Chinese): stat names, slot
 * names, set and piece names, character names. OCR text is snapped to the
 * nearest entry, so a letter or two read wrong doesn't matter.
 */
import artifactSets from "@/data/artifact-sets.json";
import characters from "@/data/characters.json";
import weapons from "@/data/weapons.json";
import namesZh from "@/data/names-zh.json";
import type { SlotKey } from "@gi/good";

export type PanelLanguage = "en" | "zh";

/** The stat as the panel names it: HP, ATK and DEF are flat or percent by their value. */
export type StatName =
  | "hp"
  | "atk"
  | "def"
  | "eleMas"
  | "enerRech_"
  | "critRate_"
  | "critDMG_"
  | "heal_"
  | "physical_dmg_"
  | "anemo_dmg_"
  | "geo_dmg_"
  | "electro_dmg_"
  | "hydro_dmg_"
  | "pyro_dmg_"
  | "cryo_dmg_"
  | "dendro_dmg_";

const STAT_NAMES: Record<PanelLanguage, Record<StatName, string>> = {
  en: {
    hp: "HP",
    atk: "ATK",
    def: "DEF",
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
  },
  zh: {
    hp: "生命值",
    atk: "攻击力",
    def: "防御力",
    eleMas: "元素精通",
    enerRech_: "元素充能效率",
    critRate_: "暴击率",
    critDMG_: "暴击伤害",
    heal_: "治疗加成",
    physical_dmg_: "物理伤害加成",
    anemo_dmg_: "风元素伤害加成",
    geo_dmg_: "岩元素伤害加成",
    electro_dmg_: "雷元素伤害加成",
    hydro_dmg_: "水元素伤害加成",
    pyro_dmg_: "火元素伤害加成",
    cryo_dmg_: "冰元素伤害加成",
    dendro_dmg_: "草元素伤害加成",
  },
};

const SLOT_NAMES: Record<PanelLanguage, Record<SlotKey, string>> = {
  en: {
    flower: "Flower of Life",
    plume: "Plume of Death",
    sands: "Sands of Eon",
    goblet: "Goblet of Eonothem",
    circlet: "Circlet of Logos",
  },
  zh: { flower: "生之花", plume: "死之羽", sands: "时之沙", goblet: "空之杯", circlet: "理之冠" },
};

/** "Equipped: Name" / "Name已装备". */
export const EQUIPPED_PREFIX: Record<PanelLanguage, RegExp> = {
  en: /^.*?equip+ed\s*[:;.]?\s*/i,
  zh: /\s*已?装备.*$/,
};

/** Lower case letters and digits only (English), or CJK characters, letters and digits (Chinese). */
export function normalize(text: string, lang: PanelLanguage): string {
  const t = text.normalize("NFKC").toLowerCase();
  return lang === "en" ? t.replace(/[^a-z0-9]/g, "") : t.replace(/[^\p{Script=Han}a-z0-9]/gu, "");
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length];
}

export interface Snap<T> {
  value: T;
  /** Edit distance over the entry's length (0 = exact). */
  ratio: number;
}

interface Entry<T> {
  value: T;
  norm: string;
}

/**
 * The entry nearest to `text`, or null when even the nearest is too far:
 * more than `maxRatio` of its length in edits, at least one edit allowed
 * from three characters on ("HP" must be read exactly, "ATK" may be "AIK").
 */
export function snap<T>(text: string, entries: readonly Entry<T>[], lang: PanelLanguage, maxRatio = 0.34): Snap<T> | null {
  const norm = normalize(text, lang);
  if (norm.length === 0) return null;
  let best: Snap<T> | null = null;
  for (const e of entries) {
    const d = levenshtein(norm, e.norm);
    const ratio = d / Math.max(e.norm.length, 1);
    if (!best || ratio < best.ratio) best = { value: e.value, ratio };
  }
  if (!best) return null;
  const len = entries.find((e) => e.value === best!.value)!.norm.length;
  const allowed = Math.max(len <= 3 ? 0 : 1, Math.floor(len * maxRatio)) / len;
  return best.ratio <= allowed + 1e-9 ? best : null;
}

const entries = <T>(pairs: [T, string][], lang: PanelLanguage): Entry<T>[] =>
  pairs.map(([value, name]) => ({ value, norm: normalize(name, lang) })).filter((e) => e.norm.length > 0);

type SetEntry = { id: string; name: string; pieces: Partial<Record<SlotKey, string>> };
const SETS = artifactSets as unknown as SetEntry[];
const ZH = namesZh as unknown as {
  sets: Record<string, string>;
  pieces: Record<string, Partial<Record<SlotKey, string>>>;
  characters: Record<string, string>;
};

export interface Vocabulary {
  stats: Entry<StatName>[];
  slots: Entry<SlotKey>[];
  /** Piece name → set id and slot. */
  pieces: Entry<{ setId: string; slot: SlotKey }>[];
  sets: Entry<string>[];
  /** Character name → character id. */
  characters: Entry<string>[];
  /** Weapon name → weapon id. */
  weapons: Entry<string>[];
}

const cache = new Map<PanelLanguage, Vocabulary>();

export function vocabulary(lang: PanelLanguage): Vocabulary {
  let v = cache.get(lang);
  if (v) return v;
  const pieceNames: [{ setId: string; slot: SlotKey }, string][] = [];
  for (const set of SETS) {
    const names = lang === "en" ? set.pieces : (ZH.pieces[set.id] ?? {});
    for (const [slot, name] of Object.entries(names) as [SlotKey, string][]) pieceNames.push([{ setId: set.id, slot }, name]);
  }
  v = {
    stats: entries(Object.entries(STAT_NAMES[lang]) as [StatName, string][], lang),
    slots: entries(Object.entries(SLOT_NAMES[lang]) as [SlotKey, string][], lang),
    pieces: entries(pieceNames, lang),
    sets: entries(
      SETS.map((s): [string, string] => [s.id, lang === "en" ? s.name : (ZH.sets[s.id] ?? "")]),
      lang,
    ),
    characters: entries(
      (characters as { id: string; name: string }[]).map((c): [string, string] => [
        c.id,
        lang === "en" ? c.name : (ZH.characters[c.id] ?? ""),
      ]),
      lang,
    ),
    weapons: entries(
      (weapons as { id: string; name: string }[]).map((w): [string, string] => [
        w.id,
        w.name,
      ]),
      lang,
    ),
  };
  cache.set(lang, v);
  return v;
}
