import type { SeedCharacter, SeedCharacterGoalTemplate } from "../types";

export const sucrose: SeedCharacter = {
  id: "sucrose",
  name: "Sucrose",
  image: "https://enka.network/ui/UI_AvatarIcon_Sucrose.png",
  rarity: 4,
  element: "Anemo",
  weaponType: "Catalyst",
  region: "Mondstadt",
};

export const sucroseGoalTemplates: SeedCharacterGoalTemplate[] = [
  // Ascension 1
  {
    characterId: "sucrose",
    name: "Ascension 1 (Lv. 20 → 40)",
    description: "First ascension materials for Sucrose",
    category: "ascension",
    sortOrder: 1,
    materials: [
      { materialId: "vayuda-turquoise-sliver", required: 1 },
      { materialId: "windwheel-aster", required: 3 },
      { materialId: "whopperflower-nectar", required: 3 },
    ],
  },
  // Ascension 2
  {
    characterId: "sucrose",
    name: "Ascension 2 (Lv. 40 → 50)",
    description: "Second ascension materials for Sucrose",
    category: "ascension",
    sortOrder: 2,
    materials: [
      { materialId: "vayuda-turquoise-fragment", required: 3 },
      { materialId: "hurricane-seed", required: 2 },
      { materialId: "windwheel-aster", required: 10 },
      { materialId: "whopperflower-nectar", required: 15 },
    ],
  },
  // Ascension 3
  {
    characterId: "sucrose",
    name: "Ascension 3 (Lv. 50 → 60)",
    description: "Third ascension materials for Sucrose",
    category: "ascension",
    sortOrder: 3,
    materials: [
      { materialId: "vayuda-turquoise-fragment", required: 6 },
      { materialId: "hurricane-seed", required: 4 },
      { materialId: "windwheel-aster", required: 20 },
      { materialId: "shimmering-nectar", required: 12 },
    ],
  },
  // Ascension 4
  {
    characterId: "sucrose",
    name: "Ascension 4 (Lv. 60 → 70)",
    description: "Fourth ascension materials for Sucrose",
    category: "ascension",
    sortOrder: 4,
    materials: [
      { materialId: "vayuda-turquoise-chunk", required: 3 },
      { materialId: "hurricane-seed", required: 8 },
      { materialId: "windwheel-aster", required: 30 },
      { materialId: "shimmering-nectar", required: 18 },
    ],
  },
  // Ascension 5
  {
    characterId: "sucrose",
    name: "Ascension 5 (Lv. 70 → 80)",
    description: "Fifth ascension materials for Sucrose",
    category: "ascension",
    sortOrder: 5,
    materials: [
      { materialId: "vayuda-turquoise-chunk", required: 6 },
      { materialId: "hurricane-seed", required: 12 },
      { materialId: "windwheel-aster", required: 45 },
      { materialId: "energy-nectar", required: 12 },
    ],
  },
  // Ascension 6
  {
    characterId: "sucrose",
    name: "Ascension 6 (Lv. 80 → 90)",
    description: "Sixth ascension materials for Sucrose",
    category: "ascension",
    sortOrder: 6,
    materials: [
      { materialId: "vayuda-turquoise-gemstone", required: 6 },
      { materialId: "hurricane-seed", required: 20 },
      { materialId: "windwheel-aster", required: 60 },
      { materialId: "energy-nectar", required: 24 },
    ],
  },
  // All Talents 1 → 6
  {
    characterId: "sucrose",
    name: "All Talents Level 1 → 6",
    description: "Materials to level all three talents from 1 to 6",
    category: "talent",
    sortOrder: 1,
    materials: [
      { materialId: "teachings-of-freedom", required: 9 },
      { materialId: "guide-to-freedom", required: 63 },
      { materialId: "whopperflower-nectar", required: 18 },
      { materialId: "shimmering-nectar", required: 66 },
    ],
  },
  // Single Talent 6 → 10
  {
    characterId: "sucrose",
    name: "Single Talent Level 6 → 10",
    description: "Materials to max one talent from level 6 to 10",
    category: "talent",
    sortOrder: 2,
    materials: [
      { materialId: "guide-to-freedom", required: 4 },
      { materialId: "philosophies-of-freedom", required: 38 },
      { materialId: "shimmering-nectar", required: 6 },
      { materialId: "energy-nectar", required: 22 },
      { materialId: "spirit-locket-of-boreas", required: 6 },
      { materialId: "crown-of-insight", required: 1 },
    ],
  },
  // Triple Crown 6 → 10
  {
    characterId: "sucrose",
    name: "Triple Crown (All Talents 6 → 10)",
    description: "Materials to max all three talents from level 6 to 10",
    category: "talent",
    sortOrder: 3,
    materials: [
      { materialId: "guide-to-freedom", required: 12 },
      { materialId: "philosophies-of-freedom", required: 114 },
      { materialId: "shimmering-nectar", required: 18 },
      { materialId: "energy-nectar", required: 66 },
      { materialId: "spirit-locket-of-boreas", required: 18 },
      { materialId: "crown-of-insight", required: 3 },
    ],
  },
];