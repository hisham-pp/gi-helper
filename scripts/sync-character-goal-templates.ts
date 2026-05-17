import { buildCharacterGoalTemplates } from "./sync-character-data-utils";
import { writeGeneratedModule } from "./sync-seed-data-utils";

const characterGoalTemplates = buildCharacterGoalTemplates();

const source = `import type { SeedCharacterGoalTemplate } from "../types";

export const characterGoalTemplates: SeedCharacterGoalTemplate[] = ${JSON.stringify(
  characterGoalTemplates,
  null,
  2,
)};
`;

writeGeneratedModule(
  "prisma/seed-data/generated/character-goal-templates.ts",
  source,
);

console.log(
  `Generated ${characterGoalTemplates.length} character goal templates.`,
);
