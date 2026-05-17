import {
  eliteDrops,
  enemyDrops,
  talentBooks,
  localSpecialties,
  bossMaterials,
  gemMaterials,
} from "@/prisma/seed-data/materials";
import {
  characters,
  characterGoalTemplates,
} from "@/prisma/seed-data/characters";
import { weapons } from "@/prisma/seed-data/weapons";
import { weaponGoalTemplates } from "@/prisma/seed-data/weapon-templates";

export type {
  SeedMaterial,
  SeedCharacter,
  SeedWeapon,
  SeedCharacterGoalTemplate,
  SeedWeaponGoalTemplate,
} from "@/prisma/seed-data/types";

export const seedMaterials = [
  ...enemyDrops,
  ...eliteDrops,
  ...talentBooks,
  ...localSpecialties,
  ...bossMaterials,
  ...gemMaterials,
];

export { characters, weapons, characterGoalTemplates, weaponGoalTemplates };
