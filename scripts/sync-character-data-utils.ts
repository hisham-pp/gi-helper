import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

import {
  buildMaterialCatalog,
  canonicalizeSourceMaterialName,
  loadCurrentCharacterMetadata,
  normalizeLookupKey,
  readJsonWithSchema,
  repoRoot,
  repoImageExists,
  slugifyId,
  toImagePath,
} from "./sync-seed-data-utils";

type CharacterData = {
  name: string;
  vision: string;
  weapon: string;
  rarity: number;
  nation?: string;
  ascension_materials?: Record<
    string,
    Array<{
      name?: string;
      value?: number;
    }>
  >;
};

type RelationFamily = {
  characters?: string[];
  items?: Array<{
    id: string;
    name: string;
  }>;
};

export type CharacterRecord = {
  id: string;
  name: string;
  image: string;
  rarity: number;
  element: string;
  weaponType: string;
  region: string;
};

export type CharacterGoalTemplateRecord = {
  characterId: string;
  name: string;
  description: string;
  category: string;
  sortOrder: number;
  materials: Array<{
    materialId: string;
    required: number;
  }>;
};

const currentCharacterMeta = loadCurrentCharacterMetadata();
const materialCatalog = buildMaterialCatalog();
const { byId: materialsById, byName: materialsByName } = materialCatalog;

