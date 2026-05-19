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
  title?: string;
  vision: string;
  weapon: string;
  gender?: string;
  rarity: number;
  nation?: string | null;
  affiliation?: string;
  specialDish?: string;
  release?: string;
  constellation?: string;
  birthday?: string;
  description?: string;
  skillTalents?: unknown[];
  passiveTalents?: unknown[];
  constellations?: unknown[];
  outfits?: unknown[];
  ascension_materials?: Record<
    string,
    Array<{
      name?: string;
      value?: number;
    }>
  >;
};

type RelationFamily = {
  id?: string;
  name?: string;
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
  details?: Record<string, unknown>;
  assets?: Array<{
    key: string;
    label: string;
    path: string;
  }>;
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
const imagePathSchema = z.string().regex(/^\/images\/[a-z0-9/'-]+$/);
const sourceCharacterSchema = z
  .object({
    name: z.string().trim().min(1),
    vision: z.string().trim().min(1),
    weapon: z.string().trim().min(1),
    title: z.string().optional(),
    gender: z.string().optional(),
    rarity: z.number().int().min(4).max(5),
    nation: z.string().trim().min(1).nullable().optional(),
    affiliation: z.string().optional(),
    specialDish: z.string().optional(),
    release: z.string().optional(),
    constellation: z.string().optional(),
    birthday: z.string().optional(),
    description: z.string().optional(),
    skillTalents: z.array(z.unknown()).optional(),
    passiveTalents: z.array(z.unknown()).optional(),
    constellations: z.array(z.unknown()).optional(),
    outfits: z.array(z.unknown()).optional(),
    ascension_materials: z
      .record(
        z.string(),
        z.array(z.record(z.string(), z.union([z.string(), z.number()]))),
      )
      .optional(),
  })
  .passthrough();

const relationFamilySchema = z
  .object({
    id: seedIdSchema.optional(),
    name: z.string().trim().min(1).optional(),
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
    details: z.record(z.string(), z.unknown()).optional(),
    assets: z
      .array(
        z.object({
          key: z.string(),
          label: z.string(),
          path: imagePathSchema,
        }),
      )
      .optional(),
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

const travelerTalentBookFamilyIds: Record<string, string[]> = {
  "traveler-anemo": ["freedom", "resistance", "ballad"],
  "traveler-geo": ["prosperity", "diligence", "gold"],
  "traveler-electro": ["transience", "elegance", "light"],
  "traveler-dendro": ["admonition", "ingenuity", "praxis"],
  "traveler-hydro": ["equity", "justice", "order"],
  "traveler-pyro": ["contention", "kindling", "conflict"],
};

const travelerTalentNames = [
  "Normal Attack",
  "Elemental Skill",
  "Elemental Burst",
] as const;

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
      name: displayCharacterName(seedId, characterData),
      image: toImagePath("characters", folderName, "icon-big"),
      rarity: characterData.rarity,
      element: characterData.vision,
      weaponType: characterData.weapon,
      region,
      details: buildCharacterDetails(characterData),
      assets: buildCharacterAssets(folderName),
    };
  });

  validateGeneratedCharacters(characters);
  return characters;
}

function buildCharacterDetails(
  characterData: CharacterData,
): Record<string, unknown> {
  return {
    title: characterData.title ?? null,
    gender: characterData.gender ?? null,
    affiliation: characterData.affiliation ?? null,
    specialDish: characterData.specialDish ?? null,
    release: characterData.release ?? null,
    constellation: characterData.constellation ?? null,
    birthday: characterData.birthday ?? null,
    description: characterData.description ?? null,
    skillTalents: summarizeNamedEntries(characterData.skillTalents ?? []),
    passiveTalents: summarizeNamedEntries(characterData.passiveTalents ?? []),
    constellations: summarizeNamedEntries(characterData.constellations ?? []),
    outfits: summarizeNamedEntries(characterData.outfits ?? []),
  };
}

function summarizeNamedEntries(entries: unknown[]) {
  return entries
    .filter((entry): entry is Record<string, unknown> =>
      Boolean(entry && typeof entry === "object"),
    )
    .map((entry) => ({
      name: typeof entry.name === "string" ? entry.name : null,
      unlock: typeof entry.unlock === "string" ? entry.unlock : null,
      description:
        typeof entry.description === "string" ? entry.description : null,
      level: typeof entry.level === "number" ? entry.level : null,
      type: typeof entry.type === "string" ? entry.type : null,
    }));
}

function buildCharacterAssets(folderName: string): CharacterRecord["assets"] {
  const assetOrder: Array<[string, string]> = [
    ["card", "Card"],
    ["portrait", "Portrait"],
    ["icon-big", "Icon"],
    ["icon-side", "Side Icon"],
    ["gacha-card", "Gacha Card"],
    ["gacha-splash", "Gacha Splash"],
    ["namecard-background", "Namecard"],
    ["constellation", "Constellation"],
    ["constellation-shape", "Constellation Shape"],
    ["talent-na", "Normal Attack"],
    ["talent-skill", "Skill"],
    ["talent-burst", "Burst"],
    ["talent-passive-0", "Passive 1"],
    ["talent-passive-1", "Passive 2"],
    ["talent-passive-2", "Passive 3"],
  ];

  const base = path.join(
    repoRoot,
    "public",
    "images",
    "characters",
    folderName,
  );
  const existingFiles = fs.existsSync(base) ? fs.readdirSync(base) : [];
  const assets = assetOrder
    .filter(([key]) => existingFiles.includes(key))
    .map(([key, label]) => ({
      key,
      label,
      path: toImagePath("characters", folderName, key),
    }));

  for (const file of existingFiles.filter((entry) =>
    entry.startsWith("outfit-"),
  )) {
    assets.push({
      key: file,
      label: titleFromAssetKey(file),
      path: toImagePath("characters", folderName, file),
    });
  }

  return assets;
}

function titleFromAssetKey(key: string): string {
  return key
    .split("-")
    .filter(Boolean)
    .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
    .join(" ");
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
    const characterName = displayCharacterName(seedId, characterData);

    try {
      templates.push(
        ...buildAscensionTemplates(seedId, characterData, characterName),
      );
    } catch (error) {
      console.warn(
        `Skipping ascension templates for ${seedId}: ${(error as Error).message}`,
      );
    }

    try {
      templates.push(
        ...buildTalentTemplates(seedId, folderName, characterName),
      );
    } catch (error) {
      console.warn(
        `Skipping talent templates for ${seedId}: ${(error as Error).message}`,
      );
    }
  }

  validateGeneratedCharacterGoalTemplates(templates, characterIds);
  return templates;
}

