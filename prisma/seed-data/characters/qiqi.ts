import type { SeedCharacter, SeedCharacterGoalTemplate } from "../types";

export const qiqi: SeedCharacter = {
  id: "qiqi",
  name: "Qiqi",
  image: "https://enka.network/ui/UI_AvatarIcon_Qiqi.png",
  rarity: 5,
  element: "Cryo",
  weaponType: "Sword",
  region: "Liyue",
};

export const qiqiGoalTemplates: SeedCharacterGoalTemplate[] = [
  // Ascension 1
  {
    characterId: "qiqi",
    name: "Ascension 1 (Lv. 20 → 40)",
    description: "First ascension materials for Qiqi",
    category: "ascension",
    sortOrder: 1,
    materials: [
      { materialId: "shivada-jade-sliver", required: 1 },
      { materialId: "violetgrass", required: 3 },
      { materialId: "divining-scroll", required: 3 },
    ],
  },
  // Ascension 2
  {
    characterId: "qiqi",
    name: "Ascension 2 (Lv. 40 → 50)",
    description: "Second ascension materials for Qiqi",
    category: "ascension",
    sortOrder: 2,
    materials: [
      { materialId: "shivada-jade-fragment", required: 3 },
      { materialId: "hoarfrost-core", required: 2 },
      { materialId: "violetgrass", required: 10 },
      { materialId: "divining-scroll", required: 15 },
    ],
  },
  // Ascension 3
  {
    characterId: "qiqi",
    name: "Ascension 3 (Lv. 50 → 60)",
    description: "Third ascension materials for Qiqi",
    category: "ascension",
    sortOrder: 3,
    materials: [
      { materialId: "shivada-jade-fragment", required: 6 },
      { materialId: "hoarfrost-core", required: 4 },
      { materialId: "violetgrass", required: 20 },
      { materialId: "sealed-scroll", required: 12 },
    ],
  },
  // Ascension 4
  {
    characterId: "qiqi",
    name: "Ascension 4 (Lv. 60 → 70)",
    description: "Fourth ascension materials for Qiqi",
    category: "ascension",
    sortOrder: 4,
    materials: [
      { materialId: "shivada-jade-chunk", required: 3 },
      { materialId: "hoarfrost-core", required: 8 },
      { materialId: "violetgrass", required: 30 },
      { materialId: "sealed-scroll", required: 18 },
    ],
  },
  // Ascension 5
  {
    characterId: "qiqi",
    name: "Ascension 5 (Lv. 70 → 80)",
    description: "Fifth ascension materials for Qiqi",
    category: "ascension",
    sortOrder: 5,
    materials: [
      { materialId: "shivada-jade-chunk", required: 6 },
      { materialId: "hoarfrost-core", required: 12 },
      { materialId: "violetgrass", required: 45 },
      { materialId: "forbidden-curse-scroll", required: 12 },
    ],
  },
  // Ascension 6
  {
    characterId: "qiqi",
    name: "Ascension 6 (Lv. 80 → 90)",
    description: "Sixth ascension materials for Qiqi",
    category: "ascension",
    sortOrder: 6,
    materials: [
      { materialId: "shivada-jade-gemstone", required: 6 },
      { materialId: "hoarfrost-core", required: 20 },
      { materialId: "violetgrass", required: 60 },
      { materialId: "forbidden-curse-scroll", required: 24 },
    ],
  },
  // All Talents 1 → 6
  {
    characterId: "qiqi",
    name: "All Talents Level 1 → 6",
    description: "Materials to level all three talents from 1 to 6",
    category: "talent",
    sortOrder: 1,
    materials: [
      { materialId: "teachings-of-diligence", required: 9 },
      { materialId: "guide-to-diligence", required: 63 },
      { materialId: "divining-scroll", required: 18 },
      { materialId: "sealed-scroll", required: 66 },
    ],
  },
  // Single Talent 6 → 10
  {
    characterId: "qiqi",
    name: "Single Talent Level 6 → 10",
    description: "Materials to max one talent from level 6 to 10",
    category: "talent",
    sortOrder: 2,
    materials: [
      { materialId: "guide-to-diligence", required: 4 },
      { materialId: "philosophies-of-diligence", required: 38 },
      { materialId: "sealed-scroll", required: 6 },
      { materialId: "forbidden-curse-scroll", required: 22 },
      { materialId: "tail-of-boreas", required: 6 },
      { materialId: "crown-of-insight", required: 1 },
    ],
  },
  // Triple Crown 6 → 10
  {
    characterId: "qiqi",
    name: "Triple Crown (All Talents 6 → 10)",
    description: "Materials to max all three talents from level 6 to 10",
    category: "talent",
    sortOrder: 3,
    materials: [
      { materialId: "guide-to-diligence", required: 12 },
      { materialId: "philosophies-of-diligence", required: 114 },
      { materialId: "sealed-scroll", required: 18 },
      { materialId: "forbidden-curse-scroll", required: 66 },
      { materialId: "tail-of-boreas", required: 18 },
      { materialId: "crown-of-insight", required: 3 },
    ],
  },
];