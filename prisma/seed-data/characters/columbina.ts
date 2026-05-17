import type { SeedCharacter, SeedCharacterGoalTemplate } from "../types";

export const columbina: SeedCharacter = {
  id: "columbina",
  name: "Columbina",
  image: "https://enka.network/ui/UI_AvatarIcon_Columbina.png", // Placeholder mapping path format
  rarity: 5,
  element: "Cryo", // Expected/speculative element based on design motifs
  weaponType: "Catalyst", // Speculative weapon configuration
  region: "Snezhnaya",
};

export const columbinaGoalTemplates: SeedCharacterGoalTemplate[] = [
  // Ascension 1
  {
    characterId: "columbina",
    name: "Ascension 1 (Lv. 20 → 40)",
    description: "First ascension materials for Columbina",
    category: "ascension",
    sortOrder: 1,
    materials: [
      { materialId: "shivada-jade-sliver", required: 1 },
      { materialId: "placeholder-specialty", required: 3 },
      { materialId: "placeholder-enemy-drop-1", required: 3 },
    ],
  },
  // Ascension 2
  {
    characterId: "columbina",
    name: "Ascension 2 (Lv. 40 → 50)",
    description: "Second ascension materials for Columbina",
    category: "ascension",
    sortOrder: 2,
    materials: [
      { materialId: "shivada-jade-fragment", required: 3 },
      { materialId: "placeholder-boss-drop", required: 2 },
      { materialId: "placeholder-specialty", required: 10 },
      { materialId: "placeholder-enemy-drop-1", required: 15 },
    ],
  },
  // Ascension 3
  {
    characterId: "columbina",
    name: "Ascension 3 (Lv. 50 → 60)",
    description: "Third ascension materials for Columbina",
    category: "ascension",
    sortOrder: 3,
    materials: [
      { materialId: "shivada-jade-fragment", required: 6 },
      { materialId: "placeholder-boss-drop", required: 4 },
      { materialId: "placeholder-specialty", required: 20 },
      { materialId: "placeholder-enemy-drop-2", required: 12 },
    ],
  },
  // Ascension 4
  {
    characterId: "columbina",
    name: "Ascension 4 (Lv. 60 → 70)",
    description: "Fourth ascension materials for Columbina",
    category: "ascension",
    sortOrder: 4,
    materials: [
      { materialId: "shivada-jade-chunk", required: 3 },
      { materialId: "placeholder-boss-drop", required: 8 },
      { materialId: "placeholder-specialty", required: 30 },
      { materialId: "placeholder-enemy-drop-2", required: 18 },
    ],
  },
  // Ascension 5
  {
    characterId: "columbina",
    name: "Ascension 5 (Lv. 70 → 80)",
    description: "Fifth ascension materials for Columbina",
    category: "ascension",
    sortOrder: 5,
    materials: [
      { materialId: "shivada-jade-chunk", required: 6 },
      { materialId: "placeholder-boss-drop", required: 12 },
      { materialId: "placeholder-specialty", required: 45 },
      { materialId: "placeholder-enemy-drop-3", required: 12 },
    ],
  },
  // Ascension 6
  {
    characterId: "columbina",
    name: "Ascension 6 (Lv. 80 → 90)",
    description: "Sixth ascension materials for Columbina",
    category: "ascension",
    sortOrder: 6,
    materials: [
      { materialId: "shivada-jade-gemstone", required: 6 },
      { materialId: "placeholder-boss-drop", required: 20 },
      { materialId: "placeholder-specialty", required: 60 },
      { materialId: "placeholder-enemy-drop-3", required: 24 },
    ],
  },
  // All Talents 1 → 6
  {
    characterId: "columbina",
    name: "All Talents Level 1 → 6",
    description: "Materials to level all three talents from 1 to 6",
    category: "talent",
    sortOrder: 1,
    materials: [
      { materialId: "teachings-of-placeholder", required: 9 },
      { materialId: "guide-to-placeholder", required: 63 },
      { materialId: "placeholder-enemy-drop-1", required: 18 },
      { materialId: "placeholder-enemy-drop-2", required: 66 },
    ],
  },
  // Single Talent 6 → 10
  {
    characterId: "columbina",
    name: "Single Talent Level 6 → 10",
    description: "Materials to max one talent from level 6 to 10",
    category: "talent",
    sortOrder: 2,
    materials: [
      { materialId: "guide-to-placeholder", required: 4 },
      { materialId: "philosophies-of-placeholder", required: 38 },
      { materialId: "placeholder-enemy-drop-2", required: 6 },
      { materialId: "placeholder-enemy-drop-3", required: 22 },
      { materialId: "placeholder-weekly-boss-drop", required: 6 },
      { materialId: "crown-of-insight", required: 1 },
    ],
  },
  // Triple Crown 6 → 10
  {
    characterId: "columbina",
    name: "Triple Crown (All Talents 6 → 10)",
    description: "Materials to max all three talents from level 6 to 10",
    category: "talent",
    sortOrder: 3,
    materials: [
      { materialId: "guide-to-placeholder", required: 12 },
      { materialId: "philosophies-of-placeholder", required: 114 },
      { materialId: "placeholder-enemy-drop-2", required: 18 },
      { materialId: "placeholder-enemy-drop-3", required: 66 },
      { materialId: "placeholder-weekly-boss-drop", required: 18 },
      { materialId: "crown-of-insight", required: 3 },
    ],
  },
];