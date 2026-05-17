import type { SeedCharacter, SeedCharacterGoalTemplate } from "../types";

export const varesa: SeedCharacter = {
  id: "varesa",
  name: "Varesa",
  image: "https://enka.network/ui/UI_AvatarIcon_Varesa.png",
  rarity: 5,
  element: "Electro",
  weaponType: "Catalyst",
  region: "Natlan",
};

export const varesaGoalTemplates: SeedCharacterGoalTemplate[] = [
  // Ascension 1
  {
    characterId: "varesa",
    name: "Ascension 1 (Lv. 20 → 40)",
    description: "First ascension materials for Varesa",
    category: "ascension",
    sortOrder: 1,
    materials: [
      { materialId: "vajrada-amethyst-sliver", required: 1 },
      { materialId: "skysplit-gembloom", required: 3 },
      { materialId: "juvenile-fang", required: 3 },
    ],
  },

  // Ascension 2
  {
    characterId: "varesa",
    name: "Ascension 2 (Lv. 40 → 50)",
    description: "Second ascension materials for Varesa",
    category: "ascension",
    sortOrder: 2,
    materials: [
      { materialId: "vajrada-amethyst-fragment", required: 3 },
      { materialId: "sparkless-statue-core", required: 2 },
      { materialId: "skysplit-gembloom", required: 10 },
      { materialId: "juvenile-fang", required: 15 },
    ],
  },

  // Ascension 3
  {
    characterId: "varesa",
    name: "Ascension 3 (Lv. 50 → 60)",
    description: "Third ascension materials for Varesa",
    category: "ascension",
    sortOrder: 3,
    materials: [
      { materialId: "vajrada-amethyst-fragment", required: 6 },
      { materialId: "sparkless-statue-core", required: 4 },
      { materialId: "skysplit-gembloom", required: 20 },
      { materialId: "seasoned-fang", required: 12 },
    ],
  },

  // Ascension 4
  {
    characterId: "varesa",
    name: "Ascension 4 (Lv. 60 → 70)",
    description: "Fourth ascension materials for Varesa",
    category: "ascension",
    sortOrder: 4,
    materials: [
      { materialId: "vajrada-amethyst-chunk", required: 3 },
      { materialId: "sparkless-statue-core", required: 8 },
      { materialId: "skysplit-gembloom", required: 30 },
      { materialId: "seasoned-fang", required: 18 },
    ],
  },

  // Ascension 5
  {
    characterId: "varesa",
    name: "Ascension 5 (Lv. 70 → 80)",
    description: "Fifth ascension materials for Varesa",
    category: "ascension",
    sortOrder: 5,
    materials: [
      { materialId: "vajrada-amethyst-chunk", required: 6 },
      { materialId: "sparkless-statue-core", required: 12 },
      { materialId: "skysplit-gembloom", required: 45 },
      { materialId: "tyrants-fang", required: 12 },
    ],
  },

  // Ascension 6
  {
    characterId: "varesa",
    name: "Ascension 6 (Lv. 80 → 90)",
    description: "Sixth ascension materials for Varesa",
    category: "ascension",
    sortOrder: 6,
    materials: [
      { materialId: "vajrada-amethyst-gemstone", required: 6 },
      { materialId: "sparkless-statue-core", required: 20 },
      { materialId: "skysplit-gembloom", required: 60 },
      { materialId: "tyrants-fang", required: 24 },
    ],
  },

  // All Talents 1 → 6
  {
    characterId: "varesa",
    name: "All Talents Level 1 → 6",
    description: "Materials to level all three talents from 1 to 6",
    category: "talent",
    sortOrder: 1,
    materials: [
      { materialId: "teachings-of-contention", required: 9 },
      { materialId: "guide-to-contention", required: 63 },
      { materialId: "juvenile-fang", required: 18 },
      { materialId: "seasoned-fang", required: 66 },
    ],
  },

  // Single Talent 6 → 10
  {
    characterId: "varesa",
    name: "Single Talent Level 6 → 10",
    description: "Materials to max one talent from level 6 to 10",
    category: "talent",
    sortOrder: 2,
    materials: [
      { materialId: "guide-to-contention", required: 4 },
      { materialId: "philosophies-of-contention", required: 38 },
      { materialId: "seasoned-fang", required: 6 },
      { materialId: "tyrants-fang", required: 22 },
      { materialId: "denial-and-judgment", required: 6 },
      { materialId: "crown-of-insight", required: 1 },
    ],
  },

  // Triple Crown 6 → 10
  {
    characterId: "varesa",
    name: "Triple Crown (All Talents 6 → 10)",
    description: "Materials to max all three talents from level 6 to 10",
    category: "talent",
    sortOrder: 3,
    materials: [
      { materialId: "guide-to-contention", required: 12 },
      { materialId: "philosophies-of-contention", required: 114 },
      { materialId: "seasoned-fang", required: 18 },
      { materialId: "tyrants-fang", required: 66 },
      { materialId: "denial-and-judgment", required: 18 },
      { materialId: "crown-of-insight", required: 3 },
    ],
  },
];