function buildAscensionTemplates(
  characterId: string,
  characterData: CharacterData,
  characterName: string,
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
      description: `${ordinal(index + 1)} ascension materials for ${characterName}`,
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
  const isTraveler = characterId.startsWith("traveler-");
  const talentFamilies = isTraveler
    ? talentBookFamiliesForTraveler(characterId)
    : relationFamiliesForCharacter(talentBooks, folderName);
  const enemyFamily = relationFamilyForCharacter(commonAscension, folderName);
  const bossFamily = relationFamilyForCharacter(talentBoss, folderName);

  const talentItemsByFamily = talentFamilies
    .map((family) => family.items)
    .filter((items): items is NonNullable<RelationFamily["items"]> =>
      Boolean(items),
    );
  const enemyItems = enemyFamily?.items;
  const bossItems =
    bossFamily?.items ??
    (bossFamily?.id && bossFamily?.name
      ? [{ id: bossFamily.id, name: bossFamily.name }]
      : undefined);

  if (!talentItemsByFamily.length || !enemyItems || !bossItems?.[0]) {
    throw new Error(
      `Missing template source data for character: ${characterId}`,
    );
  }

  if (isTraveler) {
    return buildTravelerTalentTemplates(
      characterId,
      characterName,
      talentItemsByFamily,
      enemyItems,
      bossItems[0],
    );
  }

  const talentMaterialFamilies = [talentItemsByFamily[0]];
  const [enemyOne, enemyTwo, enemyThree] = enemyItems;
  const weeklyBoss = bossItems[0];

  const talentMaterialsForTier = (familyItemIndex: number, quantity: number) =>
    talentMaterialFamilies.map((items) => ({
      id: items[familyItemIndex].id,
      qty: quantity,
    }));

  const commonEnemyQuantity = (quantity: number) => quantity;
  const crownQuantity = 1;
  const talentGoalPrefix = "Talent";
  const talentGoalDescription = "a single talent";

  const levelCosts = [
    {
      from: 1,
      to: 2,
      materials: [
        ...talentMaterialsForTier(0, 3),
        { id: enemyOne.id, qty: commonEnemyQuantity(6) },
      ],
    },
    {
      from: 2,
      to: 3,
      materials: [
        ...talentMaterialsForTier(1, 2),
        { id: enemyTwo.id, qty: commonEnemyQuantity(3) },
      ],
    },
    {
      from: 3,
      to: 4,
      materials: [
        ...talentMaterialsForTier(1, 4),
        { id: enemyTwo.id, qty: commonEnemyQuantity(4) },
      ],
    },
    {
      from: 4,
      to: 5,
      materials: [
        ...talentMaterialsForTier(1, 6),
        { id: enemyTwo.id, qty: commonEnemyQuantity(6) },
      ],
    },
    {
      from: 5,
      to: 6,
      materials: [
        ...talentMaterialsForTier(1, 9),
        { id: enemyTwo.id, qty: commonEnemyQuantity(9) },
      ],
    },
    {
      from: 6,
      to: 7,
      materials: [
        ...talentMaterialsForTier(2, 4),
        { id: enemyThree.id, qty: commonEnemyQuantity(4) },
        { id: weeklyBoss.id, qty: commonEnemyQuantity(1) },
      ],
    },
    {
      from: 7,
      to: 8,
      materials: [
        ...talentMaterialsForTier(2, 6),
        { id: enemyThree.id, qty: commonEnemyQuantity(6) },
        { id: weeklyBoss.id, qty: commonEnemyQuantity(1) },
      ],
    },
    {
      from: 8,
      to: 9,
      materials: [
        ...talentMaterialsForTier(2, 12),
        { id: enemyThree.id, qty: commonEnemyQuantity(9) },
        { id: weeklyBoss.id, qty: commonEnemyQuantity(2) },
      ],
    },
    {
      from: 9,
      to: 10,
      materials: [
        ...talentMaterialsForTier(2, 16),
        { id: enemyThree.id, qty: commonEnemyQuantity(12) },
        { id: weeklyBoss.id, qty: commonEnemyQuantity(2) },
        { id: "crown-of-insight", qty: crownQuantity },
      ],
    },
  ];

  const individualTemplates = levelCosts.map((tier, index) => ({
    characterId,
    name: `${talentGoalPrefix} Level ${tier.from} -> ${tier.to}`,
    description: `Materials to level ${talentGoalDescription} from ${tier.from} to ${tier.to} for ${characterName}`,
    category: "talent",
    sortOrder: index + 1,
    materials: tier.materials.map((m) => ({
      materialId: m.id,
      required: m.qty,
    })),
  }));

  // Add some helpful combined templates at the end
  const combinedTemplates = [
    {
      characterId,
      name: `${talentGoalPrefix} Level 1 -> 6`,
      description: `Materials to level ${talentGoalDescription} from 1 to 6 for ${characterName}`,
      category: "talent",
      sortOrder: levelCosts.length + 1,
      materials: [
        ...talentMaterialFamilies.map((items) => ({
          materialId: items[0].id,
          required: 3,
        })),
        ...talentMaterialFamilies.map((items) => ({
          materialId: items[1].id,
          required: 21,
        })),
        { materialId: enemyOne.id, required: commonEnemyQuantity(6) },
        { materialId: enemyTwo.id, required: commonEnemyQuantity(22) },
      ],
    },
    {
      characterId,
      name: `${talentGoalPrefix} Level 6 -> 10`,
      description: `Materials to max ${talentGoalDescription} from level 6 to 10 for ${characterName}`,
      category: "talent",
      sortOrder: levelCosts.length + 2,
      materials: [
        ...talentMaterialFamilies.map((items) => ({
          materialId: items[2].id,
          required: 38,
        })),
        { materialId: enemyThree.id, required: commonEnemyQuantity(31) },
        { materialId: weeklyBoss.id, required: commonEnemyQuantity(6) },
        { materialId: "crown-of-insight", required: crownQuantity },
      ],
    },
  ];

  return [...individualTemplates, ...combinedTemplates];
}

