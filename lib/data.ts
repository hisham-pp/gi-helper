import { prisma } from "@/lib/prisma";
import { buildDashboardData, evaluateGoal } from "@/lib/crafting";
import type { DashboardData, MaterialNode } from "@/lib/types";
import { getAllCharacters, getAllMaterials } from "@/lib/static-data";

export async function getDashboardData(
  userId?: string | null,
): Promise<DashboardData> {
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

  const materialNodes: MaterialNode[] = getAllMaterials().map((material) => ({
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
  }));

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

  return buildDashboardData(materialNodes, goalViews);
}
