import type { SeedCharacter, SeedCharacterGoalTemplate } from "../types";

export const ororon: SeedCharacter = {
  id: "ororon",
  name: "Ororon",
  image: "https://enka.network/ui/UI_AvatarIcon_Ororon.png",
  rarity: 4,
  element: "Electro",
  weaponType: "Bow",
  region: "Natlan",
};

export const ororonGoalTemplates: SeedCharacterGoalTemplate[] = [
  // Ascension 1
  {
    characterId: "ororon",
    name: "Ascension 1 (Lv. 20 → 40)",
    description: "First ascension materials for Ororon",
    category: "ascension",
    sortOrder: 1,
    materials: [
      { materialId: "vajrada-amethyst-sliver", required: 1 },
      { materialId: "glowing-horn-core", required: 3 },
      { materialId: "sentry-source-core", required: 3 },
    ],
  },
  // Ascension 2
  {
    characterId: "ororon",
    name: "Ascension 2 (Lv. 40 → 50)",
    description: "Second ascension materials for Ororon",
    category: "ascension",
    sortOrder: 2,
    materials: [
      { materialId: "vajrada-amethyst-fragment", required: 3 },
      { materialId: "mark-of-the-binding-knot", required: 2 },
      { materialId: "glowing-horn-core", required: 10 },
      { materialId: "sentry-source-core", required: 15 },
    ],
  },
  // Ascension 3
  {
    characterId: "ororon",
    name: "Ascension 3 (Lv. 50 → 60)",
    description: "Third ascension materials for Ororon",
    category: "ascension",
    sortOrder: 3,
    materials: [
      { materialId: "vajrada-amethyst-fragment", required: 6 },
      { materialId: "mark-of-the-binding-knot", required: 4 },
      { materialId: "glowing-horn-core", required: 20 },
      { materialId: "dealer-source-core", required: 12 },
    ],
  },
  // Ascension 4
  {
    characterId: "ororon",
    name: "Ascension 4 (Lv. 60 → 70)",
    description: "Fourth ascension materials for Ororon",
    category: "ascension",
    sortOrder: 4,
    materials: [
      { materialId: "vajrada-amethyst-chunk", required: 3 },
      { materialId: "mark-of-the-binding-knot", required: 8 },
      { materialId: "glowing-horn-core", required: 30 },
      { materialId: "dealer-source-core", required: 18 },
    ],
  },
  // Ascension 5
  {
    characterId: "ororon",
    name: "Ascension 5 (Lv. 70 → 80)",
    description: "Fifth ascension materials for Ororon",
    category: "ascension",
    sortOrder: 5,
    materials: [
      { materialId: "vajrada-amethyst-chunk", required: 6 },
      { materialId: "mark-of-the-binding-knot", required: 12 },
      { materialId: "glowing-horn-core", required: 45 },
      { materialId: "master-source-core", required: 12 },
    ],
  },
  // Ascension 6
  {
    characterId: "ororon",
    name: "Ascension 6 (Lv. 80 → 90)",
    description: "Sixth ascension materials for Ororon",
    category: "ascension",
    sortOrder: 6,
    materials: [
      { materialId: "vajrada-amethyst-gemstone", required: 6 },
      { materialId: "mark-of-the-binding-knot", required: 20 },
      { materialId: "glowing-horn-core", required: 60 },
      { materialId: "master-source-core", required: 24 },
    ],
  },
  // All Talents 1 → 6
  {
    characterId: "ororon",
    name: "All Talents Level 1 → 6",
    description: "Materials to level all three talents from 1 to 6",
    category: "talent",
    sortOrder: 1,
    materials: [
      { materialId: "teachings-of-compassion", required: 9 },
      { materialId: "guide-to-compassion", required: 63 },
      { materialId: "sentry-source-core", required: 18 },
      { materialId: "dealer-source-core", required: 66 },
    ],
  },
  // Single Talent 6 → 10
  {
    characterId: "ororon",
    name: "Single Talent Level 6 → 10",
    description: "Materials to max one talent from level 6 to 10",
    category: "talent",
    sortOrder: 2,
    materials: [
      { materialId: "guide-to-compassion", required: 4 },
      { materialId: "philosophies-of-compassion", required: 38 },
      { materialId: "dealer-source-core", required: 6 },
      { materialId: "master-source-core", required: 22 },
      { materialId: "silken-feather", required: 6 },
      { materialId: "crown-of-insight", required: 1 },
    ],
  },
  // Triple Crown 6 → 10
  {
    characterId: "ororon",
    name: "Triple Crown (All Talents 6 → 10)",
    description: "Materials to max all three talents from level 6 to 10",
    category: "talent",
    sortOrder: 3,
    materials: [
      { materialId: "guide-to-compassion", required: 12 },
      { materialId: "philosophies-of-compassion", required: 114 },
      { materialId: "dealer-source-core", required: 18 },
      { materialId: "master-source-core", required: 66 },
      { materialId: "silken-feather", required: 18 },
      { materialId: "crown-of-insight", required: 3 },
    ],
  },
];