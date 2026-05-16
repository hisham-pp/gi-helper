import { PrismaClient } from "@prisma/client";
import { hashPassword } from "@/lib/auth";

import { seedMaterials } from "@/prisma/seed-data";

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
