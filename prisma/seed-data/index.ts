import { eliteDrops } from "@/prisma/seed-data/elite-drops";
import { enemyDrops } from "@/prisma/seed-data/enemy-drops";
import { talentBooks } from "@/prisma/seed-data/talent-books";
import { localSpecialties } from "@/prisma/seed-data/local-specialties";

export { type SeedMaterial } from "@/prisma/seed-data/helpers";

export const seedMaterials = [
  ...enemyDrops,
  ...eliteDrops,
  ...talentBooks,
  ...localSpecialties,
];
