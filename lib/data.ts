import { prisma } from "@/lib/prisma";
import {
  aggregateNeededMaterials,
  buildDashboardData,
  buildMaterialViews,
  evaluateGoal,
} from "@/lib/crafting";
import {
  getCookingData,
  type CookingNeededIngredient,
} from "@/lib/cooking-data";
import type {
  DashboardData,
  GoalMaterialView,
  GoalView,
  MaterialNode,
  MaterialView,
} from "@/lib/types";
import {
  getAllCharacters,
  getAllMaterials,
  getWeaponById,
  getWeaponTemplateById,
} from "@/lib/static-data";

export async function getDashboardData(
  userId?: string | null,
): Promise<DashboardData> {
  const { goalViews, materialNodes } = await getDashboardSourceData(userId);

  return buildDashboardData(materialNodes, goalViews);
}

export async function getInventoryDashboardData(
  userId?: string | null,
): Promise<DashboardData> {
  const { goalViews, materialNodes } = await getDashboardSourceData(userId);
  const cookingData = await getCookingData(userId);
  const activeGoals = goalViews.filter((goal) => !goal.completed);
  const cookingGoal = buildCookingShoppingGoal(cookingData.neededIngredients);
  const shoppingGoals = cookingGoal
    ? [...activeGoals, cookingGoal]
    : activeGoals;
  const completedMaterialsRaw = goalViews.flatMap((goal) =>
    goal.materials.filter((item) => item.complete),
  );
  const aggregatedCompleted: Record<string, GoalMaterialView> = {};

  for (const item of completedMaterialsRaw) {
    if (aggregatedCompleted[item.materialId]) {
      aggregatedCompleted[item.materialId].required += item.required;
    } else {
      aggregatedCompleted[item.materialId] = { ...item };
    }
  }

  return {
    overview: {
      totalTrackedMaterials: materialNodes.length,
      totalInventory: materialNodes.reduce(
        (sum, material) => sum + material.quantity,
        0,
      ),
      activeGoals: activeGoals.length,
      completedGoals: goalViews.filter((goal) => goal.completed).length,
      craftableMaterials: 0,
    },
    materials: [],
    goals: cookingGoal ? [...goalViews, cookingGoal] : goalViews,
    materialsStillNeeded: aggregateNeededMaterials(
      shoppingGoals,
      materialNodes,
    ),
    completedMaterials: Object.values(aggregatedCompleted).sort(
      (left, right) => right.required - left.required,
    ),
  };
}

export async function getInventoryMaterials(
  userId?: string | null,
): Promise<MaterialView[]> {
  const inventories = userId
    ? await prisma.inventory.findMany({
        where: {
          userId,
        },
      })
    : [];
  const materialNodes = buildMaterialNodes(
    new Map(inventories.map((item) => [item.materialId, item.quantity])),
  );

  return buildMaterialViews(materialNodes);
}

async function getDashboardSourceData(userId?: string | null): Promise<{
  goalViews: GoalView[];
  materialNodes: MaterialNode[];
}> {
  const [inventories, goals] = await Promise.all([
    userId
      ? prisma.inventory.findMany({
          where: {
            userId,
          },
        })
      : Promise.resolve([]),
    userId
      ? prisma.goal.findMany({
          where: {
            userId,
          },
          include: {
            goalMaterials: {
              orderBy: {
                createdAt: "asc",
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        })
      : Promise.resolve([]),
  ]);

  const characterMap = new Map(getAllCharacters().map((c) => [c.id, c.name]));
  const quantityByMaterialId = new Map(
    inventories.map((item) => [item.materialId, item.quantity]),
  );

  const materialNodes = buildMaterialNodes(quantityByMaterialId);

  const stock = Object.fromEntries(
    materialNodes.map((material) => [material.id, material.quantity]),
  );

  const goalViews = goals.map((goal) => {
    const weapon = goal.weaponId
      ? getWeaponById(goal.weaponId)
      : goal.templateType === "weapon" && goal.templateId
        ? (() => {
            const template = getWeaponTemplateById(goal.templateId);
            return template?.weaponId
              ? getWeaponById(template.weaponId)
              : null;
          })()
        : null;

    return evaluateGoal(
      {
        id: goal.id,
        name: goal.name,
        description: goal.description,
        completed: goal.completed,
        characterId: goal.characterId || undefined,
        characterName: goal.characterId
          ? characterMap.get(goal.characterId)
          : undefined,
        weaponId: weapon?.id,
        weaponName: weapon?.name,
        category: goal.category || "Custom",
        materials: goal.goalMaterials.map((item) => ({
          id: item.id,
          materialId: item.materialId,
          required: item.required,
        })),
      },
      materialNodes,
      stock,
    );
  });

  return { goalViews, materialNodes };
}

function buildMaterialNodes(
  quantityByMaterialId: Map<string, number>,
): MaterialNode[] {
  return getAllMaterials().map((material) => ({
    id: material.id,
    name: material.name,
    image: material.image,
    rarity: material.rarity,
    category: material.category,
    sortOrder: material.sortOrder,
    description: material.description,
    combinable: material.combinable,
    combineRatio: material.combineRatio,
    parentMaterialId: material.parentMaterialId,
    quantity: quantityByMaterialId.get(material.id) ?? 0,
  }));
}

function buildCookingShoppingGoal(
  ingredients: CookingNeededIngredient[],
): GoalView | null {
  const neededIngredients = ingredients.filter((ingredient) => {
    return ingredient.remaining > 0;
  });

  if (neededIngredients.length === 0) {
    return null;
  }

  const materials: GoalMaterialView[] = neededIngredients.map((ingredient) => ({
    id: `recipes:${ingredient.materialId}`,
    materialId: ingredient.materialId,
    materialName: ingredient.name,
    materialImage: ingredient.image,
    category: "Cooking Ingredient",
    rarity: ingredient.rarity,
    required: ingredient.required,
    allocated: ingredient.owned,
    totalCraftable: ingredient.owned,
    remaining: ingredient.remaining,
    ownedNeeded: ingredient.owned,
    complete: false,
  }));

  const totalRequired = materials.reduce((sum, item) => sum + item.required, 0);
  const totalAllocated = materials.reduce(
    (sum, item) => sum + item.allocated,
    0,
  );

  return {
    id: "recipes",
    name: "Recipe Ingredients",
    description: "Ingredients still needed for recipe auto cooking.",
    progressPercent:
      totalRequired === 0
        ? 0
        : Math.round((totalAllocated / totalRequired) * 100),
    totalRequired,
    totalAllocated,
    completed: false,
    category: "Recipes",
    materials,
  };
}
