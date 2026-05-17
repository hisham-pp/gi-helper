import type { SeedCharacter, SeedCharacterGoalTemplate } from "../types";

export const jean: SeedCharacter = {
  id: "jean",
  name: "Jean",
  image: "https://enka.network/ui/UI_AvatarIcon_Jean.png",
  rarity: 5,
  element: "Anemo",
  weaponType: "Sword",
  region: "Mondstadt",
};

export const jeanGoalTemplates: SeedCharacterGoalTemplate[] = [
  // Ascension 1
  {
    characterId: "jean",
    name: "Ascension 1 (Lv. 20 → 40)",
    description: "First ascension materials for Jean",
    category: "ascension",
    sortOrder: 1,
    materials: [
      { materialId: "vayuda-turquoise-sliver", required: 1 },
      { materialId: "dandelion-seed", required: 3 },
      { materialId: "damaged-mask", required: 3 },
    ],
  },
  // Ascension 2
  {
    characterId: "jean",
    name: "Ascension 2 (Lv. 40 → 50)",
    description: "Second ascension materials for Jean",
    category: "ascension",
    sortOrder: 2,
    materials: [
      { materialId: "vayuda-turquoise-fragment", required: 3 },
      { materialId: "hurricane-seed", required: 2 },
      { materialId: "dandelion-seed", required: 10 },
      { materialId: "damaged-mask", required: 15 },
    ],
  },
  // Ascension 3
  {
    characterId: "jean",
    name: "Ascension 3 (Lv. 50 → 60)",
    description: "Third ascension materials for Jean",
    category: "ascension",
    sortOrder: 3,
    materials: [
      { materialId: "vayuda-turquoise-fragment", required: 6 },
      { materialId: "hurricane-seed", required: 4 },
      { materialId: "dandelion-seed", required: 20 },
      { materialId: "stained-mask", required: 12 },
    ],
  },
  // Ascension 4
  {
    characterId: "jean",
    name: "Ascension 4 (Lv. 60 → 70)",
    description: "Fourth ascension materials for Jean",
    category: "ascension",
    sortOrder: 4,
    materials: [
      { materialId: "vayuda-turquoise-chunk", required: 3 },
      { materialId: "hurricane-seed", required: 8 },
      { materialId: "dandelion-seed", required: 30 },
      { materialId: "stained-mask", required: 18 },
    ],
  },
  // Ascension 5
  {
    characterId: "jean",
    name: "Ascension 5 (Lv. 70 → 80)",
    description: "Fifth ascension materials for Jean",
    category: "ascension",
    sortOrder: 5,
    materials: [
      { materialId: "vayuda-turquoise-chunk", required: 6 },
      { materialId: "hurricane-seed", required: 12 },
      { materialId: "dandelion-seed", required: 45 },
      { materialId: "ominous-mask", required: 12 },
    ],
  },
  // Ascension 6
  {
    characterId: "jean",
    name: "Ascension 6 (Lv. 80 → 90)",
    description: "Sixth ascension materials for Jean",
    category: "ascension",
    sortOrder: 6,
    materials: [
      { materialId: "vayuda-turquoise-gemstone", required: 6 },
      { materialId: "hurricane-seed", required: 20 },
      { materialId: "dandelion-seed", required: 60 },
      { materialId: "ominous-mask", required: 24 },
    ],
  },
  // All Talents 1 → 6
  {
    characterId: "jean",
    name: "All Talents Level 1 → 6",
    description: "Materials to level all three talents from 1 to 6",
    category: "talent",
    sortOrder: 1,
    materials: [
      { materialId: "teachings-of-resistance", required: 9 },
      { materialId: "guide-to-resistance", required: 63 },
      { materialId: "damaged-mask", required: 18 },
      { materialId: "stained-mask", required: 66 },
    ],
  },
  // Single Talent 6 → 10
  {
    characterId: "jean",
    name: "Single Talent Level 6 → 10",
    description: "Materials to max one talent from level 6 to 10",
    category: "talent",
    sortOrder: 2,
    materials: [
      { materialId: "guide-to-resistance", required: 4 },
      { materialId: "philosophies-of-resistance", required: 38 },
      { materialId: "stained-mask", required: 6 },
      { materialId: "ominous-mask", required: 22 },
      { materialId: "dvalins-plume", required: 6 },
      { materialId: "crown-of-insight", required: 1 },
    ],
  },
  // Triple Crown 6 → 10
  {
    characterId: "jean",
    name: "Triple Crown (All Talents 6 → 10)",
    description: "Materials to max all three talents from level 6 to 10",
    category: "talent",
    sortOrder: 3,
    materials: [
      { materialId: "guide-to-resistance", required: 12 },
      { materialId: "philosophies-of-resistance", required: 114 },
      { materialId: "stained-mask", required: 18 },
      { materialId: "ominous-mask", required: 66 },
      { materialId: "dvalins-plume", required: 18 },
      { materialId: "crown-of-insight", required: 3 },
    ],
  },
];