const seedIdSchema = z.string().regex(/^[a-z0-9]+(?:[-'][a-z0-9]+)*$/);
const imagePathSchema = z.string().regex(/^\/image\/[a-z0-9/'-]+$/);
const sourceCharacterSchema = z
  .object({
    name: z.string().trim().min(1),
    vision: z.string().trim().min(1),
    weapon: z.string().trim().min(1),
    rarity: z.number().int().min(4).max(5),
    nation: z.string().trim().min(1).optional(),
    ascension_materials: z
      .record(
        z.string(),
        z.array(
          z
            .record(z.string(), z.union([z.string(), z.number()])),
        ),
      )
      .optional(),
  })
  .passthrough();

const relationFamilySchema = z
  .object({
    characters: z.array(z.string().trim().min(1)).optional(),
    items: z
      .array(
        z
          .object({
            id: seedIdSchema,
            name: z.string().trim().min(1),
            rarity: z.number().int().min(1).max(5).optional(),
          })
          .strict(),
      )
      .optional(),
  })
  .passthrough();

const characterRecordSchema = z
  .object({
    id: seedIdSchema,
    name: z.string().trim().min(1),
    image: imagePathSchema,
    rarity: z.number().int().min(4).max(5),
    element: z.string().trim().min(1),
    weaponType: z.string().trim().min(1),
    region: z.string().trim().min(1),
  })
  .strict();

const characterGoalTemplateSchema = z
  .object({
    characterId: seedIdSchema,
    name: z.string().trim().min(1),
    description: z.string().trim().min(1),
    category: z.enum(["ascension", "talent"]),
    sortOrder: z.number().int().positive(),
    materials: z
      .array(
        z
          .object({
            materialId: seedIdSchema,
            required: z.number().int().positive(),
          })
          .strict(),
      )
      .min(1),
  })
  .strict();

const commonAscension = readJsonWithSchema(
  "data/materials/common-ascension/en.json",
  z.record(z.string(), relationFamilySchema),
);
const talentBooks = readJsonWithSchema(
  "data/materials/talent-book/en.json",
  z.record(z.string(), relationFamilySchema),
);
const talentBoss = readJsonWithSchema(
  "data/materials/talent-boss/en.json",
  z.record(z.string(), relationFamilySchema),
);

const characterDirectories = fs
  .readdirSync(path.join(repoRoot, "data/characters"), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort((left, right) => left.localeCompare(right));

export function buildCharacters(): CharacterRecord[] {
  const characters = characterDirectories.map((folderName) => {
    const characterData = readJsonWithSchema(
      path.posix.join("data/characters", folderName, "en.json"),
      sourceCharacterSchema,
    );
    const existing = currentCharacterMeta.get(
      normalizeLookupKey(characterData.name),
    );
    const seedId = existing?.id ?? folderName;
    const region = existing?.region ?? characterData.nation ?? "Unknown";

    return {
      id: seedId,
      name: characterData.name,
      image: toImagePath("characters", folderName, "icon-big"),
      rarity: characterData.rarity,
      element: characterData.vision,
      weaponType: characterData.weapon,
      region,
    };
  });

  validateGeneratedCharacters(characters);
  return characters;
}

export function buildCharacterGoalTemplates(): CharacterGoalTemplateRecord[] {
  const templates: CharacterGoalTemplateRecord[] = [];
  const characters = buildCharacters();
  const characterIds = new Set(characters.map((character) => character.id));

  for (const folderName of characterDirectories) {
    const characterData = readJsonWithSchema(
      path.posix.join("data/characters", folderName, "en.json"),
      sourceCharacterSchema,
    );
    const existing = currentCharacterMeta.get(
      normalizeLookupKey(characterData.name),
    );
    const seedId = existing?.id ?? folderName;

    templates.push(
      ...buildAscensionTemplates(seedId, characterData),
      ...buildTalentTemplates(seedId, folderName, characterData.name),
    );
  }

  validateGeneratedCharacterGoalTemplates(templates, characterIds);
  return templates;
}

function buildAscensionTemplates(
  characterId: string,
  characterData: CharacterData,
): CharacterGoalTemplateRecord[] {
  const ascensionMaterials = characterData.ascension_materials ?? {};
  const levels = Object.keys(ascensionMaterials)
    .map((key) => Number(key.replace("level_", "")))
    .filter((level) => Number.isFinite(level) && level >= 20)
    .sort((left, right) => left - right);

  return levels.map((level, index) => {
    const nextLevel = nextAscensionLevel(level);
    const tier = ascensionMaterials[`level_${level}`] ?? [];
    const materials = tier
      .filter(
        (item) =>
          typeof item.name === "string" &&
          typeof item.value === "number" &&
          normalizeLookupKey(item.name) !== "mora",
      )
      .map((item) => ({
        materialId: materialIdForName(item.name as string, characterId),
        required: item.value as number,
      }));

    return {
      characterId,
      name: `Ascension ${index + 1} (Lv. ${level} -> ${nextLevel})`,
      description: `${ordinal(index + 1)} ascension materials for ${characterData.name}`,
      category: "ascension",
      sortOrder: index + 1,
      materials,
    };
  });
}

function buildTalentTemplates(
  characterId: string,
  folderName: string,
  characterName: string,
): CharacterGoalTemplateRecord[] {
  const talentFamily = relationFamilyForCharacter(talentBooks, folderName);
  const enemyFamily = relationFamilyForCharacter(commonAscension, folderName);
  const bossFamily = relationFamilyForCharacter(talentBoss, folderName);

  if (!talentFamily?.items || !enemyFamily?.items || !bossFamily?.items?.[0]) {
    throw new Error(`Missing template source data for character: ${characterId}`);
  }

  const [teachings, guide, philosophies] = talentFamily.items;
  const [enemyOne, enemyTwo, enemyThree] = enemyFamily.items;
  const weeklyBoss = bossFamily.items[0];

  return [
    {
      characterId,
      name: "All Talents Level 1 -> 6",
      description: `Materials to level all three talents from 1 to 6 for ${characterName}`,
      category: "talent",
      sortOrder: 1,
      materials: [
        { materialId: teachings.id, required: 9 },
        { materialId: guide.id, required: 63 },
        { materialId: enemyOne.id, required: 18 },
        { materialId: enemyTwo.id, required: 66 },
      ],
    },
    {
      characterId,
      name: "Single Talent Level 6 -> 10",
      description: `Materials to max one talent from level 6 to 10 for ${characterName}`,
      category: "talent",
      sortOrder: 2,
      materials: [
        { materialId: guide.id, required: 4 },
        { materialId: philosophies.id, required: 38 },
        { materialId: enemyTwo.id, required: 6 },
        { materialId: enemyThree.id, required: 22 },
        { materialId: weeklyBoss.id, required: 6 },
        { materialId: "crown-of-insight", required: 1 },
      ],
    },
    {
      characterId,
      name: "Triple Crown (All Talents 6 -> 10)",
      description: `Materials to max all three talents from level 6 to 10 for ${characterName}`,
      category: "talent",
      sortOrder: 3,
      materials: [
        { materialId: guide.id, required: 12 },
        { materialId: philosophies.id, required: 114 },
        { materialId: enemyTwo.id, required: 18 },
        { materialId: enemyThree.id, required: 66 },
        { materialId: weeklyBoss.id, required: 18 },
        { materialId: "crown-of-insight", required: 3 },
      ],
    },
  ];
}

function relationFamilyForCharacter(
  families: Record<string, RelationFamily>,
  folderName: string,
): RelationFamily | undefined {
  const aliases = new Set([folderName, relationAlias(folderName)]);

  return Object.values(families).find((family) =>
    (family.characters ?? []).some((character) =>
      aliases.has(relationAlias(character)),
    ),
  );
}

function relationAlias(value: string): string {
  const normalized = value.trim().toLowerCase();

  switch (normalized) {
    case "arlechino":
      return "arlecchino";
    case "dahlia":
      return "dhalia";
    default:
      return normalized;
  }
}

function materialIdForName(name: string, characterId: string): string {
  const canonicalName = canonicalizeSourceMaterialName(name);
  const material =
    materialsByName.get(normalizeLookupKey(canonicalName)) ??
    materialsById.get(slugifyId(canonicalName));

  if (!material) {
    throw new Error(`Missing material mapping for "${name}" on ${characterId}`);
  }

  return material.id;
}

function validateGeneratedCharacters(characters: CharacterRecord[]): void {
  const seenIds = new Set<string>();
  const seenNames = new Set<string>();

  for (const character of characters) {
    characterRecordSchema.parse(character);

    if (seenIds.has(character.id)) {
      throw new Error(`Duplicate character id generated: ${character.id}`);
    }
    seenIds.add(character.id);

    const normalizedName = normalizeLookupKey(character.name);
    if (seenNames.has(normalizedName)) {
      throw new Error(`Duplicate character name generated: ${character.name}`);
    }
    seenNames.add(normalizedName);

    if (!repoImageExists(character.image)) {
      throw new Error(
        `Missing repo image for character ${character.id}: ${character.image}`,
      );
    }
  }
}

function validateGeneratedCharacterGoalTemplates(
  templates: CharacterGoalTemplateRecord[],
  characterIds: Set<string>,
): void {
  const seenKeys = new Set<string>();

  for (const template of templates) {
    characterGoalTemplateSchema.parse(template);

    if (!characterIds.has(template.characterId)) {
      throw new Error(
        `Goal template references unknown character: ${template.characterId}`,
      );
    }

    const key = `${template.characterId}:${template.category}:${template.sortOrder}`;
    if (seenKeys.has(key)) {
      throw new Error(`Duplicate character goal template key generated: ${key}`);
    }
    seenKeys.add(key);

    const seenMaterialIds = new Set<string>();
    for (const material of template.materials) {
      if (!materialsById.has(material.materialId)) {
        throw new Error(
          `Goal template ${key} references unknown material: ${material.materialId}`,
        );
      }

      if (seenMaterialIds.has(material.materialId)) {
        throw new Error(
          `Goal template ${key} contains duplicate material: ${material.materialId}`,
        );
      }
      seenMaterialIds.add(material.materialId);
    }
  }
}

function ordinal(value: number): string {
  switch (value) {
    case 1:
      return "First";
    case 2:
      return "Second";
    case 3:
      return "Third";
    case 4:
      return "Fourth";
    case 5:
      return "Fifth";
    case 6:
      return "Sixth";
    default:
      return `${value}th`;
  }
}

function nextAscensionLevel(level: number): number {
  switch (level) {
    case 20:
      return 40;
    case 40:
      return 50;
    case 50:
      return 60;
    case 60:
      return 70;
    case 70:
      return 80;
    case 80:
      return 90;
    default:
      throw new Error(`Unsupported ascension level: ${level}`);
  }
}
