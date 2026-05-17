import type { SeedCharacter, SeedCharacterGoalTemplate } from "../types";

export const jahoda: SeedCharacter = {
  id: "jahoda",
  name: "Jahoda",
  image: "https://enka.network/ui/UI_AvatarIcon_Jahoda.png",
  rarity: 5,
  element: "Pyro",
  weaponType: "Bow",
  region: "Nod-Krai",
};

export const jahodaGoalTemplates: SeedCharacterGoalTemplate[] = [
  // Ascension 1
  {
    characterId: "jahoda",
    name: "Ascension 1 (Lv. 20 → 40)",
    description: "First ascension materials for Jahoda",
    category: "ascension",
    sortOrder: 1,
    materials: [
      { materialId: "agnidus-agate-sliver", required: 1 },
      { materialId: "cinder-bloom", required: 3 },
      { materialId: "broken-drive-shaft", required: 3 },
    ],
  },
  // Ascension 2
  {
    characterId: "jahoda",
    name: "Ascension 2 (Lv. 40 → 50)",
    description: "Second ascension materials for Jahoda",
    category: "ascension",
    sortOrder: 2,
    materials: [
      { materialId: "agnidus-agate-fragment", required: 3 },
      { materialId: "prismatic-severed-tail", required: 2 },
      { materialId: "cinder-bloom", required: 10 },
      { materialId: "broken-drive-shaft", required: 15 },
    ],
  },
  // Ascension 3
  {
    characterId: "jahoda",
    name: "Ascension 3 (Lv. 50 → 60)",
    description: "Third ascension materials for Jahoda",
    category: "ascension",
    sortOrder: 3,
    materials: [
      { materialId: "agnidus-agate-fragment", required: 6 },
      { materialId: "prismatic-severed-tail", required: 4 },
      { materialId: "cinder-bloom", required: 20 },
      { materialId: "reinforced-drive-shaft", required: 12 },
    ],
  },
  // Ascension 4
  {
    characterId: "jahoda",
    name: "Ascension 4 (Lv. 60 → 70)",
    description: "Fourth ascension materials for Jahoda",
    category: "ascension",
    sortOrder: 4,
    materials: [
      { materialId: "agnidus-agate-chunk", required: 3 },
      { materialId: "prismatic-severed-tail", required: 8 },
      { materialId: "cinder-bloom", required: 30 },
      { materialId: "reinforced-drive-shaft", required: 18 },
    ],
  },
  // Ascension 5
  {
    characterId: "jahoda",
    name: "Ascension 5 (Lv. 70 → 80)",
    description: "Fifth ascension materials for Jahoda",
    category: "ascension",
    sortOrder: 5,
    materials: [
      { materialId: "agnidus-agate-chunk", required: 6 },
      { materialId: "prismatic-severed-tail", required: 12 },
      { materialId: "cinder-bloom", required: 45 },
      { materialId: "precision-drive-shaft", required: 12 },
    ],
  },
  // Ascension 6
  {
    characterId: "jahoda",
    name: "Ascension 6 (Lv. 80 → 90)",
    description: "Sixth ascension materials for Jahoda",
    category: "ascension",
    sortOrder: 6,
    materials: [
      { materialId: "agnidus-agate-gemstone", required: 6 },
      { materialId: "prismatic-severed-tail", required: 20 },
      { materialId: "cinder-bloom", required: 60 },
      { materialId: "precision-drive-shaft", required: 24 },
    ],
  },
  // All Talents 1 → 6
  {
    characterId: "jahoda",
    name: "All Talents Level 1 → 6",
    description: "Materials to level all three talents from 1 to 6",
    category: "talent",
    sortOrder: 1,
    materials: [
      { materialId: "teachings-of-elysium", required: 9 },
      { materialId: "guide-to-elysium", required: 63 },
      { materialId: "broken-drive-shaft", required: 18 },
      { materialId: "reinforced-drive-shaft", required: 66 },
    ],
  },
  // Single Talent 6 → 10
  {
    characterId: "jahoda",
    name: "Single Talent Level 6 → 10",
    description: "Materials to max one talent from level 6 to 10",
    category: "talent",
    sortOrder: 2,
    materials: [
      { materialId: "guide-to-elysium", required: 4 },
      { materialId: "philosophies-of-elysium", required: 38 },
      { materialId: "reinforced-drive-shaft", required: 6 },
      { materialId: "precision-drive-shaft", required: 22 },
      { materialId: "ascended-sample-rook", required: 6 },
      { materialId: "crown-of-insight", required: 1 },
    ],
  },
  // Triple Crown 6 → 10
  {
    characterId: "jahoda",
    name: "Triple Crown (All Talents 6 → 10)",
    description: "Materials to max all three talents from level 6 to 10",
    category: "talent",
    sortOrder: 3,
    materials: [
      { materialId: "guide-to-elysium", required: 12 },
      { materialId: "philosophies-of-elysium", required: 114 },
      { materialId: "reinforced-drive-shaft", required: 18 },
      { materialId: "precision-drive-shaft", required: 66 },
      { materialId: "ascended-sample-rook", required: 18 },
      { materialId: "crown-of-insight", required: 3 },
    ],
  },
];
