import type { SeedCharacter, SeedCharacterGoalTemplate } from "../types";

export const baizhu: SeedCharacter = {
  id: "baizhu",
  name: "Baizhu",
  image: "https://enka.network/ui/UI_AvatarIcon_Baizhu.png",
  rarity: 5,
  element: "Dendro",
  weaponType: "Catalyst",
  region: "Liyue",
};

export const baizhuGoalTemplates: SeedCharacterGoalTemplate[] = [
  // Ascension 1
  {
    characterId: "baizhu",
    name: "Ascension 1 (Lv. 20 → 40)",
    description: "First ascension materials for Baizhu",
    category: "ascension",
    sortOrder: 1,
    materials: [
      { materialId: "nagadus-emerald-sliver", required: 1 },
      { materialId: "violetgrass", required: 3 },
      { materialId: "fungal-spores", required: 3 },
    ],
  },
  // Ascension 2
  {
    characterId: "baizhu",
    name: "Ascension 2 (Lv. 40 → 50)",
    description: "Second ascension materials for Baizhu",
    category: "ascension",
    sortOrder: 2,
    materials: [
      { materialId: "nagadus-emerald-fragment", required: 3 },
      { materialId: "evergloom-ring", required: 2 },
      { materialId: "violetgrass", required: 10 },
      { materialId: "fungal-spores", required: 15 },
    ],
  },
  // Ascension 3
  {
    characterId: "baizhu",
    name: "Ascension 3 (Lv. 50 → 60)",
    description: "Third ascension materials for Baizhu",
    category: "ascension",
    sortOrder: 3,
    materials: [
      { materialId: "nagadus-emerald-fragment", required: 6 },
      { materialId: "evergloom-ring", required: 4 },
      { materialId: "violetgrass", required: 20 },
      { materialId: "luminescent-pollen", required: 12 },
    ],
  },
  // Ascension 4
  {
    characterId: "baizhu",
    name: "Ascension 4 (Lv. 60 → 70)",
    description: "Fourth ascension materials for Baizhu",
    category: "ascension",
    sortOrder: 4,
    materials: [
      { materialId: "nagadus-emerald-chunk", required: 3 },
      { materialId: "evergloom-ring", required: 8 },
      { materialId: "violetgrass", required: 30 },
      { materialId: "luminescent-pollen", required: 18 },
    ],
  },
  // Ascension 5
  {
    characterId: "baizhu",
    name: "Ascension 5 (Lv. 70 → 80)",
    description: "Fifth ascension materials for Baizhu",
    category: "ascension",
    sortOrder: 5,
    materials: [
      { materialId: "nagadus-emerald-chunk", required: 6 },
      { materialId: "evergloom-ring", required: 12 },
      { materialId: "violetgrass", required: 45 },
      { materialId: "crystalline-cyst-dust", required: 12 },
    ],
  },
  // Ascension 6
  {
    characterId: "baizhu",
    name: "Ascension 6 (Lv. 80 → 90)",
    description: "Sixth ascension materials for Baizhu",
    category: "ascension",
    sortOrder: 6,
    materials: [
      { materialId: "nagadus-emerald-gemstone", required: 6 },
      { materialId: "evergloom-ring", required: 20 },
      { materialId: "violetgrass", required: 60 },
      { materialId: "crystalline-cyst-dust", required: 24 },
    ],
  },
  // All Talents 1 → 6
  {
    characterId: "baizhu",
    name: "All Talents Level 1 → 6",
    description: "Materials to level all three talents from 1 to 6",
    category: "talent",
    sortOrder: 1,
    materials: [
      { materialId: "teachings-of-gold", required: 9 },
      { materialId: "guide-to-gold", required: 63 },
      { materialId: "fungal-spores", required: 18 },
      { materialId: "luminescent-pollen", required: 66 },
    ],
  },
  // Single Talent 6 → 10
  {
    characterId: "baizhu",
    name: "Single Talent Level 6 → 10",
    description: "Materials to max one talent from level 6 to 10",
    category: "talent",
    sortOrder: 2,
    materials: [
      { materialId: "guide-to-gold", required: 4 },
      { materialId: "philosophies-of-gold", required: 38 },
      { materialId: "luminescent-pollen", required: 6 },
      { materialId: "crystalline-cyst-dust", required: 22 },
      { materialId: "worldspan-fern", required: 6 },
      { materialId: "crown-of-insight", required: 1 },
    ],
  },
  // Triple Crown 6 → 10
  {
    characterId: "baizhu",
    name: "Triple Crown (All Talents 6 → 10)",
    description: "Materials to max all three talents from level 6 to 10",
    category: "talent",
    sortOrder: 3,
    materials: [
      { materialId: "guide-to-gold", required: 12 },
      { materialId: "philosophies-of-gold", required: 114 },
      { materialId: "luminescent-pollen", required: 18 },
      { materialId: "crystalline-cyst-dust", required: 66 },
      { materialId: "worldspan-fern", required: 18 },
      { materialId: "crown-of-insight", required: 3 },
    ],
  },
];