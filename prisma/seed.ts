import { PrismaClient } from "@prisma/client";

import { seedMaterials } from "@/prisma/seed-data";

const prisma = new PrismaClient();

async function main() {
  for (const material of seedMaterials) {
    await prisma.material.upsert({
      where: {
        id: material.id
      },
      update: material,
      create: material
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
