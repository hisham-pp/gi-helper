import { PrismaClient } from "@prisma/client";
import { hashPassword } from "@/lib/auth";

import {
  seedMaterials,
  characters,
  weapons,
  characterGoalTemplates,
  weaponGoalTemplates,
} from "@/prisma/seed-data";

const prisma = new PrismaClient();

async function main() {
  // Ensure a development 'master' user exists so materials can be managed.
  const masterPassword = process.env.SEED_MASTER_PASSWORD ?? "changeme";
  const masterHash = hashPassword(masterPassword);

  await prisma.user.upsert({
    where: { username: "master" },
    update: { passwordHash: masterHash, role: "master" },
    create: { username: "master", passwordHash: masterHash, role: "master" },
  });

  // Proceed with material seeding

  for (const material of seedMaterials) {
    await prisma.material.upsert({
      where: {
        id: material.id,
      },
      update: {
        name: material.name,
        image: material.image,
        rarity: material.rarity,
        category: material.category,
        description: material.description,
        combinable: material.combinable,
        combineRatio: material.combineRatio,
        parentMaterialId: null,
      },
      create: {
        id: material.id,
        name: material.name,
        image: material.image,
        rarity: material.rarity,
        category: material.category,
        description: material.description,
        combinable: material.combinable,
        combineRatio: material.combineRatio,
        parentMaterialId: null,
      },
    });
  }

  // Parent links are applied after all materials exist so foreign keys never fail.
  for (const material of seedMaterials) {
    if (!material.parentMaterialId) {
      continue;
    }

    await prisma.material.update({
      where: {
        id: material.id,
      },
      data: {
        parentMaterialId: material.parentMaterialId,
      },
    });
  }

  // Seed characters
  for (const character of characters) {
    await prisma.character.upsert({
      where: { id: character.id },
      update: {
        name: character.name,
        image: character.image,
        rarity: character.rarity,
        element: character.element,
        weaponType: character.weaponType,
        region: character.region,
      },
      create: character,
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
          materialId: material.materialId,
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
          materialId: material.materialId,
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
