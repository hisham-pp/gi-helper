import { PrismaClient } from "@prisma/client";
import { hashPassword } from "@/lib/auth";

import {
  seedMaterials,
  characters,
  weapons,
  characterGoalTemplates,
  weaponGoalTemplates,
} from "@/prisma/seed-data";
import type { SeedMaterial } from "@/prisma/seed-data";
import { getCookingIngredientSeeds } from "@/lib/cooking-data";

const prisma = new PrismaClient();

function materialSeedData(material: SeedMaterial) {
  return {
    image: material.image,
    rarity: material.rarity,
    category: material.category,
    description: material.description,
    details: material.details ?? {},
    combinable: material.combinable,
    combineRatio: material.combineRatio,
    parentMaterialId: null,
  };
}

async function main() {
  // Ensure a development 'master' user exists so materials can be managed.
  const masterPassword = process.env.SEED_MASTER_PASSWORD ?? "changeme";
  const masterHash = hashPassword(masterPassword);

  await prisma.user.upsert({
    where: { username: "master" },
    update: { passwordHash: masterHash, role: "master" },
    create: { username: "master", passwordHash: masterHash, role: "master" },
  });

  // Match materials by name so re-seeding stays idempotent when seed ids change.
  const materialIdBySeedId = new Map<string, string>();

  for (const material of [...seedMaterials, ...getCookingIngredientSeeds()]) {
    const data = materialSeedData(material);
    const saved = await prisma.material.upsert({
      where: { name: material.name },
      update: data as any,
      create: {
        id: material.id,
        name: material.name,
        ...data,
      } as any,
    });
    materialIdBySeedId.set(material.id, saved.id);
  }

  const resolveMaterialId = (seedMaterialId: string) =>
    materialIdBySeedId.get(seedMaterialId) ?? seedMaterialId;

  // Parent links are applied after all materials exist so foreign keys never fail.
  for (const material of seedMaterials) {
    if (!material.parentMaterialId) {
      continue;
    }

    await prisma.material.update({
      where: {
        id: resolveMaterialId(material.id),
      },
      data: {
        parentMaterialId: resolveMaterialId(material.parentMaterialId),
      },
    });
  }

  // Seed characters
  for (const character of characters) {
    const characterData = {
      name: character.name,
      image: character.image,
      rarity: character.rarity,
      element: character.element,
      weaponType: character.weaponType,
      region: character.region,
      details: character.details ?? {},
      assets: character.assets ?? [],
    };

    await prisma.character.upsert({
      where: { id: character.id },
      update: characterData as any,
      create: { ...character, ...characterData } as any,
    });
  }

  // Seed weapons
  for (const weapon of weapons) {
    await prisma.weapon.upsert({
      where: { id: weapon.id },
      update: {
        name: weapon.name,
        image: weapon.image,
        rarity: weapon.rarity,
        weaponType: weapon.weaponType,
      },
      create: weapon,
    });
  }

  // Seed character goal templates
  for (const template of characterGoalTemplates) {
    const created = await prisma.characterGoalTemplate.upsert({
      where: {
        id: `${template.characterId}-${template.category}-${template.sortOrder}`,
      },
      update: {
        name: template.name,
        description: template.description,
        category: template.category,
        sortOrder: template.sortOrder,
      },
      create: {
        id: `${template.characterId}-${template.category}-${template.sortOrder}`,
        characterId: template.characterId,
        name: template.name,
        description: template.description,
        category: template.category,
        sortOrder: template.sortOrder,
      },
    });

    // Delete existing materials for this template
    await prisma.characterGoalTemplateMaterial.deleteMany({
      where: { templateId: created.id },
    });

    // Create template materials
    for (const material of template.materials) {
      await prisma.characterGoalTemplateMaterial.create({
        data: {
          templateId: created.id,
          materialId: resolveMaterialId(material.materialId),
          required: material.required,
        },
      });
    }
  }

  // Seed weapon goal templates
  for (const template of weaponGoalTemplates) {
    const created = await prisma.weaponGoalTemplate.upsert({
      where: {
        id: `${template.weaponId}-${template.category}-${template.sortOrder}`,
      },
      update: {
        name: template.name,
        description: template.description,
        category: template.category,
        sortOrder: template.sortOrder,
      },
      create: {
        id: `${template.weaponId}-${template.category}-${template.sortOrder}`,
        weaponId: template.weaponId,
        name: template.name,
        description: template.description,
        category: template.category,
        sortOrder: template.sortOrder,
      },
    });

    // Delete existing materials for this template
    await prisma.weaponGoalTemplateMaterial.deleteMany({
      where: { templateId: created.id },
    });

    // Create template materials
    for (const material of template.materials) {
      await prisma.weaponGoalTemplateMaterial.create({
        data: {
          templateId: created.id,
          materialId: resolveMaterialId(material.materialId),
          required: material.required,
        },
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Seed failed", error);
    await prisma.$disconnect();
    process.exit(1);
  });
