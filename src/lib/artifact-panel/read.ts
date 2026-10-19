/**
 * Reading a captured artifact detail panel: OCR of its fields, snapping the
 * text to the game's names, and checking the numbers against what the
 * rarity and level allow. Anything that doesn't add up is listed in
 * `issues` for the review instead of being guessed.
 */
import { MAIN_STATS_BY_SLOT, type SlotKey } from "../good/types";
import type { ArtifactPanelCapture, PanelField } from "./engine/capture";
import { joinLines, parseLevel, parseNumber, parseRefinement, parseStatBlock, parseWeaponLevelAndCap, statKey } from "./engine/parse";
import { checkSubstats, levelsForMainValue, mainStatFits, maxArtifactLevel } from "./engine/stats";
import { EQUIPPED_PREFIX, snap, vocabulary, type PanelLanguage, type StatName } from "./engine/vocabulary";
import { matchAvatarAtlas } from "./engine/avatar";
import type { OcrLanguage, PanelOcr } from "./ocr";
import { getAllCharacters } from "../characters";
import { getArtifactSetById, getWeaponById } from "../good/catalog";
import type { AtlasManifest } from "../material-detector/engine/bank";
import type { RgbaImage } from "../grid-detector/engine/image";

export interface PanelSubstat {
  key: string;
  value: number;
}

export interface ArtifactPanelReading {
  /** "artifact" or "weapon" */
  kind?: "artifact" | "weapon";
  /** The game client's language, told by the slot name. */
  language: PanelLanguage;
  /** From the piece name, or the set name with the slot (null for weapons). */
  setId: string | null;
  /** Artifact slot (null for weapons). */
  slot: SlotKey | null;
  /** Weapon ID e.g. "prototype-archaic" (null for artifacts). */
  weaponId?: string | null;
  /** Refinement rank 1-5 (for weapons). */
  refinement?: number | null;
  /** Level cap e.g. 80, 90 (for weapons). */
  levelCap?: number | null;
  /** Ascension 0-6 settled by level cap (for weapons). */
  ascension?: number | null;
  rarity: number | null;
  level: number | null;
  locked: boolean;
  /** GOOD key ("hp", "critDMG_"…); null when unreadable. */
  mainStatKey: string | null;
  /** As shown (46.6 for 46.6%). */
  mainStatValue: number | null;
  substats: PanelSubstat[];
  /** A +0 artifact's 4th substat, shown but not active yet (GOOD 3 `unactivatedSubstats`). */
  unactivatedSubstats: PanelSubstat[];
  /** GOOD location key of the character wearing it ("" when not equipped or not recognised). */
  location: string;
  /** What doesn't add up, worded for the review; empty when every check passed. */
  issues: string[];
  /** The OCR text of each field (for debugging and the evaluation). */
  text: Partial<Record<PanelField, string>>;
}

const OCR_LANG: Record<PanelLanguage, OcrLanguage> = { en: "eng", zh: "chi_sim" };
const NUMBER_CHARS = "0123456789.,%";

export interface ReadOptions {
  /** Try this language first (the one the last panel was in). */
  preferLanguage?: PanelLanguage;
  /** Character reference atlas (manifest and image) to identify equipped characters / Traveler. */
  characterAtlas?: {
    manifest: AtlasManifest;
    image: RgbaImage;
  };
}

/**
 * The game language and slot, from the slot line ("Sands of Eon" /
 * "时之沙"): the cheapest field, and one that only artifact panels have.
 */
async function readSlot(
  capture: ArtifactPanelCapture,
  ocr: PanelOcr,
  prefer: PanelLanguage,
): Promise<{ language: PanelLanguage; slot: SlotKey; text: string } | null> {
  const image = capture.fields.slot;
  if (!image) return null;
  const order: PanelLanguage[] = prefer === "zh" ? ["zh", "en"] : ["en", "zh"];
  for (const language of order) {
    const text = await ocr.read(image, { lang: OCR_LANG[language], mode: "line" });
    const slot = snap(text, vocabulary(language).slots, language, 0.4);
    if (slot) return { language, slot: slot.value, text };
  }
  return null;
}

