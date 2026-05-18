import { PrismaClient } from "@prisma/client";

import { characterGoalTemplates } from "@/prisma/seed-data/generated/character-goal-templates";
import { seedMaterials } from "@/prisma/seed-data/generated/materials";

const prisma = new PrismaClient();

const travelerTalentTemplates = new Map(
  characterGoalTemplates
    .filter(
      (template) =>
        template.characterId.startsWith("traveler-") &&
        template.category === "talent",
    )
    .map((template) => [
      `${template.characterId}-${template.category}-${template.sortOrder}`,
      template,
    ]),
);

async function main() {
  const materialNameBySeedId = new Map(
    seedMaterials.map((material) => [material.id, material.name]),
  );
  const materialNames = [
    ...new Set(seedMaterials.map((material) => material.name)),
  ];
  const savedMaterials = await prisma.material.findMany({
    where: {
      name: {
        in: materialNames,
      },
    },
    select: {
      id: true,
      name: true,
    },
  });
  const materialIdByName = new Map(
    savedMaterials.map((material) => [material.name, material.id]),
  );
  const resolveMaterialId = (seedMaterialId: string) => {
    const materialName = materialNameBySeedId.get(seedMaterialId);
    const savedMaterialId = materialName
      ? materialIdByName.get(materialName)
      : undefined;

    return savedMaterialId ?? seedMaterialId;
  };

  const goals = await prisma.goal.findMany({
    where: {
      templateType: "character",
      category: "talent",
      completed: false,
      characterId: {
        startsWith: "traveler-",
      },
      templateId: {
        in: [...travelerTalentTemplates.keys()],
      },
    },
    select: {
      id: true,
      templateId: true,
    },
  });

  let repaired = 0;

  for (const goal of goals) {
    const template = travelerTalentTemplates.get(goal.templateId ?? "");

    if (!template) {
      continue;
    }

    await prisma.$transaction(async (tx) => {
      await tx.goalMaterial.deleteMany({
        where: {
          goalId: goal.id,
        },
      });

      await tx.goalMaterial.createMany({
        data: template.materials.map((material) => ({
          goalId: goal.id,
          materialId: resolveMaterialId(material.materialId),
          required: material.required,
        })),
      });

      await tx.goal.update({
        where: {
          id: goal.id,
        },
        data: {
          name: `Traveler - ${template.name}`,
          description: template.description,
        },
      });
    });

    repaired += 1;
  }

  console.log(`Repaired ${repaired} active Traveler talent goal(s).`);
}

main()
  .catch((error) => {
    console.error("Traveler talent goal repair failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
