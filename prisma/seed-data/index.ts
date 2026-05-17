import { seedMaterials } from "@/prisma/seed-data/generated/materials";
import { characters } from "@/prisma/seed-data/generated/characters";
import { characterGoalTemplates } from "@/prisma/seed-data/generated/character-goal-templates";
import { weapons } from "@/prisma/seed-data/weapons";
import { weaponGoalTemplates } from "@/prisma/seed-data/weapon-templates";

export type {
  SeedMaterial,
  SeedCharacter,
  SeedWeapon,
  SeedCharacterGoalTemplate,
  SeedWeaponGoalTemplate,
} from "@/prisma/seed-data/types";

export { characters, weapons, characterGoalTemplates, weaponGoalTemplates };
export { seedMaterials };
