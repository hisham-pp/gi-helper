import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

import {
  buildMaterialCatalog,
  normalizeLookupKey,
  readJsonWithSchema,
  repoImageExists,
  repoRoot,
  slugifyId,
  toImagePath,
} from "./sync-seed-data-utils";

type WeaponData = {
  name: string;
  type: string;
  rarity: number;
  ascensionMaterial?: string;
};

type RelationFamily = {
  weapons?: string[];
  items?: Array<{
    id: string;
    name: string;
    rarity: number;
  }>;
};

export type WeaponRecord = {
  id: string;
  name: string;
  image: string;
  rarity: number;
  weaponType: string;
};

export type WeaponGoalTemplateRecord = {
  weaponId: string;
  name: string;
  description: string;
  category: string;
  sortOrder: number;
  materials: Array<{
    materialId: string;
    required: number;
  }>;
};

type WeaponAscensionCost = {
  from: number;
  to: number;
  weaponMaterial: { tier: number; quantity: number };
  eliteMaterial: { tier: number; quantity: number };
  commonMaterial: { tier: number; quantity: number };
};

type WeaponSource = {
  folderName: string;
  data: WeaponData;
  id: string;
};

const materialCatalog = buildMaterialCatalog();
const { byId: materialsById } = materialCatalog;

