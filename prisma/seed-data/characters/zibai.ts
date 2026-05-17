import type { SeedCharacter, SeedCharacterGoalTemplate } from "../types";

export const zibai: SeedCharacter = {
  id: "zibai",
  name: "Zibai",
  image: "https://enka.network/ui/UI_AvatarIcon_Zibai.png",
  rarity: 5,
  element: "Electro",
  weaponType: "Polearm",
  region: "Liyue",
};

export const zibaiGoalTemplates: SeedCharacterGoalTemplate[] = [
  // Ascension 1
  {
    characterId: "zibai",
    name: "Ascension 1 (Lv. 20 → 40)",
    description: "First ascension materials for Zibai",
    category: "ascension",
    sortOrder: 1,
    materials: [
      { materialId: "vajrada-amethyst-sliver", required: 1 },
      { materialId: "violetgrass", required: 3 },
      { materialId: "recruit-insignia", required: 3 },
    ],
  },

  // Ascension 2
  {
    characterId: "zibai",
    name: "Ascension 2 (Lv. 40 → 50)",
    description: "Second ascension materials for Zibai",
    category: "ascension",
    sortOrder: 2,
    materials: [
      { materialId: "vajrada-amethyst-fragment", required: 3 },
      { materialId: "thunderclap-core", required: 2 },
      { materialId: "violetgrass", required: 10 },
      { materialId: "recruit-insignia", required: 15 },
    ],
  },

  // Ascension 3
  {
    characterId: "zibai",
    name: "Ascension 3 (Lv. 50 → 60)",
    description: "Third ascension materials for Zibai",
    category: "ascension",
    sortOrder: 3,
    materials: [
      { materialId: "vajrada-amethyst-fragment", required: 6 },
      { materialId: "thunderclap-core", required: 4 },
      { materialId: "violetgrass", required: 20 },
      { materialId: "sergeant-insignia", required: 12 },
    ],
  },

  // Ascension 4
  {
    characterId: "zibai",
    name: "Ascension 4 (Lv. 60 → 70)",
    description: "Fourth ascension materials for Zibai",
    category: "ascension",
    sortOrder: 4,
    materials: [
      { materialId: "vajrada-amethyst-chunk", required: 3 },
      { materialId: "thunderclap-core", required: 8 },
      { materialId: "violetgrass", required: 30 },
      { materialId: "sergeant-insignia", required: 18 },
    ],
  },

  // Ascension 5
  {
    characterId: "zibai",
    name: "Ascension 5 (Lv. 70 → 80)",
    description: "Fifth ascension materials for Zibai",
    category: "ascension",
    sortOrder: 5,
    materials: [
      { materialId: "vajrada-amethyst-chunk", required: 6 },
      { materialId: "thunderclap-core", required: 12 },
      { materialId: "violetgrass", required: 45 },
      { materialId: "lieutenant-insignia", required: 12 },
    ],
  },

  // Ascension 6
  {
    characterId: "zibai",
    name: "Ascension 6 (Lv. 80 → 90)",
    description: "Sixth ascension materials for Zibai",
    category: "ascension",
    sortOrder: 6,
    materials: [
      { materialId: "vajrada-amethyst-gemstone", required: 6 },
      { materialId: "thunderclap-core", required: 20 },
      { materialId: "violetgrass", required: 60 },
      { materialId: "lieutenant-insignia", required: 24 },
    ],
  },

  // All Talents 1 → 6
  {
    characterId: "zibai",
    name: "All Talents Level 1 → 6",
    description: "Materials to level all three talents from 1 to 6",
    category: "talent",
    sortOrder: 1,
    materials: [
      { materialId: "teachings-of-gold", required: 9 },
      { materialId: "guide-to-gold", required: 63 },
      { materialId: "recruit-insignia", required: 18 },
      { materialId: "sergeant-insignia", required: 66 },
    ],
  },

  // Single Talent 6 → 10
  {
    characterId: "zibai",
    name: "Single Talent Level 6 → 10",
    description: "Materials to max one talent from level 6 to 10",
    category: "talent",
    sortOrder: 2,
    materials: [
      { materialId: "guide-to-gold", required: 4 },
      { materialId: "philosophies-of-gold", required: 38 },
      { materialId: "sergeant-insignia", required: 6 },
      { materialId: "lieutenant-insignia", required: 22 },
      { materialId: "dragon-lords-crown", required: 6 },
      { materialId: "crown-of-insight", required: 1 },
    ],
  },

  // Triple Crown 6 → 10
  {
    characterId: "zibai",
    name: "Triple Crown (All Talents 6 → 10)",
    description: "Materials to max all three talents from level 6 to 10",
    category: "talent",
    sortOrder: 3,
    materials: [
      { materialId: "guide-to-gold", required: 12 },
      { materialId: "philosophies-of-gold", required: 114 },
      { materialId: "sergeant-insignia", required: 18 },
      { materialId: "lieutenant-insignia", required: 66 },
      { materialId: "dragon-lords-crown", required: 18 },
      { materialId: "crown-of-insight", required: 3 },
    ],
  },
];