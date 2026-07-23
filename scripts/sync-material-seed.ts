import {
  buildMaterialCatalog,
  writeGeneratedModule,
} from "./sync-seed-data-utils";

const { materials } = buildMaterialCatalog();

const source = `import type { SeedMaterial } from "../types";

export const seedMaterials: SeedMaterial[] = ${JSON.stringify(materials, null, 2)};
`;

writeGeneratedModule("prisma/seed-data/generated/materials.ts", source);

console.log(`Generated ${materials.length} materials.`);
