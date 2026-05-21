import { PrismaClient } from "@prisma/client";

import { hashPassword } from "@/lib/auth";

const prisma = new PrismaClient();

async function main() {
  const masterPassword = process.env.SEED_MASTER_PASSWORD;
  const fallbackMasterPassword = "changeme";
  const masterHash = masterPassword ? hashPassword(masterPassword) : null;

  await prisma.user.upsert({
    where: { username: "master" },
    update: {
      ...(masterHash ? { passwordHash: masterHash } : {}),
      role: "master",
    },
    create: {
      username: "master",
      passwordHash: hashPassword(masterPassword ?? fallbackMasterPassword),
      role: "master",
    },
  });
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
