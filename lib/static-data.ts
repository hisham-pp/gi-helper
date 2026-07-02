import {
  characters as seedCharacters,
  characterGoalTemplates as seedCharacterGoalTemplates,
  seedMaterials,
  weapons as seedWeapons,
  weaponGoalTemplates as seedWeaponGoalTemplates,
} from "@/prisma/seed-data";
import { compareMaterials } from "@/lib/material-sort";
import type {
  SeedCharacter,
  SeedCharacterGoalTemplate,
  SeedMaterial,
  SeedWeaponGoalTemplate,
} from "@/prisma/seed-data";

// For server-side rendering, we still use static imports
// For client-side, use the cached hooks from lib/cached-data.ts
import cookingIngredientData from "@/data/materials/cooking-ingredients/en.json";

type RawIngredient = {
  name: string;
  description?: string;
  rarity?: number;
  sources?: string[];
};

export type StaticTemplateMaterial = {
  id: string;
  templateId: string;
  materialId: string;
  required: number;
  material: SeedMaterial;
};

export type StaticGoalTemplate = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  sortOrder: number;
  characterId?: string;
  weaponId?: string;
  materials: StaticTemplateMaterial[];
};

export type StaticCharacter = SeedCharacter & {
  templates: StaticGoalTemplate[];
};

export type StaticWeapon = {
  id: string;
  name: string;
  image: string;
  rarity: number;
  weaponType: string;
  templates: StaticGoalTemplate[];
};

const rawIngredients = cookingIngredientData as unknown as Record<
  string,
  RawIngredient
>;

export function getCookingIngredientSeeds(): SeedMaterial[] {
  return Object.entries(rawIngredients).map(([id, ingredient]) => ({
    id,
    name: ingredient.name,
    image: `/images/materials/cooking-ingredients/${id}`,
    rarity: ingredient.rarity ?? 1,
    category: "Cooking Ingredient",
    description:
      ingredient.description ?? `${ingredient.name} cooking ingredient.`,
    details: {
      sources: ingredient.sources ?? [],
    },
    combinable: false,
    combineRatio: null,
    parentMaterialId: null,
  }));
}

const materials = mergeMaterialsById([
  ...seedMaterials,
  ...getCookingIngredientSeeds(),
]).sort(compareMaterials);
const materialById = new Map(
  materials.map((material) => [material.id, material]),
);
const materialByName = new Map(
  materials.map((material) => [normalizeName(material.name), material]),
);

