import type { SeedCharacter, SeedCharacterGoalTemplate } from "../types";

export const xingqiu: SeedCharacter = {
  id: "xingqiu",
  name: "Xingqiu",
  image: "https://enka.network/ui/UI_AvatarIcon_Xingqiu.png",
  rarity: 4,
  element: "Hydro",
  weaponType: "Sword",
  region: "Liyue",
};

export const xingqiuGoalTemplates: SeedCharacterGoalTemplate[] = [
  // Ascension 1
  {
    characterId: "xingqiu",
    name: "Ascension 1 (Lv. 20 → 40)",
    description: "First ascension materials for Xingqiu",
    category: "ascension",
    sortOrder: 1,
    materials: [
      { materialId: "varunada-lazurite-sliver", required: 1 },
      { materialId: "silk-flower", required: 3 },
      { materialId: "damaged-mask", required: 3 },
    ],
  },
  // Ascension 2
  {
    characterId: "xingqiu",
    name: "Ascension 2 (Lv. 40 → 50)",
    description: "Second ascension materials for Xingqiu",
    category: "ascension",
    sortOrder: 2,
    materials: [
      { materialId: "varunada-lazurite-fragment", required: 3 },
      { materialId: "cleansing-heart", required: 2 },
      { materialId: "silk-flower", required: 10 },
      { materialId: "damaged-mask", required: 15 },
    ],
  },
  // Ascension 3
  {
    characterId: "xingqiu",
    name: "Ascension 3 (Lv. 50 → 60)",
    description: "Third ascension materials for Xingqiu",
    category: "ascension",
    sortOrder: 3,
    materials: [
      { materialId: "varunada-lazurite-fragment", required: 6 },
      { materialId: "cleansing-heart", required: 4 },
      { materialId: "silk-flower", required: 20 },
      { materialId: "stained-mask", required: 12 },
    ],
  },
  // Ascension 4
  {
    characterId: "xingqiu",
    name: "Ascension 4 (Lv. 60 → 70)",
    description: "Fourth ascension materials for Xingqiu",
    category: "ascension",
    sortOrder: 4,
    materials: [
      { materialId: "varunada-lazurite-chunk", required: 3 },
      { materialId: "cleansing-heart", required: 8 },
      { materialId: "silk-flower", required: 30 },
      { materialId: "stained-mask", required: 18 },
    ],
  },
  // Ascension 5
  {
    characterId: "xingqiu",
    name: "Ascension 5 (Lv. 70 → 80)",
    description: "Fifth ascension materials for Xingqiu",
    category: "ascension",
    sortOrder: 5,
    materials: [
      { materialId: "varunada-lazurite-chunk", required: 6 },
      { materialId: "cleansing-heart", required: 12 },
      { materialId: "silk-flower", required: 45 },
      { materialId: "ominous-mask", required: 12 },
    ],
  },
  // Ascension 6
  {
    characterId: "xingqiu",
    name: "Ascension 6 (Lv. 80 → 90)",
    description: "Sixth ascension materials for Xingqiu",
    category: "ascension",
    sortOrder: 6,
    materials: [
      { materialId: "varunada-lazurite-gemstone", required: 6 },
      { materialId: "cleansing-heart", required: 20 },
      { materialId: "silk-flower", required: 60 },
      { materialId: "ominous-mask", required: 24 },
    ],
  },
  // All Talents 1 → 6
  {
    characterId: "xingqiu",
    name: "All Talents Level 1 → 6",
    description: "Materials to level all three talents from 1 to 6",
    category: "talent",
    sortOrder: 1,
    materials: [
      { materialId: "teachings-of-gold", required: 9 },
      { materialId: "guide-to-gold", required: 63 },
      { materialId: "damaged-mask", required: 18 },
      { materialId: "stained-mask", required: 66 },
    ],
  },
  // Single Talent 6 → 10
  {
    characterId: "xingqiu",
    name: "Single Talent Level 6 → 10",
    description: "Materials to max one talent from level 6 to 10",
    category: "talent",
    sortOrder: 2,
    materials: [
      { materialId: "guide-to-gold", required: 4 },
      { materialId: "philosophies-of-gold", required: 38 },
      { materialId: "stained-mask", required: 6 },
      { materialId: "ominous-mask", required: 22 },
      { materialId: "tail-of-boreas", required: 6 },
      { materialId: "crown-of-insight", required: 1 },
    ],
  },
  // Triple Crown 6 → 10
  {
    characterId: "xingqiu",
    name: "Triple Crown (All Talents 6 → 10)",
    description: "Materials to max all three talents from level 6 to 10",
    category: "talent",
    sortOrder: 3,
    materials: [
      { materialId: "guide-to-gold", required: 12 },
      { materialId: "philosophies-of-gold", required: 114 },
      { materialId: "stained-mask", required: 18 },
      { materialId: "ominous-mask", required: 66 },
      { materialId: "tail-of-boreas", required: 18 },
      { materialId: "crown-of-insight", required: 3 },
    ],
  },
];