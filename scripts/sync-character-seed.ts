import {
  buildCharacterGoalTemplates,
  buildCharacters,
} from "./sync-character-data-utils";
import { writeGeneratedModule } from "./sync-seed-data-utils";

const characters = buildCharacters();
const characterGoalTemplates = buildCharacterGoalTemplates();

const source = `import type {
  SeedCharacter,
  SeedCharacterGoalTemplate,
} from "../types";

export const characters: SeedCharacter[] = ${JSON.stringify(characters, null, 2)};

export const characterGoalTemplates: SeedCharacterGoalTemplate[] = ${JSON.stringify(
  characterGoalTemplates,
  null,
  2,
)};
`;

writeGeneratedModule("prisma/seed-data/generated/characters.ts", source);

console.log(
  `Generated ${characters.length} characters and ${characterGoalTemplates.length} character goal templates.`,
);
