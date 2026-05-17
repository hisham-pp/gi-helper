import type { SeedCharacter, SeedCharacterGoalTemplate } from "../types";

export const nefer: SeedCharacter = {
  id: "nefer",
  name: "Nefer",
  image: "https://enka.network/ui/UI_AvatarIcon_Nefer.png",
  rarity: 5,
  element: "Dendro",
  weaponType: "Catalyst",
  region: "Nod-Krai",
};

export const neferGoalTemplates: SeedCharacterGoalTemplate[] = [
  // Ascension 1
  {
    characterId: "nefer",
    name: "Ascension 1 (Lv. 20 → 40)",
    description: "First ascension materials for Nefer",
    category: "ascension",
    sortOrder: 1,
    materials: [
      { materialId: "nagadus-emerald-sliver", required: 1 },
      { materialId: "moonfall-silver", required: 3 },
      { materialId: "tattered-warrant", required: 3 },
    ],
  },
  // Ascension 2
  {
    characterId: "nefer",
    name: "Ascension 2 (Lv. 40 → 50)",
    description: "Second ascension materials for Nefer",
    category: "ascension",
    sortOrder: 2,
    materials: [
      { materialId: "nagadus-emerald-fragment", required: 3 },
      { materialId: "radiant-antler", required: 2 },
      { materialId: "moonfall-silver", required: 10 },
      { materialId: "tattered-warrant", required: 15 },
    ],
  },
  // Ascension 3
  {
    characterId: "nefer",
    name: "Ascension 3 (Lv. 50 → 60)",
    description: "Third ascension materials for Nefer",
    category: "ascension",
    sortOrder: 3,
    materials: [
      { materialId: "nagadus-emerald-fragment", required: 6 },
      { materialId: "radiant-antler", required: 4 },
      { materialId: "moonfall-silver", required: 20 },
      { materialId: "immaculate-warrant", required: 12 },
    ],
  },
  // Ascension 4
  {
    characterId: "nefer",
    name: "Ascension 4 (Lv. 60 → 70)",
    description: "Fourth ascension materials for Nefer",
    category: "ascension",
    sortOrder: 4,
    materials: [
      { materialId: "nagadus-emerald-chunk", required: 3 },
      { materialId: "radiant-antler", required: 8 },
      { materialId: "moonfall-silver", required: 30 },
      { materialId: "immaculate-warrant", required: 18 },
    ],
  },
  // Ascension 5
  {
    characterId: "nefer",
    name: "Ascension 5 (Lv. 70 → 80)",
    description: "Fifth ascension materials for Nefer",
    category: "ascension",
    sortOrder: 5,
    materials: [
      { materialId: "nagadus-emerald-chunk", required: 6 },
      { materialId: "radiant-antler", required: 12 },
      { materialId: "moonfall-silver", required: 45 },
      { materialId: "frost-etched-warrant", required: 12 },
    ],
  },
  // Ascension 6
  {
    characterId: "nefer",
    name: "Ascension 6 (Lv. 80 → 90)",
    description: "Sixth ascension materials for Nefer",
    category: "ascension",
    sortOrder: 6,
    materials: [
      { materialId: "nagadus-emerald-gemstone", required: 6 },
      { materialId: "radiant-antler", required: 20 },
      { materialId: "moonfall-silver", required: 60 },
      { materialId: "frost-etched-warrant", required: 24 },
    ],
  },
  // All Talents 1 → 6
  {
    characterId: "nefer",
    name: "All Talents Level 1 → 6",
    description: "Materials to level all three talents from 1 to 6",
    category: "talent",
    sortOrder: 1,
    materials: [
      { materialId: "teachings-of-elysium", required: 9 },
      { materialId: "guide-to-elysium", required: 63 },
      { materialId: "tattered-warrant", required: 18 },
      { materialId: "immaculate-warrant", required: 66 },
    ],
  },
  // Single Talent 6 → 10
  {
    characterId: "nefer",
    name: "Single Talent Level 6 → 10",
    description: "Materials to max one talent from level 6 to 10",
    category: "talent",
    sortOrder: 2,
    materials: [
      { materialId: "guide-to-elysium", required: 4 },
      { materialId: "philosophies-of-elysium", required: 38 },
      { materialId: "immaculate-warrant", required: 6 },
      { materialId: "frost-etched-warrant", required: 22 },
      { materialId: "ascended-sample-rook", required: 6 },
      { materialId: "crown-of-insight", required: 1 },
    ],
  },
  // Triple Crown 6 → 10
  {
    characterId: "nefer",
    name: "Triple Crown (All Talents 6 → 10)",
    description: "Materials to max all three talents from level 6 to 10",
    category: "talent",
    sortOrder: 3,
    materials: [
      { materialId: "guide-to-elysium", required: 12 },
      { materialId: "philosophies-of-elysium", required: 114 },
      { materialId: "immaculate-warrant", required: 18 },
      { materialId: "frost-etched-warrant", required: 66 },
      { materialId: "ascended-sample-rook", required: 18 },
      { materialId: "crown-of-insight", required: 3 },
    ],
  },
];
