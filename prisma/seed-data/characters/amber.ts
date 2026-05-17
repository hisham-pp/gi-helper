import type { SeedCharacter, SeedCharacterGoalTemplate } from "../types";

export const amber: SeedCharacter = {
  id: "amber",
  name: "Amber",
  image: "https://enka.network/ui/UI_AvatarIcon_Amber.png",
  rarity: 4,
  element: "Pyro",
  weaponType: "Bow",
  region: "Mondstadt",
};

export const amberGoalTemplates: SeedCharacterGoalTemplate[] = [
  // Ascension 1
  {
    characterId: "amber",
    name: "Ascension 1 (Lv. 20 → 40)",
    description: "First ascension materials for Amber",
    category: "ascension",
    sortOrder: 1,
    materials: [
      { materialId: "agnidus-agate-sliver", required: 1 },
      { materialId: "small-lamp-grass", required: 3 },
      { materialId: "firm-arrowhead", required: 3 },
    ],
  },
  // Ascension 2
  {
    characterId: "amber",
    name: "Ascension 2 (Lv. 40 → 50)",
    description: "Second ascension materials for Amber",
    category: "ascension",
    sortOrder: 2,
    materials: [
      { materialId: "agnidus-agate-fragment", required: 3 },
      { materialId: "everflame-seed", required: 2 },
      { materialId: "small-lamp-grass", required: 10 },
      { materialId: "firm-arrowhead", required: 15 },
    ],
  },
  // Ascension 3
  {
    characterId: "amber",
    name: "Ascension 3 (Lv. 50 → 60)",
    description: "Third ascension materials for Amber",
    category: "ascension",
    sortOrder: 3,
    materials: [
      { materialId: "agnidus-agate-fragment", required: 6 },
      { materialId: "everflame-seed", required: 4 },
      { materialId: "small-lamp-grass", required: 20 },
      { materialId: "sharp-arrowhead", required: 12 },
    ],
  },
  // Ascension 4
  {
    characterId: "amber",
    name: "Ascension 4 (Lv. 60 → 70)",
    description: "Fourth ascension materials for Amber",
    category: "ascension",
    sortOrder: 4,
    materials: [
      { materialId: "agnidus-agate-chunk", required: 3 },
      { materialId: "everflame-seed", required: 8 },
      { materialId: "small-lamp-grass", required: 30 },
      { materialId: "sharp-arrowhead", required: 18 },
    ],
  },
  // Ascension 5
  {
    characterId: "amber",
    name: "Ascension 5 (Lv. 70 → 80)",
    description: "Fifth ascension materials for Amber",
    category: "ascension",
    sortOrder: 5,
    materials: [
      { materialId: "agnidus-agate-chunk", required: 6 },
      { materialId: "everflame-seed", required: 12 },
      { materialId: "small-lamp-grass", required: 45 },
      { materialId: "weathered-arrowhead", required: 12 },
    ],
  },
  // Ascension 6
  {
    characterId: "amber",
    name: "Ascension 6 (Lv. 80 → 90)",
    description: "Sixth ascension materials for Amber",
    category: "ascension",
    sortOrder: 6,
    materials: [
      { materialId: "agnidus-agate-gemstone", required: 6 },
      { materialId: "everflame-seed", required: 20 },
      { materialId: "small-lamp-grass", required: 60 },
      { materialId: "weathered-arrowhead", required: 24 },
    ],
  },
  // All Talents 1 → 6
  {
    characterId: "amber",
    name: "All Talents Level 1 → 6",
    description: "Materials to level all three talents from 1 to 6",
    category: "talent",
    sortOrder: 1,
    materials: [
      { materialId: "teachings-of-freedom", required: 9 },
      { materialId: "guide-to-freedom", required: 63 },
      { materialId: "firm-arrowhead", required: 18 },
      { materialId: "sharp-arrowhead", required: 66 },
    ],
  },
  // Single Talent 6 → 10
  {
    characterId: "amber",
    name: "Single Talent Level 6 → 10",
    description: "Materials to max one talent from level 6 to 10",
    category: "talent",
    sortOrder: 2,
    materials: [
      { materialId: "guide-to-freedom", required: 4 },
      { materialId: "philosophies-of-freedom", required: 38 },
      { materialId: "sharp-arrowhead", required: 6 },
      { materialId: "weathered-arrowhead", required: 22 },
      { materialId: "dvalins-sigh", required: 6 },
      { materialId: "crown-of-insight", required: 1 },
    ],
  },
  // Triple Crown 6 → 10
  {
    characterId: "amber",
    name: "Triple Crown (All Talents 6 → 10)",
    description: "Materials to max all three talents from level 6 to 10",
    category: "talent",
    sortOrder: 3,
    materials: [
      { materialId: "guide-to-freedom", required: 12 },
      { materialId: "philosophies-of-freedom", required: 114 },
      { materialId: "sharp-arrowhead", required: 18 },
      { materialId: "weathered-arrowhead", required: 66 },
      { materialId: "dvalins-sigh", required: 18 },
      { materialId: "crown-of-insight", required: 3 },
    ],
  },
];