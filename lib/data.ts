import { prisma } from "@/lib/prisma";
import {
  aggregateNeededMaterials,
  buildDashboardData,
  buildMaterialViews,
  evaluateGoal,
} from "@/lib/crafting";
import type {
  DashboardData,
  GoalMaterialView,
  GoalView,
  MaterialNode,
  MaterialView,
} from "@/lib/types";
import { getAllCharacters, getAllMaterials } from "@/lib/static-data";

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
  const activeGoals = goalViews.filter((goal) => !goal.completed);
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
    goals: goalViews,
    materialsStillNeeded: aggregateNeededMaterials(activeGoals, materialNodes),
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
