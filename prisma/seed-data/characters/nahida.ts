import type { SeedCharacter, SeedCharacterGoalTemplate } from "../types";

export const nahida: SeedCharacter = {
  id: "nahida",
  name: "Nahida",
  image: "https://enka.network/ui/UI_AvatarIcon_Nahida.png",
  rarity: 5,
  element: "Dendro",
  weaponType: "Catalyst",
  region: "Sumeru",
};

export const nahidaGoalTemplates: SeedCharacterGoalTemplate[] = [
  {
    characterId: "nahida",
    name: "Ascension 1 (Lv. 20 → 40)",
    description: "First ascension materials for Nahida",
    category: "ascension",
    sortOrder: 1,
    materials: [
      { materialId: "nagadus-emerald-sliver", required: 1 },
      { materialId: "kalpalata-lotus", required: 3 },
      { materialId: "fungal-spores", required: 3 },
    ],
  },
  {
    characterId: "nahida",
    name: "Ascension 2 (Lv. 40 → 50)",
    description: "Second ascension materials for Nahida",
    category: "ascension",
    sortOrder: 2,
    materials: [
      { materialId: "nagadus-emerald-fragment", required: 3 },
      { materialId: "kalpalata-lotus", required: 10 },
      { materialId: "fungal-spores", required: 15 },
      { materialId: "quelled-creeper", required: 2 },
    ],
  },
  {
    characterId: "nahida",
    name: "All Talents Level 1 → 6",
    description: "Materials to level all talents from 1 to 6",
    category: "talent",
    sortOrder: 1,
    materials: [
      { materialId: "teachings-of-ingenuity", required: 9 },
      { materialId: "guide-to-ingenuity", required: 63 },
      { materialId: "fungal-spores", required: 18 },
      { materialId: "luminescent-pollen", required: 66 },
    ],
  },
  {
    characterId: "nahida",
    name: "Single Talent Level 6 → 10",
    description: "Materials to max one talent",
    category: "talent",
    sortOrder: 2,
    materials: [
      { materialId: "guide-to-ingenuity", required: 4 },
      { materialId: "philosophies-of-ingenuity", required: 38 },
      { materialId: "luminescent-pollen", required: 6 },
      { materialId: "crystalline-cyst-dust", required: 22 },
      { materialId: "puppet-strings", required: 6 },
      { materialId: "crown-of-insight", required: 1 },
    ],
  },
];
