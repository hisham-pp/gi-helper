import type { SeedCharacter, SeedCharacterGoalTemplate } from "../types";

export const keqing: SeedCharacter = {
  id: "keqing",
  name: "Keqing",
  image: "https://enka.network/ui/UI_AvatarIcon_Keqing.png",
  rarity: 5,
  element: "Electro",
  weaponType: "Sword",
  region: "Liyue",
};

export const keqingGoalTemplates: SeedCharacterGoalTemplate[] = [
  // Ascension 1
  {
    characterId: "keqing",
    name: "Ascension 1 (Lv. 20 → 40)",
    description: "First ascension materials for Keqing",
    category: "ascension",
    sortOrder: 1,
    materials: [
      { materialId: "vajrada-amethyst-sliver", required: 1 },
      { materialId: "cor-lapis", required: 3 },
      { materialId: "whopperflower-nectar", required: 3 },
    ],
  },
  // Ascension 2
  {
    characterId: "keqing",
    name: "Ascension 2 (Lv. 40 → 50)",
    description: "Second ascension materials for Keqing",
    category: "ascension",
    sortOrder: 2,
    materials: [
      { materialId: "vajrada-amethyst-fragment", required: 3 },
      { materialId: "lightning-prism", required: 2 },
      { materialId: "cor-lapis", required: 10 },
      { materialId: "whopperflower-nectar", required: 15 },
    ],
  },
  // Ascension 3
  {
    characterId: "keqing",
    name: "Ascension 3 (Lv. 50 → 60)",
    description: "Third ascension materials for Keqing",
    category: "ascension",
    sortOrder: 3,
    materials: [
      { materialId: "vajrada-amethyst-fragment", required: 6 },
      { materialId: "lightning-prism", required: 4 },
      { materialId: "cor-lapis", required: 20 },
      { materialId: "shimmering-nectar", required: 12 },
    ],
  },
  // Ascension 4
  {
    characterId: "keqing",
    name: "Ascension 4 (Lv. 60 → 70)",
    description: "Fourth ascension materials for Keqing",
    category: "ascension",
    sortOrder: 4,
    materials: [
      { materialId: "vajrada-amethyst-chunk", required: 3 },
      { materialId: "lightning-prism", required: 8 },
      { materialId: "cor-lapis", required: 30 },
      { materialId: "shimmering-nectar", required: 18 },
    ],
  },
  // Ascension 5
  {
    characterId: "keqing",
    name: "Ascension 5 (Lv. 70 → 80)",
    description: "Fifth ascension materials for Keqing",
    category: "ascension",
    sortOrder: 5,
    materials: [
      { materialId: "vajrada-amethyst-chunk", required: 6 },
      { materialId: "lightning-prism", required: 12 },
      { materialId: "cor-lapis", required: 45 },
      { materialId: "energy-nectar", required: 12 },
    ],
  },
  // Ascension 6
  {
    characterId: "keqing",
    name: "Ascension 6 (Lv. 80 → 90)",
    description: "Sixth ascension materials for Keqing",
    category: "ascension",
    sortOrder: 6,
    materials: [
      { materialId: "vajrada-amethyst-gemstone", required: 6 },
      { materialId: "lightning-prism", required: 20 },
      { materialId: "cor-lapis", required: 60 },
      { materialId: "energy-nectar", required: 24 },
    ],
  },
  // All Talents 1 → 6
  {
    characterId: "keqing",
    name: "All Talents Level 1 → 6",
    description: "Materials to level all three talents from 1 to 6",
    category: "talent",
    sortOrder: 1,
    materials: [
      { materialId: "teachings-of-prosperity", required: 9 },
      { materialId: "guide-to-prosperity", required: 63 },
      { materialId: "whopperflower-nectar", required: 18 },
      { materialId: "shimmering-nectar", required: 66 },
    ],
  },
  // Single Talent 6 → 10
  {
    characterId: "keqing",
    name: "Single Talent Level 6 → 10",
    description: "Materials to max one talent from level 6 to 10",
    category: "talent",
    sortOrder: 2,
    materials: [
      { materialId: "guide-to-prosperity", required: 4 },
      { materialId: "philosophies-of-prosperity", required: 38 },
      { materialId: "shimmering-nectar", required: 6 },
      { materialId: "energy-nectar", required: 22 },
      { materialId: "ring-of-boreas", required: 6 },
      { materialId: "crown-of-insight", required: 1 },
    ],
  },
  // Triple Crown 6 → 10
  {
    characterId: "keqing",
    name: "Triple Crown (All Talents 6 → 10)",
    description: "Materials to max all three talents from level 6 to 10",
    category: "talent",
    sortOrder: 3,
    materials: [
      { materialId: "guide-to-prosperity", required: 12 },
      { materialId: "philosophies-of-prosperity", required: 114 },
      { materialId: "shimmering-nectar", required: 18 },
      { materialId: "energy-nectar", required: 66 },
      { materialId: "ring-of-boreas", required: 18 },
      { materialId: "crown-of-insight", required: 3 },
    ],
  },
];