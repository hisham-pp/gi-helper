import { prisma } from "@/lib/prisma";
import { buildDashboardData, evaluateGoal } from "@/lib/crafting";
import type { DashboardData, MaterialNode } from "@/lib/types";

export async function getDashboardData(): Promise<DashboardData> {
  const [materials, goals] = await Promise.all([
    prisma.material.findMany({
      include: {
        inventory: true
      },
      orderBy: [{ category: "asc" }, { rarity: "desc" }, { name: "asc" }]
    }),
    prisma.goal.findMany({
      include: {
        goalMaterials: {
          orderBy: {
            createdAt: "asc"
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })
  ]);

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
    quantity: material.inventory?.quantity ?? 0
  }));

  const goalViews = goals.map((goal) =>
    evaluateGoal(
      {
        id: goal.id,
        name: goal.name,
        description: goal.description,
        materials: goal.goalMaterials.map((item) => ({
          id: item.id,
          materialId: item.materialId,
          required: item.required
        }))
      },
      materialNodes
    )
  );

  return buildDashboardData(materialNodes, goalViews);
}