async function readWeaponPanel(
  capture: ArtifactPanelCapture,
  ocr: PanelOcr,
  options: ReadOptions = {},
): Promise<ArtifactPanelReading | null> {
  const language: PanelLanguage = options.preferLanguage ?? "en";
  const lang = OCR_LANG[language];
  const vocab = vocabulary(language);
  const f = capture.fields;
  const text: ArtifactPanelReading["text"] = {};
  const read = async (field: PanelField, mode: "word" | "line" | "block", whitelist?: string) => {
    const image = f[field];
    if (!image) return "";
    const t = await ocr.read(image, { lang: field === "level" || field === "refinement" ? "eng" : lang, mode, whitelist });
    text[field] = t;
    return t;
  };

  const [name, levelText, refinementText, equippedText] = await Promise.all([
    read("name", "line"),
    read("level", "block", "Lv.0123456789/ "),
    read("refinement", "line"),
    read("equipped", "line"),
  ]);

  const issues: string[] = [];
  const weaponSnap = snap(joinLines(name), vocab.weapons, language);
  const weaponId = weaponSnap?.value ?? null;
  if (!weaponId) issues.push("Couldn't read the weapon name");

  const weaponInfo = weaponId ? getWeaponById(weaponId) : undefined;
  const rarity = capture.stars ?? capture.headerRarity ?? weaponInfo?.rarity ?? null;
  if (rarity === null) issues.push("Couldn't count the stars");

  const parsedLvl = parseWeaponLevelAndCap(levelText);
  const level = parsedLvl?.level ?? null;
  const levelCap = parsedLvl?.cap ?? null;
  const ascension = parsedLvl?.ascension ?? null;
  if (level === null) issues.push("Couldn't read the level");

  const refinement = parseRefinement(refinementText) ?? (capture.fields.refinement ? null : 1);
  if (refinement === null) issues.push("Couldn't read the refinement rank");

  let location = "";
  if (equippedText.trim()) {
    const spoken = language === "zh" ? equippedText.replace(/\s+/g, "") : equippedText;
    const who = snap(spoken.replace(EQUIPPED_PREFIX[language], "").trim(), vocab.characters, language, 0.3);
    const character = who ? getAllCharacters().find((c) => c.id === who.value) : undefined;
    if (character && character.key !== "Traveler") {
      location = character.key;
    } else if (capture.avatar && options.characterAtlas) {
      const match = matchAvatarAtlas(capture.avatar, options.characterAtlas.manifest, options.characterAtlas.image);
      if (match) location = match.location;
    } else if (who && character?.key === "Traveler") {
      location = "Traveler";
    }
  } else if (capture.avatar && options.characterAtlas) {
    const match = matchAvatarAtlas(capture.avatar, options.characterAtlas.manifest, options.characterAtlas.image);
    if (match) location = match.location;
  }

  return {
    kind: "weapon",
    language,
    setId: null,
    slot: null,
    weaponId,
    refinement,
    levelCap,
    ascension,
    rarity,
    level,
    locked: capture.locked,
    mainStatKey: null,
    mainStatValue: null,
    substats: [],
    unactivatedSubstats: [],
    location,
    issues,
    text,
  };
}

/**
 * Reads a captured panel. Returns null when the panel turns out not to be
 * an artifact's (its slot line names no artifact slot in any language) and
 * not a weapon's.
 */
