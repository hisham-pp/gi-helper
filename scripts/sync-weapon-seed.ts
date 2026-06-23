import {
  buildWeaponGoalTemplates,
  buildWeapons,
} from "./sync-weapon-data-utils";
import { writeGeneratedModule } from "./sync-seed-data-utils";

const weapons = buildWeapons();
const weaponGoalTemplates = buildWeaponGoalTemplates();

const source = `import type {
  SeedWeapon,
  SeedWeaponGoalTemplate,
} from "../types";

export const weapons: SeedWeapon[] = ${JSON.stringify(weapons, null, 2)};

export const weaponGoalTemplates: SeedWeaponGoalTemplate[] = ${JSON.stringify(
  weaponGoalTemplates,
  null,
  2,
)};
`;

writeGeneratedModule("prisma/seed-data/generated/weapons.ts", source);

console.log(
  `Generated ${weapons.length} weapons and ${weaponGoalTemplates.length} weapon goal templates.`,
);
