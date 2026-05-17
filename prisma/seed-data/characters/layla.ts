import type { SeedCharacter, SeedCharacterGoalTemplate } from "../types";

export const layla: SeedCharacter = {
  id: "layla",
  name: "Layla",
  image: "https://enka.network/ui/UI_AvatarIcon_Layla.png",
  rarity: 4,
  element: "Cryo",
  weaponType: "Sword",
  region: "Sumeru",
};

export const laylaGoalTemplates: SeedCharacterGoalTemplate[] = [
  // Ascension 1
  {
    characterId: "layla",
    name: "Ascension 1 (Lv. 20 → 40)",
    description: "First ascension materials for Layla",
    category: "ascension",
    sortOrder: 1,
    materials: [
      { materialId: "shivada-jade-sliver", required: 1 },
      { materialId: "nilotpala-lotus", required: 3 },
      { materialId: "fungal-spores", required: 3 },
    ],
  },
  // Ascension 2
  {
    characterId: "layla",
    name: "Ascension 2 (Lv. 40 → 50)",
    description: "Second ascension materials for Layla",
    category: "ascension",
    sortOrder: 2,
    materials: [
      { materialId: "shivada-jade-fragment", required: 3 },
      { materialId: "perpetual-caliber", required: 2 },
      { materialId: "nilotpala-lotus", required: 10 },
      { materialId: "fungal-spores", required: 15 },
    ],
  },
  // Ascension 3
  {
    characterId: "layla",
    name: "Ascension 3 (Lv. 50 → 60)",
    description: "Third ascension materials for Layla",
    category: "ascension",
    sortOrder: 3,
    materials: [
      { materialId: "shivada-jade-fragment", required: 6 },
      { materialId: "perpetual-caliber", required: 4 },
      { materialId: "nilotpala-lotus", required: 20 },
      { materialId: "luminescent-pollen", required: 12 },
    ],
  },
  // Ascension 4
  {
    characterId: "layla",
    name: "Ascension 4 (Lv. 60 → 70)",
    description: "Fourth ascension materials for Layla",
    category: "ascension",
    sortOrder: 4,
    materials: [
      { materialId: "shivada-jade-chunk", required: 3 },
      { materialId: "perpetual-caliber", required: 8 },
      { materialId: "nilotpala-lotus", required: 30 },
      { materialId: "luminescent-pollen", required: 18 },
    ],
  },
  // Ascension 5
  {
    characterId: "layla",
    name: "Ascension 5 (Lv. 70 → 80)",
    description: "Fifth ascension materials for Layla",
    category: "ascension",
    sortOrder: 5,
    materials: [
      { materialId: "shivada-jade-chunk", required: 6 },
      { materialId: "perpetual-caliber", required: 12 },
      { materialId: "nilotpala-lotus", required: 45 },
      { materialId: "crystalline-cyst-dust", required: 12 },
    ],
  },
  // Ascension 6
  {
    characterId: "layla",
    name: "Ascension 6 (Lv. 80 → 90)",
    description: "Sixth ascension materials for Layla",
    category: "ascension",
    sortOrder: 6,
    materials: [
      { materialId: "shivada-jade-gemstone", required: 6 },
      { materialId: "perpetual-caliber", required: 20 },
      { materialId: "nilotpala-lotus", required: 60 },
      { materialId: "crystalline-cyst-dust", required: 24 },
    ],
  },
  // All Talents 1 → 6
  {
    characterId: "layla",
    name: "All Talents Level 1 → 6",
    description: "Materials to level all three talents from 1 to 6",
    category: "talent",
    sortOrder: 1,
    materials: [
      { materialId: "teachings-of-ingenuity", required: 9 },
      { materialId: "guide-to-ingenuity", required: 63 },
      { materialId: "fungal-spores", required: 18 },
      { materialId: "luminescent-pollen", required: 66 },
    ],
  },
  // Single Talent 6 → 10
  {
    characterId: "layla",
    name: "Single Talent Level 6 → 10",
    description: "Materials to max one talent from level 6 to 10",
    category: "talent",
    sortOrder: 2,
    materials: [
      { materialId: "guide-to-ingenuity", required: 4 },
      { materialId: "philosophies-of-ingenuity", required: 38 },
      { materialId: "luminescent-pollen", required: 6 },
      { materialId: "crystalline-cyst-dust", required: 22 },
      { materialId: "mirror-of-alocher", required: 6 },
      { materialId: "crown-of-insight", required: 1 },
    ],
  },
  // Triple Crown 6 → 10
  {
    characterId: "layla",
    name: "Triple Crown (All Talents 6 → 10)",
    description: "Materials to max all three talents from level 6 to 10",
    category: "talent",
    sortOrder: 3,
    materials: [
      { materialId: "guide-to-ingenuity", required: 12 },
      { materialId: "philosophies-of-ingenuity", required: 114 },
      { materialId: "luminescent-pollen", required: 18 },
      { materialId: "crystalline-cyst-dust", required: 66 },
      { materialId: "mirror-of-alocher", required: 18 },
      { materialId: "crown-of-insight", required: 3 },
    ],
  },
];