import { prisma } from "@/lib/prisma";
import { buildDashboardData, evaluateGoal } from "@/lib/crafting";
import type { DashboardData, MaterialNode } from "@/lib/types";

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const [materials, goals] = await Promise.all([
    prisma.material.findMany({
      include: {
        inventories: {
          where: {
            userId,
          },
        },
      },
      orderBy: [{ category: "asc" }, { rarity: "desc" }, { name: "asc" }],
    }),
    prisma.goal.findMany({
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
    }),
  ]);

  // Fetch templates for goals that have them
  const characterTemplateIds = goals
    .filter((g) => g.templateType === "character" && g.templateId)
    .map((g) => g.templateId as string);
  const weaponTemplateIds = goals
    .filter((g) => g.templateType === "weapon" && g.templateId)
    .map((g) => g.templateId as string);

  const [characterTemplates, weaponTemplates] = await Promise.all([
    prisma.characterGoalTemplate.findMany({
      where: { id: { in: characterTemplateIds } },
      include: { character: true },
    }),
    prisma.weaponGoalTemplate.findMany({
      where: { id: { in: weaponTemplateIds } },
    }),
  ]);

  const charTemplateMap = new Map(characterTemplates.map((t) => [t.id, t]));
  const weaponTemplateMap = new Map(weaponTemplates.map((t) => [t.id, t]));

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
    quantity: material.inventories[0]?.quantity ?? 0,
  }));

  const stock = Object.fromEntries(
    materialNodes.map((material) => [material.id, material.quantity]),
  );

  const goalViews = goals.map((goal) => {
    let characterId: string | undefined;
    let characterName: string | undefined;
    let category: string | undefined = "Custom";

    if (goal.templateType === "character" && goal.templateId) {
      const template = charTemplateMap.get(goal.templateId);
      if (template) {
        characterId = template.characterId;
        characterName = template.character.name;
        category = template.category;
      }
    } else if (goal.templateType === "weapon" && goal.templateId) {
      const template = weaponTemplateMap.get(goal.templateId);
      if (template) {
        category = template.category;
      }
    }

    return evaluateGoal(
      {
        id: goal.id,
        name: goal.name,
        description: goal.description,
        completed: goal.completed,
        characterId,
        characterName,
        category,
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
