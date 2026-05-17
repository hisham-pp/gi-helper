import type { SeedCharacter, SeedCharacterGoalTemplate } from "../types";

export const diluc: SeedCharacter = {
  id: "diluc",
  name: "Diluc",
  image: "https://enka.network/ui/UI_AvatarIcon_Diluc.png",
  rarity: 5,
  element: "Pyro",
  weaponType: "Claymore",
  region: "Mondstadt",
};

export const dilucGoalTemplates: SeedCharacterGoalTemplate[] = [
  // Ascension 1
  {
    characterId: "diluc",
    name: "Ascension 1 (Lv. 20 → 40)",
    description: "First ascension materials for Diluc",
    category: "ascension",
    sortOrder: 1,
    materials: [
      { materialId: "agnidus-agate-sliver", required: 1 },
      { materialId: "small-lamp-grass", required: 3 },
      { materialId: "recruits-insignia", required: 3 },
    ],
  },
  // Ascension 2
  {
    characterId: "diluc",
    name: "Ascension 2 (Lv. 40 → 50)",
    description: "Second ascension materials for Diluc",
    category: "ascension",
    sortOrder: 2,
    materials: [
      { materialId: "agnidus-agate-fragment", required: 3 },
      { materialId: "everflame-seed", required: 2 },
      { materialId: "small-lamp-grass", required: 10 },
      { materialId: "recruits-insignia", required: 15 },
    ],
  },
  // Ascension 3
  {
    characterId: "diluc",
    name: "Ascension 3 (Lv. 50 → 60)",
    description: "Third ascension materials for Diluc",
    category: "ascension",
    sortOrder: 3,
    materials: [
      { materialId: "agnidus-agate-fragment", required: 6 },
      { materialId: "everflame-seed", required: 4 },
      { materialId: "small-lamp-grass", required: 20 },
      { materialId: "sergeants-insignia", required: 12 },
    ],
  },
  // Ascension 4
  {
    characterId: "diluc",
    name: "Ascension 4 (Lv. 60 → 70)",
    description: "Fourth ascension materials for Diluc",
    category: "ascension",
    sortOrder: 4,
    materials: [
      { materialId: "agnidus-agate-chunk", required: 3 },
      { materialId: "everflame-seed", required: 8 },
      { materialId: "small-lamp-grass", required: 30 },
      { materialId: "sergeants-insignia", required: 18 },
    ],
  },
  // Ascension 5
  {
    characterId: "diluc",
    name: "Ascension 5 (Lv. 70 → 80)",
    description: "Fifth ascension materials for Diluc",
    category: "ascension",
    sortOrder: 5,
    materials: [
      { materialId: "agnidus-agate-chunk", required: 6 },
      { materialId: "everflame-seed", required: 12 },
      { materialId: "small-lamp-grass", required: 45 },
      { materialId: "lieutenants-insignia", required: 12 },
    ],
  },
  // Ascension 6
  {
    characterId: "diluc",
    name: "Ascension 6 (Lv. 80 → 90)",
    description: "Sixth ascension materials for Diluc",
    category: "ascension",
    sortOrder: 6,
    materials: [
      { materialId: "agnidus-agate-gemstone", required: 6 },
      { materialId: "everflame-seed", required: 20 },
      { materialId: "small-lamp-grass", required: 60 },
      { materialId: "lieutenants-insignia", required: 24 },
    ],
  },
  // All Talents 1 → 6
  {
    characterId: "diluc",
    name: "All Talents Level 1 → 6",
    description: "Materials to level all three talents from 1 to 6",
    category: "talent",
    sortOrder: 1,
    materials: [
      { materialId: "teachings-of-resistance", required: 9 },
      { materialId: "guide-to-resistance", required: 63 },
      { materialId: "recruits-insignia", required: 18 },
      { materialId: "sergeants-insignia", required: 66 },
    ],
  },
  // Single Talent 6 → 10
  {
    characterId: "diluc",
    name: "Single Talent Level 6 → 10",
    description: "Materials to max one talent from level 6 to 10",
    category: "talent",
    sortOrder: 2,
    materials: [
      { materialId: "guide-to-resistance", required: 4 },
      { materialId: "philosophies-of-resistance", required: 38 },
      { materialId: "sergeants-insignia", required: 6 },
      { materialId: "lieutenants-insignia", required: 22 },
      { materialId: "dvalins-plume", required: 6 },
      { materialId: "crown-of-insight", required: 1 },
    ],
  },
  // Triple Crown 6 → 10
  {
    characterId: "diluc",
    name: "Triple Crown (All Talents 6 → 10)",
    description: "Materials to max all three talents from level 6 to 10",
    category: "talent",
    sortOrder: 3,
    materials: [
      { materialId: "guide-to-resistance", required: 12 },
      { materialId: "philosophies-of-resistance", required: 114 },
      { materialId: "sergeants-insignia", required: 18 },
      { materialId: "lieutenants-insignia", required: 66 },
      { materialId: "dvalins-plume", required: 18 },
      { materialId: "crown-of-insight", required: 3 },
    ],
  },
];