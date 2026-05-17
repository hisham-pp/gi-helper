import type { SeedCharacter, SeedCharacterGoalTemplate } from "../types";

export const barbara: SeedCharacter = {
  id: "barbara",
  name: "Barbara",
  image: "https://enka.network/ui/UI_AvatarIcon_Barbara.png",
  rarity: 4,
  element: "Hydro",
  weaponType: "Catalyst",
  region: "Mondstadt",
};

export const barbaraGoalTemplates: SeedCharacterGoalTemplate[] = [
  // Ascension 1
  {
    characterId: "barbara",
    name: "Ascension 1 (Lv. 20 → 40)",
    description: "First ascension materials for Barbara",
    category: "ascension",
    sortOrder: 1,
    materials: [
      { materialId: "varunada-lazurite-sliver", required: 1 },
      { materialId: "philanemo-mushroom", required: 3 },
      { materialId: "divining-scroll", required: 3 },
    ],
  },
  // Ascension 2
  {
    characterId: "barbara",
    name: "Ascension 2 (Lv. 40 → 50)",
    description: "Second ascension materials for Barbara",
    category: "ascension",
    sortOrder: 2,
    materials: [
      { materialId: "varunada-lazurite-fragment", required: 3 },
      { materialId: "cleansing-heart", required: 2 },
      { materialId: "philanemo-mushroom", required: 10 },
      { materialId: "divining-scroll", required: 15 },
    ],
  },
  // Ascension 3
  {
    characterId: "barbara",
    name: "Ascension 3 (Lv. 50 → 60)",
    description: "Third ascension materials for Barbara",
    category: "ascension",
    sortOrder: 3,
    materials: [
      { materialId: "varunada-lazurite-fragment", required: 6 },
      { materialId: "cleansing-heart", required: 4 },
      { materialId: "philanemo-mushroom", required: 20 },
      { materialId: "sealed-scroll", required: 12 },
    ],
  },
  // Ascension 4
  {
    characterId: "barbara",
    name: "Ascension 4 (Lv. 60 → 70)",
    description: "Fourth ascension materials for Barbara",
    category: "ascension",
    sortOrder: 4,
    materials: [
      { materialId: "varunada-lazurite-chunk", required: 3 },
      { materialId: "cleansing-heart", required: 8 },
      { materialId: "philanemo-mushroom", required: 30 },
      { materialId: "sealed-scroll", required: 18 },
    ],
  },
  // Ascension 5
  {
    characterId: "barbara",
    name: "Ascension 5 (Lv. 70 → 80)",
    description: "Fifth ascension materials for Barbara",
    category: "ascension",
    sortOrder: 5,
    materials: [
      { materialId: "varunada-lazurite-chunk", required: 6 },
      { materialId: "cleansing-heart", required: 12 },
      { materialId: "philanemo-mushroom", required: 45 },
      { materialId: "forbidden-curse-scroll", required: 12 },
    ],
  },
  // Ascension 6
  {
    characterId: "barbara",
    name: "Ascension 6 (Lv. 80 → 90)",
    description: "Sixth ascension materials for Barbara",
    category: "ascension",
    sortOrder: 6,
    materials: [
      { materialId: "varunada-lazurite-gemstone", required: 6 },
      { materialId: "cleansing-heart", required: 20 },
      { materialId: "philanemo-mushroom", required: 60 },
      { materialId: "forbidden-curse-scroll", required: 24 },
    ],
  },
  // All Talents 1 → 6
  {
    characterId: "barbara",
    name: "All Talents Level 1 → 6",
    description: "Materials to level all three talents from 1 to 6",
    category: "talent",
    sortOrder: 1,
    materials: [
      { materialId: "teachings-of-freedom", required: 9 },
      { materialId: "guide-to-freedom", required: 63 },
      { materialId: "divining-scroll", required: 18 },
      { materialId: "sealed-scroll", required: 66 },
    ],
  },
  // Single Talent 6 → 10
  {
    characterId: "barbara",
    name: "Single Talent Level 6 → 10",
    description: "Materials to max one talent from level 6 to 10",
    category: "talent",
    sortOrder: 2,
    materials: [
      { materialId: "guide-to-freedom", required: 4 },
      { materialId: "philosophies-of-freedom", required: 38 },
      { materialId: "sealed-scroll", required: 6 },
      { materialId: "forbidden-curse-scroll", required: 22 },
      { materialId: "ring-of-boreas", required: 6 },
      { materialId: "crown-of-insight", required: 1 },
    ],
  },
  // Triple Crown 6 → 10
  {
    characterId: "barbara",
    name: "Triple Crown (All Talents 6 → 10)",
    description: "Materials to max all three talents from level 6 to 10",
    category: "talent",
    sortOrder: 3,
    materials: [
      { materialId: "guide-to-freedom", required: 12 },
      { materialId: "philosophies-of-freedom", required: 114 },
      { materialId: "sealed-scroll", required: 18 },
      { materialId: "forbidden-curse-scroll", required: 66 },
      { materialId: "ring-of-boreas", required: 18 },
      { materialId: "crown-of-insight", required: 3 },
    ],
  },
];