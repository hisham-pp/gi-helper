import type { SeedCharacter, SeedCharacterGoalTemplate } from "../types";

export const linnea: SeedCharacter = {
  id: "linnea",
  name: "Linnea",
  image: "https://enka.network/ui/UI_AvatarIcon_Linnea.png",
  rarity: 5,
  element: "Geo",
  weaponType: "Bow",
  region: "Nod-Krai",
};

export const linneaGoalTemplates: SeedCharacterGoalTemplate[] = [
  // Ascension 1
  {
    characterId: "linnea",
    name: "Ascension 1 (Lv. 20 → 40)",
    description: "First ascension materials for Linnea",
    category: "ascension",
    sortOrder: 1,
    materials: [
      { materialId: "prithiva-topaz-sliver", required: 1 },
      { materialId: "frost-bloom", required: 3 },
      { materialId: "faded-insignia", required: 3 },
    ],
  },

  // Ascension 2
  {
    characterId: "linnea",
    name: "Ascension 2 (Lv. 40 → 50)",
    description: "Second ascension materials for Linnea",
    category: "ascension",
    sortOrder: 2,
    materials: [
      { materialId: "prithiva-topaz-fragment", required: 3 },
      { materialId: "moonlit-core", required: 2 },
      { materialId: "frost-bloom", required: 10 },
      { materialId: "faded-insignia", required: 15 },
    ],
  },

  // Ascension 3
  {
    characterId: "linnea",
    name: "Ascension 3 (Lv. 50 → 60)",
    description: "Third ascension materials for Linnea",
    category: "ascension",
    sortOrder: 3,
    materials: [
      { materialId: "prithiva-topaz-fragment", required: 6 },
      { materialId: "moonlit-core", required: 4 },
      { materialId: "frost-bloom", required: 20 },
      { materialId: "silver-insignia", required: 12 },
    ],
  },

  // Ascension 4
  {
    characterId: "linnea",
    name: "Ascension 4 (Lv. 60 → 70)",
    description: "Fourth ascension materials for Linnea",
    category: "ascension",
    sortOrder: 4,
    materials: [
      { materialId: "prithiva-topaz-chunk", required: 3 },
      { materialId: "moonlit-core", required: 8 },
      { materialId: "frost-bloom", required: 30 },
      { materialId: "silver-insignia", required: 18 },
    ],
  },

  // Ascension 5
  {
    characterId: "linnea",
    name: "Ascension 5 (Lv. 70 → 80)",
    description: "Fifth ascension materials for Linnea",
    category: "ascension",
    sortOrder: 5,
    materials: [
      { materialId: "prithiva-topaz-chunk", required: 6 },
      { materialId: "moonlit-core", required: 12 },
      { materialId: "frost-bloom", required: 45 },
      { materialId: "golden-insignia", required: 12 },
    ],
  },

  // Ascension 6
  {
    characterId: "linnea",
    name: "Ascension 6 (Lv. 80 → 90)",
    description: "Sixth ascension materials for Linnea",
    category: "ascension",
    sortOrder: 6,
    materials: [
      { materialId: "prithiva-topaz-gemstone", required: 6 },
      { materialId: "moonlit-core", required: 20 },
      { materialId: "frost-bloom", required: 60 },
      { materialId: "golden-insignia", required: 24 },
    ],
  },

  // All Talents 1 → 6
  {
    characterId: "linnea",
    name: "All Talents Level 1 → 6",
    description: "Materials to level all three talents from 1 to 6",
    category: "talent",
    sortOrder: 1,
    materials: [
      { materialId: "teachings-of-moonlight", required: 9 },
      { materialId: "guide-to-moonlight", required: 63 },
      { materialId: "faded-insignia", required: 18 },
      { materialId: "silver-insignia", required: 66 },
    ],
  },

  // Single Talent 6 → 10
  {
    characterId: "linnea",
    name: "Single Talent Level 6 → 10",
    description: "Materials to max one talent from level 6 to 10",
    category: "talent",
    sortOrder: 2,
    materials: [
      { materialId: "guide-to-moonlight", required: 4 },
      { materialId: "philosophies-of-moonlight", required: 38 },
      { materialId: "silver-insignia", required: 6 },
      { materialId: "golden-insignia", required: 22 },
      { materialId: "lunar-remnant", required: 6 },
      { materialId: "crown-of-insight", required: 1 },
    ],
  },

  // Triple Crown 6 → 10
  {
    characterId: "linnea",
    name: "Triple Crown (All Talents 6 → 10)",
    description: "Materials to max all three talents from level 6 to 10",
    category: "talent",
    sortOrder: 3,
    materials: [
      { materialId: "guide-to-moonlight", required: 12 },
      { materialId: "philosophies-of-moonlight", required: 114 },
      { materialId: "silver-insignia", required: 18 },
      { materialId: "golden-insignia", required: 66 },
      { materialId: "lunar-remnant", required: 18 },
      { materialId: "crown-of-insight", required: 3 },
    ],
  },
];