function normalizeName(value: string) {
  return value.toLowerCase().replace(/["'’]/g, "").replace(/\s+/g, " ").trim();
}

function mergeMaterialsById(materialsToMerge: SeedMaterial[]) {
  return Array.from(
    materialsToMerge
      .reduce((merged, material) => {
        if (!merged.has(material.id)) {
          merged.set(material.id, material);
        }

        return merged;
      }, new Map<string, SeedMaterial>())
      .values(),
  );
}

function compareTemplates(left: StaticGoalTemplate, right: StaticGoalTemplate) {
  if (left.category !== right.category) {
    return left.category.localeCompare(right.category);
  }

  return left.sortOrder - right.sortOrder;
}

function materialTemplateId(templateId: string, materialId: string) {
  return `${templateId}:${materialId}`;
}

function buildCharacterTemplate(
  template: SeedCharacterGoalTemplate,
): StaticGoalTemplate {
  const id = `${template.characterId}-${template.category}-${template.sortOrder}`;

  return {
    id,
    characterId: template.characterId,
    name: template.name,
    description: template.description,
    category: template.category,
    sortOrder: template.sortOrder,
    materials: template.materials
      .map((material) => {
        const staticMaterial = materialById.get(material.materialId);

        if (!staticMaterial) {
          return null;
        }

        return {
          id: materialTemplateId(id, material.materialId),
          templateId: id,
          materialId: material.materialId,
          required: material.required,
          material: staticMaterial,
        };
      })
      .filter((material): material is StaticTemplateMaterial =>
        Boolean(material),
      )
      .sort((left, right) =>
        left.material.name.localeCompare(right.material.name),
      ),
  };
}

function buildWeaponTemplate(
  template: SeedWeaponGoalTemplate,
): StaticGoalTemplate {
  const id = `${template.weaponId}-${template.category}-${template.sortOrder}`;

  return {
    id,
    weaponId: template.weaponId,
    name: template.name,
    description: template.description,
    category: template.category,
    sortOrder: template.sortOrder,
    materials: template.materials
      .map((material) => {
        const staticMaterial = materialById.get(material.materialId);

        if (!staticMaterial) {
          return null;
        }

        return {
          id: materialTemplateId(id, material.materialId),
          templateId: id,
          materialId: material.materialId,
          required: material.required,
          material: staticMaterial,
        };
      })
      .filter((material): material is StaticTemplateMaterial =>
        Boolean(material),
      )
      .sort((left, right) =>
        left.material.name.localeCompare(right.material.name),
      ),
  };
}

const characterTemplates = seedCharacterGoalTemplates
  .map(buildCharacterTemplate)
  .sort(compareTemplates);
const weaponTemplates = seedWeaponGoalTemplates
  .map(buildWeaponTemplate)
  .sort(compareTemplates);
const characterTemplateById = new Map(
  characterTemplates.map((template) => [template.id, template]),
);
const weaponTemplateById = new Map(
  weaponTemplates.map((template) => [template.id, template]),
);

const templatesByCharacterId = new Map<string, StaticGoalTemplate[]>();
for (const template of characterTemplates) {
  if (!template.characterId) {
    continue;
  }

  const list = templatesByCharacterId.get(template.characterId) ?? [];
  list.push(template);
  templatesByCharacterId.set(template.characterId, list);
}

const templatesByWeaponId = new Map<string, StaticGoalTemplate[]>();
for (const template of weaponTemplates) {
  if (!template.weaponId) {
    continue;
  }

  const list = templatesByWeaponId.get(template.weaponId) ?? [];
  list.push(template);
  templatesByWeaponId.set(template.weaponId, list);
}

const characters = seedCharacters
  .map((character) => ({
    ...character,
    details: character.details ?? {},
    assets: character.assets ?? [],
    templates: templatesByCharacterId.get(character.id) ?? [],
  }))
  .sort((left, right) => {
    if (left.rarity !== right.rarity) {
      return right.rarity - left.rarity;
    }

    return left.name.localeCompare(right.name);
  });

const weapons = seedWeapons
  .map((weapon) => ({
    ...weapon,
    weaponType: weapon.weaponType,
    templates: templatesByWeaponId.get(weapon.id) ?? [],
  }))
  .sort((left, right) => {
    if (left.rarity !== right.rarity) {
      return right.rarity - left.rarity;
    }

    return left.name.localeCompare(right.name);
  });

const characterById = new Map(
  characters.map((character) => [character.id, character]),
);
const weaponById = new Map(weapons.map((weapon) => [weapon.id, weapon]));

export function getAllMaterials() {
  return materials;
}

export function getMaterialById(materialId: string) {
  return materialById.get(materialId) ?? null;
}

export function getMaterialByName(name: string) {
  return materialByName.get(normalizeName(name)) ?? null;
}

export function getMaterialChildren(materialId: string) {
  return materials
    .filter((material) => material.parentMaterialId === materialId)
    .sort(compareMaterials);
}

export function getAllCharacters() {
  return characters;
}

export function getCharacterById(characterId: string) {
  return characterById.get(characterId) ?? null;
}

export function getAllWeapons() {
  return weapons;
}

export function getWeaponById(weaponId: string) {
  return weaponById.get(weaponId) ?? null;
}

export function getCharacterTemplateById(templateId: string) {
  return characterTemplateById.get(templateId) ?? null;
}

export function getWeaponTemplateById(templateId: string) {
  return weaponTemplateById.get(templateId) ?? null;
}

export function getMaterialTemplateUsage(materialId: string) {
  const characterTemplatesUsingMaterial = characterTemplates
    .flatMap((template) =>
      template.materials
        .filter((material) => material.materialId === materialId)
        .map((material) => ({
          id: material.id,
          required: material.required,
          template: {
            ...template,
            character: template.characterId
              ? getCharacterById(template.characterId)
              : null,
          },
        })),
    )
    .filter((item) => Boolean(item.template.character))
    .slice(0, 12);

  const weaponTemplatesUsingMaterial = weaponTemplates
    .flatMap((template) =>
      template.materials
        .filter((material) => material.materialId === materialId)
        .map((material) => ({
          id: material.id,
          required: material.required,
          template: {
            ...template,
            weapon: template.weaponId ? getWeaponById(template.weaponId) : null,
          },
        })),
    )
    .filter((item) => Boolean(item.template.weapon))
    .slice(0, 12);

  return {
    characterTemplateMaterials: characterTemplatesUsingMaterial,
    weaponTemplateMaterials: weaponTemplatesUsingMaterial,
  };
}
