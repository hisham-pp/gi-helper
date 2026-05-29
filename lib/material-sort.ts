import type { MaterialNode } from "@/lib/types";
import type { SeedMaterial } from "@/prisma/seed-data";

type SortableMaterial = Pick<
  SeedMaterial | MaterialNode,
  "category" | "name" | "rarity" | "sortOrder"
>;

const categoryOrder = [
  "Enemy Drop",
  "Elite Drop",
  "Talent Boss",
  "Boss Material",
  "Gem",
  "Talent Book",
  "Weapon Ascension",
  "Character EXP Material",
  "Character EXP Materials",
  "Refinement Material",
  "Refinement Materials",
  "Local Specialty",
  "Cooking Ingredient",
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
  if (
    typeof left.sortOrder === "number" &&
    typeof right.sortOrder === "number" &&
    left.sortOrder !== right.sortOrder
  ) {
    return left.sortOrder - right.sortOrder;
  }

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
