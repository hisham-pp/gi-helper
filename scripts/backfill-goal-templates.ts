import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting goal template backfill...");

  const [goals, charTemplates, weaponTemplates] = await Promise.all([
    prisma.goal.findMany({
      where: {
        templateId: null,
      },
    }),
    prisma.characterGoalTemplate.findMany({
      include: { character: true },
    }),
    prisma.weaponGoalTemplate.findMany({
      include: { weapon: true },
    }),
  ]);

  console.log(`Found ${goals.length} goals without template IDs.`);
  console.log(`Loaded ${charTemplates.length} character templates and ${weaponTemplates.length} weapon templates.`);

  const charTemplateMap = new Map<string, { id: string; type: string }>();
  for (const t of charTemplates) {
    const fullName = `${t.character.name} - ${t.name}`;
    charTemplateMap.set(fullName, { id: t.id, type: "character" });
  }

  const weaponTemplateMap = new Map<string, { id: string; type: string }>();
  for (const t of weaponTemplates) {
    const fullName = `${t.weapon.name} - ${t.name}`;
    weaponTemplateMap.set(fullName, { id: t.id, type: "weapon" });
  }

  let updatedCount = 0;

  for (const goal of goals) {
    const match = charTemplateMap.get(goal.name) || weaponTemplateMap.get(goal.name);

    if (match) {
      await prisma.goal.update({
        where: { id: goal.id },
        data: {
          templateType: match.type,
          templateId: match.id,
        },
      });
      updatedCount++;
      console.log(`Updated goal "${goal.name}" (ID: ${goal.id}) to template ${match.id} (${match.type})`);
    }
  }

  console.log(`Finished. Updated ${updatedCount} goals.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
