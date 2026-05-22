import type { MaterialNode } from "@/lib/types";
import type { SeedMaterial } from "@/prisma/seed-data";

type SortableMaterial = Pick<
  SeedMaterial | MaterialNode,
  "category" | "name" | "rarity"
>;

const categoryOrder = [
  "Refinement Material",
  "Refinement Materials",
  "Character EXP Material",
  "Character EXP Materials",
  "Enemy Drop",
  "Elite Drop",
  "Local Specialty",
  "Cooking Ingredient",
  "Boss Material",
  "Gem",
  "Talent Book",
  "Talent Boss",
  "Weapon Ascension",
];

const categoryRank = new Map(
  categoryOrder.map((category, index) => [category, index]),
);

export function getMaterialCategoryRank(category: string) {
  return categoryRank.get(category) ?? categoryOrder.length;
}

export function compareMaterialCategories(left: string, right: string) {
  const rankDifference =
    getMaterialCategoryRank(left) - getMaterialCategoryRank(right);

  if (rankDifference !== 0) {
    return rankDifference;
  }

  return left.localeCompare(right);
}

export function compareMaterials(
  left: SortableMaterial,
  right: SortableMaterial,
) {
  const categoryDifference = compareMaterialCategories(
    left.category,
    right.category,
  );

  if (categoryDifference !== 0) {
    return categoryDifference;
  }

  if (left.rarity !== right.rarity) {
    return right.rarity - left.rarity;
  }

  return left.name.localeCompare(right.name);
}
