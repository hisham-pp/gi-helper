import { buildWeaponGoalTemplates } from "./sync-weapon-data-utils";
import { writeGeneratedModule } from "./sync-seed-data-utils";

const weaponGoalTemplates = buildWeaponGoalTemplates();

const source = `import type { SeedWeaponGoalTemplate } from "../types";

export const weaponGoalTemplates: SeedWeaponGoalTemplate[] = ${JSON.stringify(
  weaponGoalTemplates,
  null,
  2,
)};
`;

writeGeneratedModule(
  "prisma/seed-data/generated/weapon-goal-templates.ts",
  source,
);

console.log(`Generated ${weaponGoalTemplates.length} weapon goal templates.`);
