import type { SeedCharacter, SeedCharacterGoalTemplate } from "../types";

export const noelle: SeedCharacter = {
  id: "noelle",
  name: "Noelle",
  image: "https://enka.network/ui/UI_AvatarIcon_Noelle.png",
  rarity: 4,
  element: "Geo",
  weaponType: "Claymore",
  region: "Mondstadt",
};

export const noelleGoalTemplates: SeedCharacterGoalTemplate[] = [
  // Ascension 1
  {
    characterId: "noelle",
    name: "Ascension 1 (Lv. 20 → 40)",
    description: "First ascension materials for Noelle",
    category: "ascension",
    sortOrder: 1,
    materials: [
      { materialId: "prithiva-topaz-sliver", required: 1 },
      { materialId: "valberry", required: 3 },
      { materialId: "damaged-mask", required: 3 },
    ],
  },
  // Ascension 2
  {
    characterId: "noelle",
    name: "Ascension 2 (Lv. 40 → 50)",
    description: "Second ascension materials for Noelle",
    category: "ascension",
    sortOrder: 2,
    materials: [
      { materialId: "prithiva-topaz-fragment", required: 3 },
      { materialId: "basalt-pillar", required: 2 },
      { materialId: "valberry", required: 10 },
      { materialId: "damaged-mask", required: 15 },
    ],
  },
  // Ascension 3
  {
    characterId: "noelle",
    name: "Ascension 3 (Lv. 50 → 60)",
    description: "Third ascension materials for Noelle",
    category: "ascension",
    sortOrder: 3,
    materials: [
      { materialId: "prithiva-topaz-fragment", required: 6 },
      { materialId: "basalt-pillar", required: 4 },
      { materialId: "valberry", required: 20 },
      { materialId: "stained-mask", required: 12 },
    ],
  },
  // Ascension 4
  {
    characterId: "noelle",
    name: "Ascension 4 (Lv. 60 → 70)",
    description: "Fourth ascension materials for Noelle",
    category: "ascension",
    sortOrder: 4,
    materials: [
      { materialId: "prithiva-topaz-chunk", required: 3 },
      { materialId: "basalt-pillar", required: 8 },
      { materialId: "valberry", required: 30 },
      { materialId: "stained-mask", required: 18 },
    ],
  },
  // Ascension 5
  {
    characterId: "noelle",
    name: "Ascension 5 (Lv. 70 → 80)",
    description: "Fifth ascension materials for Noelle",
    category: "ascension",
    sortOrder: 5,
    materials: [
      { materialId: "prithiva-topaz-chunk", required: 6 },
      { materialId: "basalt-pillar", required: 12 },
      { materialId: "valberry", required: 45 },
      { materialId: "ominous-mask", required: 12 },
    ],
  },
  // Ascension 6
  {
    characterId: "noelle",
    name: "Ascension 6 (Lv. 80 → 90)",
    description: "Sixth ascension materials for Noelle",
    category: "ascension",
    sortOrder: 6,
    materials: [
      { materialId: "prithiva-topaz-gemstone", required: 6 },
      { materialId: "basalt-pillar", required: 20 },
      { materialId: "valberry", required: 60 },
      { materialId: "ominous-mask", required: 24 },
    ],
  },
  // All Talents 1 → 6
  {
    characterId: "noelle",
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
    characterId: "noelle",
    name: "Single Talent Level 6 → 10",
    description: "Materials to max one talent from level 6 to 10",
    category: "talent",
    sortOrder: 2,
    materials: [
      { materialId: "guide-to-resistance", required: 4 },
      { materialId: "philosophies-of-resistance", required: 38 },
      { materialId: "stained-mask", required: 6 },
      { materialId: "ominous-mask", required: 22 },
      { materialId: "dvalins-claw", required: 6 },
      { materialId: "crown-of-insight", required: 1 },
    ],
  },
  // Triple Crown 6 → 10
  {
    characterId: "noelle",
    name: "Triple Crown (All Talents 6 → 10)",
    description: "Materials to max all three talents from level 6 to 10",
    category: "talent",
    sortOrder: 3,
    materials: [
      { materialId: "guide-to-resistance", required: 12 },
      { materialId: "philosophies-of-resistance", required: 114 },
      { materialId: "stained-mask", required: 18 },
      { materialId: "ominous-mask", required: 66 },
      { materialId: "dvalins-claw", required: 18 },
      { materialId: "crown-of-insight", required: 3 },
    ],
  },
];