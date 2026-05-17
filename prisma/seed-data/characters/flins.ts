import type { SeedCharacter, SeedCharacterGoalTemplate } from "../types";

export const flins: SeedCharacter = {
  id: "flins",
  name: "Flins",
  image: "https://enka.network/ui/UI_AvatarIcon_Flins.png",
  rarity: 4,
  element: "Pyro",
  weaponType: "Claymore",
  region: "Fontaine",
};

export const flinsGoalTemplates: SeedCharacterGoalTemplate[] = [
  // Ascension 1
  {
    characterId: "flins",
    name: "Ascension 1 (Lv. 20 → 40)",
    description: "First ascension materials for Flins",
    category: "ascension",
    sortOrder: 1,
    materials: [
      { materialId: "agnidus-agate-sliver", required: 1 },
      { materialId: "lumidouce-bell", required: 3 },
      { materialId: "transoceanic-pearl", required: 3 },
    ],
  },

  // Ascension 2
  {
    characterId: "flins",
    name: "Ascension 2 (Lv. 40 → 50)",
    description: "Second ascension materials for Flins",
    category: "ascension",
    sortOrder: 2,
    materials: [
      { materialId: "agnidus-agate-fragment", required: 3 },
      { materialId: "fontemer-unihorn", required: 2 },
      { materialId: "lumidouce-bell", required: 10 },
      { materialId: "transoceanic-pearl", required: 15 },
    ],
  },

  // Ascension 3
  {
    characterId: "flins",
    name: "Ascension 3 (Lv. 50 → 60)",
    description: "Third ascension materials for Flins",
    category: "ascension",
    sortOrder: 3,
    materials: [
      { materialId: "agnidus-agate-fragment", required: 6 },
      { materialId: "fontemer-unihorn", required: 4 },
      { materialId: "lumidouce-bell", required: 20 },
      { materialId: "transoceanic-chunk", required: 12 },
    ],
  },

  // Ascension 4
  {
    characterId: "flins",
    name: "Ascension 4 (Lv. 60 → 70)",
    description: "Fourth ascension materials for Flins",
    category: "ascension",
    sortOrder: 4,
    materials: [
      { materialId: "agnidus-agate-chunk", required: 3 },
      { materialId: "fontemer-unihorn", required: 8 },
      { materialId: "lumidouce-bell", required: 30 },
      { materialId: "transoceanic-chunk", required: 18 },
    ],
  },

  // Ascension 5
  {
    characterId: "flins",
    name: "Ascension 5 (Lv. 70 → 80)",
    description: "Fifth ascension materials for Flins",
    category: "ascension",
    sortOrder: 5,
    materials: [
      { materialId: "agnidus-agate-chunk", required: 6 },
      { materialId: "fontemer-unihorn", required: 12 },
      { materialId: "lumidouce-bell", required: 45 },
      { materialId: "xenochromatic-crystal", required: 12 },
    ],
  },

  // Ascension 6
  {
    characterId: "flins",
    name: "Ascension 6 (Lv. 80 → 90)",
    description: "Sixth ascension materials for Flins",
    category: "ascension",
    sortOrder: 6,
    materials: [
      { materialId: "agnidus-agate-gemstone", required: 6 },
      { materialId: "fontemer-unihorn", required: 20 },
      { materialId: "lumidouce-bell", required: 60 },
      { materialId: "xenochromatic-crystal", required: 24 },
    ],
  },

  // All Talents 1 → 6
  {
    characterId: "flins",
    name: "All Talents Level 1 → 6",
    description: "Materials to level all three talents from 1 to 6",
    category: "talent",
    sortOrder: 1,
    materials: [
      { materialId: "teachings-of-justice", required: 9 },
      { materialId: "guide-to-justice", required: 63 },
      { materialId: "transoceanic-pearl", required: 18 },
      { materialId: "transoceanic-chunk", required: 66 },
    ],
  },

  // Single Talent 6 → 10
  {
    characterId: "flins",
    name: "Single Talent Level 6 → 10",
    description: "Materials to max one talent from level 6 to 10",
    category: "talent",
    sortOrder: 2,
    materials: [
      { materialId: "guide-to-justice", required: 4 },
      { materialId: "philosophies-of-justice", required: 38 },
      { materialId: "transoceanic-chunk", required: 6 },
      { materialId: "xenochromatic-crystal", required: 22 },
      { materialId: "everamber", required: 6 },
      { materialId: "crown-of-insight", required: 1 },
    ],
  },

  // Triple Crown 6 → 10
  {
    characterId: "flins",
    name: "Triple Crown (All Talents 6 → 10)",
    description: "Materials to max all three talents from level 6 to 10",
    category: "talent",
    sortOrder: 3,
    materials: [
      { materialId: "guide-to-justice", required: 12 },
      { materialId: "philosophies-of-justice", required: 114 },
      { materialId: "transoceanic-chunk", required: 18 },
      { materialId: "xenochromatic-crystal", required: 66 },
      { materialId: "everamber", required: 18 },
      { materialId: "crown-of-insight", required: 3 },
    ],
  },
];