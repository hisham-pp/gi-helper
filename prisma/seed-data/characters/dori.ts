import type { SeedCharacter, SeedCharacterGoalTemplate } from "../types";

export const dori: SeedCharacter = {
  id: "dori",
  name: "Dori",
  image: "https://enka.network/ui/UI_AvatarIcon_Dori.png",
  rarity: 4,
  element: "Electro",
  weaponType: "Claymore",
  region: "Sumeru",
};

export const doriGoalTemplates: SeedCharacterGoalTemplate[] = [
  // Ascension 1
  {
    characterId: "dori",
    name: "Ascension 1 (Lv. 20 → 40)",
    description: "First ascension materials for Dori",
    category: "ascension",
    sortOrder: 1,
    materials: [
      { materialId: "vajrada-amethyst-sliver", required: 1 },
      { materialId: "kalpalata-lotus", required: 3 },
      { materialId: "faded-red-satin", required: 3 },
    ],
  },
  // Ascension 2
  {
    characterId: "dori",
    name: "Ascension 2 (Lv. 40 → 50)",
    description: "Second ascension materials for Dori",
    category: "ascension",
    sortOrder: 2,
    materials: [
      { materialId: "vajrada-amethyst-fragment", required: 3 },
      { materialId: "thunderclap-fruitcore", required: 2 },
      { materialId: "kalpalata-lotus", required: 10 },
      { materialId: "faded-red-satin", required: 15 },
    ],
  },
  // Ascension 3
  {
    characterId: "dori",
    name: "Ascension 3 (Lv. 50 → 60)",
    description: "Third ascension materials for Dori",
    category: "ascension",
    sortOrder: 3,
    materials: [
      { materialId: "vajrada-amethyst-fragment", required: 6 },
      { materialId: "thunderclap-fruitcore", required: 4 },
      { materialId: "kalpalata-lotus", required: 20 },
      { materialId: "trimmed-red-silk", required: 12 },
    ],
  },
  // Ascension 4
  {
    characterId: "dori",
    name: "Ascension 4 (Lv. 60 → 70)",
    description: "Fourth ascension materials for Dori",
    category: "ascension",
    sortOrder: 4,
    materials: [
      { materialId: "vajrada-amethyst-chunk", required: 3 },
      { materialId: "thunderclap-fruitcore", required: 8 },
      { materialId: "kalpalata-lotus", required: 30 },
      { materialId: "trimmed-red-silk", required: 18 },
    ],
  },
  // Ascension 5
  {
    characterId: "dori",
    name: "Ascension 5 (Lv. 70 → 80)",
    description: "Fifth ascension materials for Dori",
    category: "ascension",
    sortOrder: 5,
    materials: [
      { materialId: "vajrada-amethyst-chunk", required: 6 },
      { materialId: "thunderclap-fruitcore", required: 12 },
      { materialId: "kalpalata-lotus", required: 45 },
      { materialId: "rich-red-brocade", required: 12 },
    ],
  },
  // Ascension 6
  {
    characterId: "dori",
    name: "Ascension 6 (Lv. 80 → 90)",
    description: "Sixth ascension materials for Dori",
    category: "ascension",
    sortOrder: 6,
    materials: [
      { materialId: "vajrada-amethyst-gemstone", required: 6 },
      { materialId: "thunderclap-fruitcore", required: 20 },
      { materialId: "kalpalata-lotus", required: 60 },
      { materialId: "rich-red-brocade", required: 24 },
    ],
  },
  // All Talents 1 → 6
  {
    characterId: "dori",
    name: "All Talents Level 1 → 6",
    description: "Materials to level all three talents from 1 to 6",
    category: "talent",
    sortOrder: 1,
    materials: [
      { materialId: "teachings-of-ingenuity", required: 9 },
      { materialId: "guide-to-ingenuity", required: 63 },
      { materialId: "faded-red-satin", required: 18 },
      { materialId: "trimmed-red-silk", required: 66 },
    ],
  },
  // Single Talent 6 → 10
  {
    characterId: "dori",
    name: "Single Talent Level 6 → 10",
    description: "Materials to max one talent from level 6 to 10",
    category: "talent",
    sortOrder: 2,
    materials: [
      { materialId: "guide-to-ingenuity", required: 4 },
      { materialId: "philosophies-of-ingenuity", required: 38 },
      { materialId: "trimmed-red-silk", required: 6 },
      { materialId: "rich-red-brocade", required: 22 },
      { materialId: "bloodjade-branch", required: 6 },
      { materialId: "crown-of-insight", required: 1 },
    ],
  },
  // Triple Crown 6 → 10
  {
    characterId: "dori",
    name: "Triple Crown (All Talents 6 → 10)",
    description: "Materials to max all three talents from level 6 to 10",
    category: "talent",
    sortOrder: 3,
    materials: [
      { materialId: "guide-to-ingenuity", required: 12 },
      { materialId: "philosophies-of-ingenuity", required: 114 },
      { materialId: "trimmed-red-silk", required: 18 },
      { materialId: "rich-red-brocade", required: 66 },
      { materialId: "bloodjade-branch", required: 18 },
      { materialId: "crown-of-insight", required: 3 },
    ],
  },
];