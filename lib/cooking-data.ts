import foodData from "@/data/consumables/food/en.json";
import { prisma } from "@/lib/prisma";
import {
  getAllMaterials,
  getCookingIngredientSeeds,
  getMaterialByName,
} from "@/lib/static-data";
import type { MaterialView } from "@/lib/types";

type RawRecipeIngredient = {
  item: string;
  quantity: number;
};

type RawFood = {
  name: string;
  rarity: number;
  type: string;
  effect?: string;
  hasRecipe?: boolean;
  description: string;
  proficiency?: number | string;
  baseDish?: string;
  recipe?: RawRecipeIngredient[];
};

export type CookingRecipeIngredient = {
  materialId: string;
  name: string;
  image: string;
  quantity: number;
  owned: number;
  needed: number;
};

export type CookingRecipeView = {
  id: string;
  name: string;
  image: string;
  rarity: number;
  type: string;
  effect: string;
  description: string;
  proficiency: number;
  completedCount: number;
  remainingCount: number;
  achievedAuto: boolean;
  ingredients: CookingRecipeIngredient[];
};

export type CookingNeededIngredient = {
  materialId: string;
  name: string;
  image: string;
  rarity: number;
  required: number;
  owned: number;
  remaining: number;
};

export type CookingData = {
  ingredients: MaterialView[];
  recipes: CookingRecipeView[];
  neededIngredients: CookingNeededIngredient[];
  stats: {
    totalRecipes: number;
    achievedAuto: number;
    totalCompleted: number;
    neededIngredients: number;
  };
};

const rawFood = foodData as unknown as Record<string, RawFood>;

export function slugifyCookingId(value: string) {
  return value
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function getCookingData(
  userId?: string | null,
): Promise<CookingData> {
  const [inventory, progress] = await Promise.all([
    userId
      ? prisma.inventory.findMany({
          where: {
            userId,
          },
        })
      : Promise.resolve([]),
    userId
      ? prisma.cookingProgress.findMany({
          where: {
            userId,
          },
        })
      : Promise.resolve([]),
  ]);

  const materials = getAllMaterials();
  const quantityByMaterialId = new Map(
    inventory.map((item) => [item.materialId, item.quantity]),
  );
  const progressByRecipeId = new Map(
    progress.map((item) => [item.recipeId, item.completedCount]),
  );

  const cookingMaterialIds = new Set(
    getCookingIngredientSeeds().map((ingredient) => ingredient.id),
  );
  const recipeEntries = Object.entries(rawFood).filter(([, recipe]) => {
    return Boolean(
      recipe.hasRecipe && recipe.recipe?.length && recipe.proficiency,
    );
  });

  const recipes = recipeEntries
    .map(([recipeId, recipe]) => {
      const completedCount = progressByRecipeId.get(recipeId) ?? 0;
      const proficiency = Number(recipe.proficiency ?? 0);
      const remainingCount = Math.max(proficiency - completedCount, 0);

      const ingredients = (recipe.recipe ?? [])
        .map((ingredient) => {
          const material = getMaterialByName(ingredient.item);

          if (!material) {
            return null;
          }

          cookingMaterialIds.add(material.id);

          const owned = quantityByMaterialId.get(material.id) ?? 0;
          const needed = remainingCount * ingredient.quantity;

          return {
            materialId: material.id,
            name: material.name,
            image: material.image,
            quantity: ingredient.quantity,
            owned,
            needed,
          };
        })
        .filter((ingredient): ingredient is CookingRecipeIngredient =>
          Boolean(ingredient),
        );

      return {
        id: recipeId,
        name: recipe.name,
        image: `/images/consumables/food/${recipeId}`,
        rarity: recipe.rarity,
        type: recipe.type,
        effect: recipe.effect ?? "",
        description: recipe.description,
        proficiency,
        completedCount,
        remainingCount,
        achievedAuto: remainingCount === 0,
        ingredients,
      };
    })
    .sort((left, right) => {
      if (left.achievedAuto !== right.achievedAuto) {
        return Number(left.achievedAuto) - Number(right.achievedAuto);
      }

      if (left.rarity !== right.rarity) {
        return right.rarity - left.rarity;
      }

      return left.name.localeCompare(right.name);
    });

  const neededByMaterial = new Map<string, CookingNeededIngredient>();

  for (const recipe of recipes) {
    if (recipe.achievedAuto) {
      continue;
    }

    for (const ingredient of recipe.ingredients) {
      const existing = neededByMaterial.get(ingredient.materialId);
      const material = getMaterialByName(ingredient.name);
      const rarity = material?.rarity ?? 1;

      if (existing) {
        existing.required += ingredient.needed;
        existing.remaining = Math.max(existing.required - existing.owned, 0);
      } else {
        neededByMaterial.set(ingredient.materialId, {
          materialId: ingredient.materialId,
          name: ingredient.name,
          image: ingredient.image,
          rarity,
          required: ingredient.needed,
          owned: ingredient.owned,
          remaining: Math.max(ingredient.needed - ingredient.owned, 0),
        });
      }
    }
  }

  const ingredientMaterials: MaterialView[] = materials
    .filter((material) => cookingMaterialIds.has(material.id))
    .map((material) => ({
      id: material.id,
      name: material.name,
      image: material.image,
      rarity: material.rarity,
      category: material.category,
      description: material.description,
      combinable: material.combinable,
      combineRatio: material.combineRatio,
      parentMaterialId: material.parentMaterialId,
      quantity: quantityByMaterialId.get(material.id) ?? 0,
      totalCraftable: quantityByMaterialId.get(material.id) ?? 0,
      craftableExtra: 0,
      familyDepth: 0,
    }))
    .sort((left, right) => left.name.localeCompare(right.name));

  const neededIngredients = Array.from(neededByMaterial.values()).sort(
    (left, right) => {
      if (left.remaining !== right.remaining) {
        return right.remaining - left.remaining;
      }

      return left.name.localeCompare(right.name);
    },
  );

  return {
    ingredients: ingredientMaterials,
    recipes,
    neededIngredients,
    stats: {
      totalRecipes: recipes.length,
      achievedAuto: recipes.filter((recipe) => recipe.achievedAuto).length,
      totalCompleted: recipes.reduce(
        (sum, recipe) => sum + recipe.completedCount,
        0,
      ),
      neededIngredients: neededIngredients.filter((item) => item.remaining > 0)
        .length,
    },
  };
}