function buildTravelerTalentTemplates(
  characterId: string,
  characterName: string,
  talentItemsByFamily: NonNullable<RelationFamily["items"]>[],
  enemyItems: NonNullable<RelationFamily["items"]>,
  weeklyBoss: { id: string; name: string },
): CharacterGoalTemplateRecord[] {
  if (talentItemsByFamily.length !== travelerTalentNames.length) {
    throw new Error(
      `Traveler ${characterId} must have ${travelerTalentNames.length} talent book families`,
    );
  }

  const [enemyOne, enemyTwo, enemyThree] = enemyItems;

  if (!enemyOne || !enemyTwo || !enemyThree) {
    throw new Error(`Missing Traveler enemy material tiers: ${characterId}`);
  }

  const levelCostsForFamily = (
    talentItems: NonNullable<RelationFamily["items"]>,
  ) => [
    {
      from: 1,
      to: 2,
      materials: [
        { id: talentItems[0].id, qty: 3 },
        { id: enemyOne.id, qty: 6 },
      ],
    },
    {
      from: 2,
      to: 3,
      materials: [
        { id: talentItems[1].id, qty: 2 },
        { id: enemyTwo.id, qty: 3 },
      ],
    },
    {
      from: 3,
      to: 4,
      materials: [
        { id: talentItems[1].id, qty: 4 },
        { id: enemyTwo.id, qty: 4 },
      ],
    },
    {
      from: 4,
      to: 5,
      materials: [
        { id: talentItems[1].id, qty: 6 },
        { id: enemyTwo.id, qty: 6 },
      ],
    },
    {
      from: 5,
      to: 6,
      materials: [
        { id: talentItems[1].id, qty: 9 },
        { id: enemyTwo.id, qty: 9 },
      ],
    },
    {
      from: 6,
      to: 7,
      materials: [
        { id: talentItems[2].id, qty: 4 },
        { id: enemyThree.id, qty: 4 },
        { id: weeklyBoss.id, qty: 1 },
      ],
    },
    {
      from: 7,
      to: 8,
      materials: [
        { id: talentItems[2].id, qty: 6 },
        { id: enemyThree.id, qty: 6 },
        { id: weeklyBoss.id, qty: 1 },
      ],
    },
    {
      from: 8,
      to: 9,
      materials: [
        { id: talentItems[2].id, qty: 12 },
        { id: enemyThree.id, qty: 9 },
        { id: weeklyBoss.id, qty: 2 },
      ],
    },
    {
      from: 9,
      to: 10,
      materials: [
        { id: talentItems[2].id, qty: 16 },
        { id: enemyThree.id, qty: 12 },
        { id: weeklyBoss.id, qty: 2 },
        { id: "crown-of-insight", qty: 1 },
      ],
    },
  ];

  const templates = talentItemsByFamily.flatMap((talentItems, talentIndex) =>
    levelCostsForFamily(talentItems).map((tier, levelIndex) => ({
      characterId,
      name: `${travelerTalentNames[talentIndex]} Level ${tier.from} -> ${tier.to}`,
      description: `Materials to level ${travelerTalentNames[talentIndex].toLowerCase()} from ${tier.from} to ${tier.to} for ${characterName}`,
      category: "talent",
      sortOrder: talentIndex * 9 + levelIndex + 1,
      materials: tier.materials.map((material) => ({
        materialId: material.id,
        required: material.qty,
      })),
    })),
  );

  const allLevelOneToSix = talentItemsByFamily.flatMap((items) => [
    { materialId: items[0].id, required: 3 },
    { materialId: items[1].id, required: 21 },
  ]);
  const allLevelSixToTen = talentItemsByFamily.flatMap((items) => [
    { materialId: items[2].id, required: 38 },
  ]);

  return [
    ...templates,
    {
      characterId,
      name: "All Talents Level 1 -> 6",
      description: `Materials to level all talents from 1 to 6 for ${characterName}`,
      category: "talent",
      sortOrder: templates.length + 1,
      materials: [
        ...allLevelOneToSix,
        { materialId: enemyOne.id, required: 18 },
        { materialId: enemyTwo.id, required: 66 },
      ],
    },
    {
      characterId,
      name: "All Talents Level 6 -> 10",
      description: `Materials to max all talents from level 6 to 10 for ${characterName}`,
      category: "talent",
      sortOrder: templates.length + 2,
      materials: [
        ...allLevelSixToTen,
        { materialId: enemyThree.id, required: 93 },
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
  return relationFamiliesForCharacter(families, folderName)[0];
}

function relationFamiliesForCharacter(
  families: Record<string, RelationFamily>,
  folderName: string,
): RelationFamily[] {
  const aliases = new Set([folderName, relationAlias(folderName)]);

  return Object.values(families).filter((family) =>
    (family.characters ?? []).some((character) =>
      aliases.has(relationAlias(character)),
    ),
  );
}

function talentBookFamiliesForTraveler(characterId: string): RelationFamily[] {
  const familyIds = travelerTalentBookFamilyIds[characterId];

  if (!familyIds) {
    throw new Error(`Missing Traveler talent book mapping for: ${characterId}`);
  }

  return familyIds.map((familyId) => {
    const family = talentBooks[familyId];

    if (!family) {
      throw new Error(`Missing Traveler talent book family: ${familyId}`);
    }

    return family;
  });
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

function displayCharacterName(
  characterId: string,
  characterData: CharacterData,
): string {
  if (characterId.startsWith("traveler-")) {
    return `Traveler (${characterData.vision})`;
  }

  return characterData.name;
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
    if (seenNames.has(normalizedName) && normalizedName !== "traveler") {
      throw new Error(`Duplicate character name generated: ${character.name}`);
    }
    seenNames.add(normalizedName);

    if (!repoImageExists(character.image)) {
      console.warn(
        `Warning: Missing repo image for character ${character.id}: ${character.image}`,
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
      throw new Error(
        `Duplicate character goal template key generated: ${key}`,
      );
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
