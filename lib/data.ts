import { prisma } from "@/lib/prisma";
import { buildDashboardData, evaluateGoal } from "@/lib/crafting";
import type { DashboardData, MaterialNode } from "@/lib/types";

export async function getDashboardData(
  userId?: string | null,
): Promise<DashboardData> {
  const [materials, goals, characters] = await Promise.all([
    prisma.material.findMany({
      include: {
        inventories: userId
          ? {
              where: {
                userId,
              },
            }
          : false,
      },
      orderBy: [{ category: "asc" }, { rarity: "desc" }, { name: "asc" }],
    }),
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
    prisma.character.findMany(),
  ]);

  const characterMap = new Map(characters.map((c) => [c.id, c.name]));

  const materialNodes: MaterialNode[] = materials.map((material) => ({
    id: material.id,
    name: material.name,
    image: material.image,
    rarity: material.rarity,
    category: material.category,
    description: material.description,
    combinable: material.combinable,
    combineRatio: material.combineRatio,
    parentMaterialId: material.parentMaterialId,
    quantity:
      "inventories" in material ? (material.inventories[0]?.quantity ?? 0) : 0,
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
