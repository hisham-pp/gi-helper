import type { SeedCharacter, SeedCharacterGoalTemplate } from "../types";

export const gaming: SeedCharacter = {
  id: "gaming",
  name: "Gaming",
  image: "https://enka.network/ui/UI_AvatarIcon_Gaming.png",
  rarity: 4,
  element: "Pyro",
  weaponType: "Claymore",
  region: "Liyue",
};

export const gamingGoalTemplates: SeedCharacterGoalTemplate[] = [
  // Ascension 1
  {
    characterId: "gaming",
    name: "Ascension 1 (Lv. 20 → 40)",
    description: "First ascension materials for Gaming",
    category: "ascension",
    sortOrder: 1,
    materials: [
      { materialId: "agnidus-agate-sliver", required: 1 },
      { materialId: "starconch", required: 3 },
      { materialId: "slime-condensate", required: 3 },
    ],
  },
  // Ascension 2
  {
    characterId: "gaming",
    name: "Ascension 2 (Lv. 40 → 50)",
    description: "Second ascension materials for Gaming",
    category: "ascension",
    sortOrder: 2,
    materials: [
      { materialId: "agnidus-agate-fragment", required: 3 },
      { materialId: "emperor-resolution", required: 2 },
      { materialId: "starconch", required: 10 },
      { materialId: "slime-condensate", required: 15 },
    ],
  },
  // Ascension 3
  {
    characterId: "gaming",
    name: "Ascension 3 (Lv. 50 → 60)",
    description: "Third ascension materials for Gaming",
    category: "ascension",
    sortOrder: 3,
    materials: [
      { materialId: "agnidus-agate-fragment", required: 6 },
      { materialId: "emperor-resolution", required: 4 },
      { materialId: "starconch", required: 20 },
      { materialId: "slime-secretions", required: 12 },
    ],
  },
  // Ascension 4
  {
    characterId: "gaming",
    name: "Ascension 4 (Lv. 60 → 70)",
    description: "Fourth ascension materials for Gaming",
    category: "ascension",
    sortOrder: 4,
    materials: [
      { materialId: "agnidus-agate-chunk", required: 3 },
      { materialId: "emperor-resolution", required: 8 },
      { materialId: "starconch", required: 30 },
      { materialId: "slime-secretions", required: 18 },
    ],
  },
  // Ascension 5
  {
    characterId: "gaming",
    name: "Ascension 5 (Lv. 70 → 80)",
    description: "Fifth ascension materials for Gaming",
    category: "ascension",
    sortOrder: 5,
    materials: [
      { materialId: "agnidus-agate-chunk", required: 6 },
      { materialId: "emperor-resolution", required: 12 },
      { materialId: "starconch", required: 45 },
      { materialId: "slime-concentrate", required: 12 },
    ],
  },
  // Ascension 6
  {
    characterId: "gaming",
    name: "Ascension 6 (Lv. 80 → 90)",
    description: "Sixth ascension materials for Gaming",
    category: "ascension",
    sortOrder: 6,
    materials: [
      { materialId: "agnidus-agate-gemstone", required: 6 },
      { materialId: "emperor-resolution", required: 20 },
      { materialId: "starconch", required: 60 },
      { materialId: "slime-concentrate", required: 24 },
    ],
  },
  // All Talents 1 → 6
  {
    characterId: "gaming",
    name: "All Talents Level 1 → 6",
    description: "Materials to level all three talents from 1 to 6",
    category: "talent",
    sortOrder: 1,
    materials: [
      { materialId: "teachings-of-prosperity", required: 9 },
      { materialId: "guide-to-prosperity", required: 63 },
      { materialId: "slime-condensate", required: 18 },
      { materialId: "slime-secretions", required: 66 },
    ],
  },
  // Single Talent 6 → 10
  {
    characterId: "gaming",
    name: "Single Talent Level 6 → 10",
    description: "Materials to max one talent from level 6 to 10",
    category: "talent",
    sortOrder: 2,
    materials: [
      { materialId: "guide-to-prosperity", required: 4 },
      { materialId: "philosophies-of-prosperity", required: 38 },
      { materialId: "slime-secretions", required: 6 },
      { materialId: "slime-concentrate", required: 22 },
      { materialId: "lightless-eye-of-the-dying-world", required: 6 },
      { materialId: "crown-of-insight", required: 1 },
    ],
  },
  // Triple Crown 6 → 10
  {
    characterId: "gaming",
    name: "Triple Crown (All Talents 6 → 10)",
    description: "Materials to max all three talents from level 6 to 10",
    category: "talent",
    sortOrder: 3,
    materials: [
      { materialId: "guide-to-prosperity", required: 12 },
      { materialId: "philosophies-of-prosperity", required: 114 },
      { materialId: "slime-secretions", required: 18 },
      { materialId: "slime-concentrate", required: 66 },
      { materialId: "lightless-eye-of-the-dying-world", required: 18 },
      { materialId: "crown-of-insight", required: 3 },
    ],
  },
];