const seedIdSchema = z.string().regex(/^[a-z0-9]+(?:[-'][a-z0-9]+)*$/);
const imagePathSchema = z.string().regex(/^\/images\/weapons\/[^/]+\/icon$/);

const sourceWeaponSchema = z
  .object({
    name: z.string().trim().min(1),
    type: z.string().trim().min(1),
    rarity: z.number().int().min(1).max(5),
    ascensionMaterial: z.string().optional(),
  })
  .passthrough();

const relationFamilySchema = z
  .object({
    weapons: z.array(z.string().trim().min(1)).optional(),
    items: z
      .array(
        z
          .object({
            id: seedIdSchema,
            name: z.string().trim().min(1),
            rarity: z.number().int().min(1).max(5),
          })
          .strict(),
      )
      .optional(),
  })
  .passthrough();

const weaponRecordSchema = z
  .object({
    id: seedIdSchema,
    name: z.string().trim().min(1),
    image: imagePathSchema,
    rarity: z.number().int().min(1).max(5),
    weaponType: z.string().trim().min(1),
  })
  .strict();

const weaponGoalTemplateSchema = z
  .object({
    weaponId: seedIdSchema,
    name: z.string().trim().min(1),
    description: z.string().trim().min(1),
    category: z.enum(["ascension"]),
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

const weaponAscensionFamilies = readJsonWithSchema(
  "data/materials/weapon-ascension/en.json",
  z.record(z.string(), relationFamilySchema),
);
const commonAscensionFamilies = readJsonWithSchema(
  "data/materials/common-ascension/en.json",
  z.record(z.string(), relationFamilySchema),
);

const weaponDirectories = fs
  .readdirSync(path.join(repoRoot, "data/weapons"), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort((left, right) =>
    normalizeWeaponAlias(left).localeCompare(normalizeWeaponAlias(right)),
  );

const weaponSources = buildWeaponSources();

const weaponAscensionCostsByRarity: Record<number, WeaponAscensionCost[]> = {
  3: buildWeaponAscensionCosts({
    weapon: [2, 2, 4, 2, 4, 3],
    elite: [2, 8, 4, 8, 6, 12],
    common: [1, 5, 4, 6, 4, 8],
  }),
  4: buildWeaponAscensionCosts({
    weapon: [3, 3, 6, 3, 6, 4],
    elite: [3, 12, 6, 12, 9, 18],
    common: [2, 8, 6, 9, 6, 12],
  }),
  5: buildWeaponAscensionCosts({
    weapon: [5, 5, 9, 5, 9, 6],
    elite: [5, 18, 9, 18, 14, 27],
    common: [3, 12, 9, 14, 9, 18],
  }),
};

export function buildWeapons(): WeaponRecord[] {
  const weapons = weaponSources.map(({ folderName, data, id }) => ({
    id,
    name: data.name,
    image: toImagePath("weapons", folderName, "icon"),
    rarity: data.rarity,
    weaponType: data.type,
  }));

  validateGeneratedWeapons(weapons);
  return weapons;
}

export function buildWeaponGoalTemplates(): WeaponGoalTemplateRecord[] {
  const templates: WeaponGoalTemplateRecord[] = [];
  const weapons = buildWeapons();
  const weaponIds = new Set(weapons.map((weapon) => weapon.id));

  for (const { data, id } of weaponSources) {
    try {
      templates.push(...buildAscensionTemplates(id, data));
    } catch (error) {
      console.warn(
        `Skipping weapon templates for ${id}: ${(error as Error).message}`,
      );
    }
  }

  validateGeneratedWeaponGoalTemplates(templates, weaponIds);
  return templates;
}

function buildAscensionTemplates(
  weaponId: string,
  weaponData: WeaponData,
): WeaponGoalTemplateRecord[] {
  const costs = weaponAscensionCostsByRarity[weaponData.rarity];

  if (!costs) {
    throw new Error(`Unsupported weapon rarity: ${weaponData.rarity}`);
  }

  const weaponFamily = weaponAscensionFamilyForWeapon(weaponId, weaponData);
  const commonFamilies = commonAscensionFamiliesForWeapon(weaponId);
  const commonFamily = commonFamilies.find(
    (family) => family.items?.[0]?.rarity === 1,
  );
  const eliteFamily = commonFamilies.find(
    (family) => family.items?.[0]?.rarity === 2,
  );

  if (
    !weaponFamily?.items?.length ||
    !commonFamily?.items ||
    !eliteFamily?.items
  ) {
    throw new Error(`Missing template source data for weapon: ${weaponId}`);
  }

  const weaponItems = weaponFamily.items;
  const commonItems = commonFamily.items;
  const eliteItems = eliteFamily.items;

  return costs.map((cost, index) => ({
    weaponId,
    name: `Ascension ${index + 1} (Lv. ${cost.from} -> ${cost.to})`,
    description: `${ordinal(index + 1)} ascension materials for ${weaponData.name}`,
    category: "ascension",
    sortOrder: index + 1,
    materials: [
      {
        materialId: weaponItems[cost.weaponMaterial.tier].id,
        required: cost.weaponMaterial.quantity,
      },
      {
        materialId: eliteItems[cost.eliteMaterial.tier].id,
        required: cost.eliteMaterial.quantity,
      },
      {
        materialId: commonItems[cost.commonMaterial.tier].id,
        required: cost.commonMaterial.quantity,
      },
    ],
  }));
}

function readWeaponData(folderName: string): WeaponData {
  return readJsonWithSchema(
    path.posix.join("data/weapons", folderName, "en.json"),
    sourceWeaponSchema,
  );
}

function buildWeaponSources(): WeaponSource[] {
  const sourcesById = new Map<string, WeaponSource>();

  for (const folderName of weaponDirectories) {
    const data = readWeaponData(folderName);
    const id = weaponIdFor(folderName, data);
    const source = { folderName, data, id };
    const existing = sourcesById.get(id);

    if (!existing || weaponSourceRank(source) < weaponSourceRank(existing)) {
      sourcesById.set(id, source);
    }
  }

  const sourcesByName = new Map<string, WeaponSource>();
  for (const source of sourcesById.values()) {
    const nameKey = normalizeLookupKey(source.data.name);
    const existing = sourcesByName.get(nameKey);

    if (!existing || weaponSourceRank(source) < weaponSourceRank(existing)) {
      sourcesByName.set(nameKey, source);
    }
  }

  return Array.from(sourcesByName.values()).sort((left, right) =>
    left.id.localeCompare(right.id),
  );
}

function weaponSourceRank(source: WeaponSource): number {
  return (
    (source.id === slugifyId(source.data.name) ? 0 : 4) +
    (source.folderName === source.id ? 0 : 1) +
    (/[\u0080-\uFFFF]/.test(source.folderName) ? 2 : 0)
  );
}

function weaponIdFor(folderName: string, weaponData: WeaponData): string {
  return slugifyId(folderName) || slugifyId(weaponData.name);
}

function weaponAscensionFamilyForWeapon(
  weaponId: string,
  weaponData: WeaponData,
): RelationFamily | undefined {
  const ascensionMaterial = weaponData.ascensionMaterial?.trim();

  if (ascensionMaterial) {
    const explicitFamily =
      weaponAscensionFamilies[slugifyId(ascensionMaterial)] ??
      Object.entries(weaponAscensionFamilies).find(
        ([familyId, family]) =>
          normalizeWeaponAlias(familyId) ===
            normalizeWeaponAlias(ascensionMaterial) ||
          family.items?.some(
            (item) =>
              normalizeWeaponAlias(item.id) ===
                normalizeWeaponAlias(ascensionMaterial) ||
              normalizeWeaponAlias(item.name) ===
                normalizeWeaponAlias(ascensionMaterial),
          ),
      )?.[1];

    if (explicitFamily) {
      return explicitFamily;
    }
  }

  return relationFamiliesForWeapon(weaponAscensionFamilies, weaponId)[0];
}

function commonAscensionFamiliesForWeapon(weaponId: string): RelationFamily[] {
  return relationFamiliesForWeapon(commonAscensionFamilies, weaponId);
}

function relationFamiliesForWeapon(
  families: Record<string, RelationFamily>,
  weaponId: string,
): RelationFamily[] {
  const normalizedWeaponId = normalizeWeaponAlias(weaponId);

  return Object.values(families).filter((family) =>
    (family.weapons ?? []).some(
      (weapon) => normalizeWeaponAlias(weapon) === normalizedWeaponId,
    ),
  );
}

function normalizeWeaponAlias(value: string): string {
  return slugifyId(normalizeLookupKey(value));
}

function buildWeaponAscensionCosts(quantities: {
  weapon: number[];
  elite: number[];
  common: number[];
}): WeaponAscensionCost[] {
  const levels = [
    [20, 40],
    [40, 50],
    [50, 60],
    [60, 70],
    [70, 80],
    [80, 90],
  ] as const;
  const weaponMaterialTiers = [0, 1, 1, 2, 2, 3] as const;
  const eliteMaterialTiers = [0, 0, 1, 1, 2, 2] as const;
  const commonMaterialTiers = [0, 0, 1, 1, 2, 2] as const;

  return levels.map(([from, to], index) => ({
    from,
    to,
    weaponMaterial: {
      tier: weaponMaterialTiers[index],
      quantity: quantities.weapon[index],
    },
    eliteMaterial: {
      tier: eliteMaterialTiers[index],
      quantity: quantities.elite[index],
    },
    commonMaterial: {
      tier: commonMaterialTiers[index],
      quantity: quantities.common[index],
    },
  }));
}

function validateGeneratedWeapons(weapons: WeaponRecord[]): void {
  const seenIds = new Set<string>();
  const seenNames = new Set<string>();

  for (const weapon of weapons) {
    weaponRecordSchema.parse(weapon);

    if (seenIds.has(weapon.id)) {
      throw new Error(`Duplicate weapon id generated: ${weapon.id}`);
    }
    seenIds.add(weapon.id);

    const normalizedName = normalizeLookupKey(weapon.name);
    if (seenNames.has(normalizedName)) {
      throw new Error(`Duplicate weapon name generated: ${weapon.name}`);
    }
    seenNames.add(normalizedName);

    if (!repoImageExists(weapon.image)) {
      console.warn(
        `Warning: Missing repo image for weapon ${weapon.id}: ${weapon.image}`,
      );
    }
  }
}

function validateGeneratedWeaponGoalTemplates(
  templates: WeaponGoalTemplateRecord[],
  weaponIds: Set<string>,
): void {
  const seenKeys = new Set<string>();

  for (const template of templates) {
    weaponGoalTemplateSchema.parse(template);

    if (!weaponIds.has(template.weaponId)) {
      throw new Error(
        `Goal template references unknown weapon: ${template.weaponId}`,
      );
    }

    const key = `${template.weaponId}:${template.category}:${template.sortOrder}`;
    if (seenKeys.has(key)) {
      throw new Error(`Duplicate weapon goal template key generated: ${key}`);
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
