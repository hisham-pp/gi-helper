import { z } from "zod";
import {
  ASCENSION_MAX_LEVEL,
  SLOT_KEYS,
  type GoodArtifact,
  type GoodCharacter,
  type GoodSubstat,
  type GoodWeapon,
} from "./types";

/**
 * Reading GOOD files (writing them is ./export.ts). Parsing is lenient, like Genshin
 * Optimizer's: out-of-range numbers are clamped, missing fields get defaults,
 * and entries that can't be used (no key, unknown slot) are skipped and
 * counted. Keys newer than our game data are kept as they are.
 */

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/** A whole number in [min, max]; anything unreadable becomes `fallback`. */
const int = (min: number, max: number, fallback: number) =>
  z.unknown().transform((v) => {
    const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
    return Number.isFinite(n) ? clamp(Math.round(n), min, max) : fallback;
  });

const bool = z.unknown().transform((v) => v === true);
const text = z.unknown().transform((v) => (typeof v === "string" ? v : ""));

/** The ascension that fits `level` (80 can be 80/80 or 80/90; anything else has one). */
export function fixAscension(level: number, ascension: number): number {
  const cap = ASCENSION_MAX_LEVEL[ascension] ?? 90;
  const below = ascension > 0 ? ASCENSION_MAX_LEVEL[ascension - 1] : 0;
  if (level <= cap && level >= below) return ascension;
  const fitting = ASCENSION_MAX_LEVEL.findIndex((max) => level <= max);
  return fitting === -1 ? 6 : fitting;
}

const characterSchema = z
  .object({
    key: z.string().min(1),
    level: int(1, 100, 1),
    constellation: int(0, 6, 0),
    ascension: int(0, 6, 0),
    talent: z
      .object({ auto: int(1, 15, 1), skill: int(1, 15, 1), burst: int(1, 15, 1) })
      .catch({ auto: 1, skill: 1, burst: 1 }),
  })
  .transform(
    (c): GoodCharacter => ({ ...c, ascension: fixAscension(c.level, c.ascension) }),
  );

const weaponSchema = z
  .object({
    key: z.string().min(1),
    level: int(1, 90, 1),
    ascension: int(0, 6, 0),
    refinement: int(1, 5, 1),
    location: text,
    lock: bool,
  })
  .transform((w): GoodWeapon => ({ ...w, ascension: fixAscension(w.level, w.ascension) }));

const substatSchema = z
  .object({
    key: text,
    value: z.unknown().transform((v) => (typeof v === "number" && Number.isFinite(v) ? v : 0)),
    initialValue: z.number().finite().optional().catch(undefined),
  })
  .transform((s): GoodSubstat => {
    const out: GoodSubstat = { key: s.key, value: s.value };
    if (s.initialValue !== undefined) out.initialValue = s.initialValue;
    return out;
  });

/** Substats with a key (GOOD writes empty slots as { key: "", value: 0 }). */
const substatList = z
  .array(z.unknown())
  .catch([])
  .transform((list) =>
    list.flatMap((s) => {
      const parsed = substatSchema.safeParse(s);
      return parsed.success && parsed.data.key ? [parsed.data] : [];
    }),
  );

const artifactSchema = z
  .object({
    setKey: z.string().min(1),
    slotKey: z.enum(SLOT_KEYS),
    level: int(0, 20, 0),
    rarity: int(1, 5, 5),
    mainStatKey: text,
    location: text,
    lock: bool,
    substats: substatList,
    totalRolls: z.number().int().min(0).max(9).optional().catch(undefined),
    astralMark: z.boolean().optional().catch(undefined),
    elixirCrafted: z.boolean().optional().catch(undefined),
    unactivatedSubstats: substatList.optional(),
  })
  .transform((a): GoodArtifact => {
    const out: GoodArtifact = {
      setKey: a.setKey,
      slotKey: a.slotKey,
      level: a.level,
      rarity: a.rarity,
      mainStatKey: a.mainStatKey,
      location: a.location,
      lock: a.lock,
      substats: a.substats,
    };
    if (a.totalRolls !== undefined) out.totalRolls = a.totalRolls;
    if (a.astralMark !== undefined) out.astralMark = a.astralMark;
    if (a.elixirCrafted !== undefined) out.elixirCrafted = a.elixirCrafted;
    if (a.unactivatedSubstats?.length) out.unactivatedSubstats = a.unactivatedSubstats;
    return out;
  });

/** Parses each entry on its own, so one bad entry doesn't sink the file. */
function parseList<T>(value: unknown, schema: z.ZodType<T, z.ZodTypeDef, unknown>) {
  if (!Array.isArray(value)) return { items: undefined, skipped: 0 };
  const items: T[] = [];
  let skipped = 0;
  for (const entry of value) {
    const parsed = schema.safeParse(entry);
    if (parsed.success) items.push(parsed.data);
    else skipped++;
  }
  return { items, skipped };
}

export interface ParsedGOOD {
  source: string;
  version: number;
  /** Sections the file has; a missing section is undefined, not empty. */
  characters?: GoodCharacter[];
  weapons?: GoodWeapon[];
  artifacts?: GoodArtifact[];
  materials?: Record<string, number>;
  /** Entries that couldn't be read. */
  skipped: number;
}

export type ParseGOODResult = { ok: true; data: ParsedGOOD } | { ok: false; error: string };

/** Reads a GOOD file's text (or already-parsed JSON). */
export function parseGOOD(input: string | unknown): ParseGOODResult {
  let json: unknown = input;
  if (typeof input === "string") {
    try {
      json = JSON.parse(input);
    } catch {
      return { ok: false, error: "This file isn't valid JSON." };
    }
  }
  if (!json || typeof json !== "object" || (json as { format?: unknown }).format !== "GOOD") {
    return { ok: false, error: "This isn't a GOOD file (it has no \"format\": \"GOOD\")." };
  }
  const doc = json as Record<string, unknown>;

  const characters = parseList(doc.characters, characterSchema);
  const weapons = parseList(doc.weapons, weaponSchema);
  const artifacts = parseList(doc.artifacts, artifactSchema);

  let materials: Record<string, number> | undefined;
  let skippedMaterials = 0;
  if (doc.materials && typeof doc.materials === "object" && !Array.isArray(doc.materials)) {
    materials = {};
    for (const [key, value] of Object.entries(doc.materials)) {
      if (key && typeof value === "number" && Number.isFinite(value) && value >= 0) {
        materials[key] = Math.floor(value);
      } else {
        skippedMaterials++;
      }
    }
  }

  // Keep only one entry per character, the last one (GOOD lists each once)
  const uniqueCharacters = characters.items && [
    ...new Map(characters.items.map((c) => [c.key, c])).values(),
  ];

  return {
    ok: true,
    data: {
      source: typeof doc.source === "string" ? doc.source : "",
      version: typeof doc.version === "number" ? doc.version : 1,
      characters: uniqueCharacters,
      weapons: weapons.items,
      artifacts: artifacts.items,
      materials,
      skipped:
        characters.skipped +
        (characters.items?.length ?? 0) -
        (uniqueCharacters?.length ?? 0) +
        weapons.skipped +
        artifacts.skipped +
        skippedMaterials,
    },
  };
}