export async function readArtifactPanel(
  capture: ArtifactPanelCapture,
  ocr: PanelOcr,
  options: ReadOptions = {},
): Promise<ArtifactPanelReading | null> {
  if (capture.kind === "weapon") {
    return readWeaponPanel(capture, ocr, options);
  }
  const found = await readSlot(capture, ocr, options.preferLanguage ?? "en");
  if (!found) return null;
  const { language } = found;
  const lang = OCR_LANG[language];
  const vocab = vocabulary(language);
  const f = capture.fields;
  const text: ArtifactPanelReading["text"] = { slot: found.text };
  const read = async (field: PanelField, mode: "word" | "line" | "block", whitelist?: string) => {
    const image = f[field];
    if (!image) return "";
    const t = await ocr.read(image, { lang: field === "level" || field === "mainValue" ? "eng" : lang, mode, whitelist });
    text[field] = t;
    return t;
  };
  const [name, mainName, mainValue, levelText, statsText, setText, equippedText] = await Promise.all([
    read("name", "block"),
    read("mainName", "line"),
    read("mainValue", "line", NUMBER_CHARS),
    read("level", "word", "+0123456789"),
    read("stats", "block"),
    read("setName", "line"),
    read("equipped", "line"),
  ]);
  const issues: string[] = [];

  // Which piece: the name says set and slot at once; the set line and the slot line back it up.
  let slot: SlotKey | null = found.slot;
  const piece = snap(joinLines(name), vocab.pieces, language);
  const setLine = snap(joinLines(setText).replace(/[:：]\s*$/, ""), vocab.sets, language);
  let setId: string | null = null;
  if (piece && piece.value.slot === slot) {
    setId = piece.value.setId;
  } else if (setLine && getArtifactSetById(setLine.value)?.pieces[slot]) {
    setId = setLine.value;
  } else if (piece) {
    // The slot line was misread more likely than the whole name.
    setId = piece.value.setId;
    slot = piece.value.slot;
  }
  if (piece && setLine && piece.value.setId !== setLine.value) issues.push("The piece name and set name disagree");
  if (!setId) issues.push("Couldn't read the set");

  // Rarity: the stars, else the header's colour.
  let rarity = capture.stars ?? capture.headerRarity;
  const set = setId ? getArtifactSetById(setId) : undefined;
  if (rarity !== null && set && !set.rarities.includes(rarity)) {
    issues.push(`${set.name} has no ${rarity}★ pieces`);
  }
  if (rarity === null && set?.rarities.length === 1) rarity = set.rarities[0];
  if (rarity === null) issues.push("Couldn't count the stars");

  // Main stat: the name, with "%" deciding HP / ATK / DEF; fixed on flowers and plumes.
  const value = parseNumber(mainValue);
  let mainStatKey: string | null = null;
  const allowed = MAIN_STATS_BY_SLOT[slot];
  if (allowed.length === 1) {
    mainStatKey = allowed[0];
  } else {
    const entries = vocab.stats.filter((e) => allowed.includes(statKey(e.value, true) as never) || allowed.includes(e.value as never));
    const statName = snap(mainName, entries, language, 0.4);
    if (statName) {
      const key = statKey(statName.value as StatName, value?.percent ?? true);
      mainStatKey = allowed.includes(key as never) ? key : null;
    }
  }
  if (!mainStatKey) issues.push("Couldn't read the main stat");

  // Level: the badge, checked against the main stat value (which also gives it when the badge is unreadable).
  let level = parseLevel(levelText);
  if (level !== null && rarity !== null && level > maxArtifactLevel(rarity)) level = null;
  if (rarity !== null && mainStatKey && value) {
    const fits = level !== null && mainStatFits(rarity, mainStatKey, level, value.value);
    if (!fits) {
      const levels = levelsForMainValue(rarity, mainStatKey, value.value);
      if (level === null && levels.length === 1) level = levels[0];
      else issues.push("The main stat value doesn't match the level");
    }
  } else if (mainStatKey && !value) {
    issues.push("Couldn't read the main stat value");
  }
  if (level === null) issues.push("Couldn't read the level");

  // Substats, checked against the rolls the rarity and level allow.
  const lines = parseStatBlock(statsText, language);
  const substats = lines.filter((s) => !s.unactivated).map(({ key, value }) => ({ key, value }));
  const unactivatedSubstats = lines.filter((s) => s.unactivated).map(({ key, value }) => ({ key, value }));
  if (substats.length === 0) {
    if (rarity === null || rarity > 2 || (level ?? 0) >= 4) issues.push("Couldn't read the substats");
  } else if (rarity !== null && level !== null) {
    const check = checkSubstats(rarity, level, substats);
    if (!check.consistent) {
      const wrong = check.possible.map((p, i) => (p ? null : substats[i])).filter(Boolean);
      issues.push(
        wrong.length > 0
          ? `Substat value${wrong.length > 1 ? "s" : ""} the game can't roll: ${wrong.map((s) => `${s!.key} ${s!.value}`).join(", ")}`
          : `The substats don't add up for a ${rarity}★ +${level} artifact`,
      );
    }
  }
  if (new Set(substats.map((s) => s.key)).size < substats.length) issues.push("A substat was read twice");
  if (mainStatKey && substats.some((s) => s.key === mainStatKey)) issues.push("A substat repeats the main stat");

  // Who wears it.
  let location = "";
  if (equippedText.trim()) {
    const spoken = language === "zh" ? equippedText.replace(/\s+/g, "") : equippedText;
    const who = snap(spoken.replace(EQUIPPED_PREFIX[language], "").trim(), vocab.characters, language, 0.3);
    const character = who ? getAllCharacters().find((c) => c.id === who.value) : undefined;
    if (character && character.key !== "Traveler") {
      location = character.key;
    } else if (capture.avatar && options.characterAtlas) {
      const match = matchAvatarAtlas(capture.avatar, options.characterAtlas.manifest, options.characterAtlas.image);
      if (match) location = match.location;
    } else if (who && character?.key === "Traveler") {
      location = "Traveler";
    }
  } else if (capture.avatar && options.characterAtlas) {
    const match = matchAvatarAtlas(capture.avatar, options.characterAtlas.manifest, options.characterAtlas.image);
    if (match) location = match.location;
  }

  return {
    kind: "artifact",
    language,
    setId,
    slot,
    rarity,
    level,
    locked: capture.locked,
    mainStatKey,
    mainStatValue: value?.value ?? null,
    substats,
    unactivatedSubstats,
    location,
    issues,
    text,
  };
}
