import type { SeedCharacter, SeedCharacterGoalTemplate } from "../types";

export const ifa: SeedCharacter = {
  id: "ifa",
  name: "Ifa",
  image: "https://enka.network/ui/UI_AvatarIcon_Ifa.png",
  rarity: 4,
  element: "Anemo",
  weaponType: "Bow",
  region: "Natlan",
};

export const ifaGoalTemplates: SeedCharacterGoalTemplate[] = [
  // Ascension 1
  {
    characterId: "ifa",
    name: "Ascension 1 (Lv. 20 → 40)",
    description: "First ascension materials for Ifa",
    category: "ascension",
    sortOrder: 1,
    materials: [
      { materialId: "vayuda-turquoise-sliver", required: 1 },
      { materialId: "cloud-puff-berry", required: 3 },
      { materialId: "sentry-wooden-whistle", required: 3 },
    ],
  },
  // Ascension 2
  {
    characterId: "ifa",
    name: "Ascension 2 (Lv. 40 → 50)",
    description: "Second ascension materials for Ifa",
    category: "ascension",
    sortOrder: 2,
    materials: [
      { materialId: "vayuda-turquoise-fragment", required: 3 },
      { materialId: "mark-of-the-binding-blessing", required: 2 },
      { materialId: "cloud-puff-berry", required: 10 },
      { materialId: "sentry-wooden-whistle", required: 15 },
    ],
  },
  // Ascension 3
  {
    characterId: "ifa",
    name: "Ascension 3 (Lv. 50 → 60)",
    description: "Third ascension materials for Ifa",
    category: "ascension",
    sortOrder: 3,
    materials: [
      { materialId: "vayuda-turquoise-fragment", required: 6 },
      { materialId: "mark-of-the-binding-blessing", required: 4 },
      { materialId: "cloud-puff-berry", required: 20 },
      { materialId: "man-at-arms-metal-whistle", required: 12 },
    ],
  },
  // Ascension 4
  {
    characterId: "ifa",
    name: "Ascension 4 (Lv. 60 → 70)",
    description: "Fourth ascension materials for Ifa",
    category: "ascension",
    sortOrder: 4,
    materials: [
      { materialId: "vayuda-turquoise-chunk", required: 3 },
      { materialId: "mark-of-the-binding-blessing", required: 8 },
      { materialId: "cloud-puff-berry", required: 30 },
      { materialId: "man-at-arms-metal-whistle", required: 18 },
    ],
  },
  // Ascension 5
  {
    characterId: "ifa",
    name: "Ascension 5 (Lv. 70 → 80)",
    description: "Fifth ascension materials for Ifa",
    category: "ascension",
    sortOrder: 5,
    materials: [
      { materialId: "vayuda-turquoise-chunk", required: 6 },
      { materialId: "mark-of-the-binding-blessing", required: 12 },
      { materialId: "cloud-puff-berry", required: 45 },
      { materialId: "coronals-golden-whistle", required: 12 },
    ],
  },
  // Ascension 6
  {
    characterId: "ifa",
    name: "Ascension 6 (Lv. 80 → 90)",
    description: "Sixth ascension materials for Ifa",
    category: "ascension",
    sortOrder: 6,
    materials: [
      { materialId: "vayuda-turquoise-gemstone", required: 6 },
      { materialId: "mark-of-the-binding-blessing", required: 20 },
      { materialId: "cloud-puff-berry", required: 60 },
      { materialId: "coronals-golden-whistle", required: 24 },
    ],
  },
  // All Talents 1 → 6
  {
    characterId: "ifa",
    name: "All Talents Level 1 → 6",
    description: "Materials to level all three talents from 1 to 6",
    category: "talent",
    sortOrder: 1,
    materials: [
      { materialId: "teachings-of-contention", required: 9 },
      { materialId: "guide-to-contention", required: 63 },
      { materialId: "sentry-wooden-whistle", required: 18 },
      { materialId: "man-at-arms-metal-whistle", required: 66 },
    ],
  },
  // Single Talent 6 → 10
  {
    characterId: "ifa",
    name: "Single Talent Level 6 → 10",
    description: "Materials to max one talent from level 6 to 10",
    category: "talent",
    sortOrder: 2,
    materials: [
      { materialId: "guide-to-contention", required: 4 },
      { materialId: "philosophies-of-contention", required: 38 },
      { materialId: "man-at-arms-metal-whistle", required: 6 },
      { materialId: "coronals-golden-whistle", required: 22 },
      { materialId: "erosions-fading-candle", required: 6 },
      { materialId: "crown-of-insight", required: 1 },
    ],
  },
  // Triple Crown 6 → 10
  {
    characterId: "ifa",
    name: "Triple Crown (All Talents 6 → 10)",
    description: "Materials to max all three talents from level 6 to 10",
    category: "talent",
    sortOrder: 3,
    materials: [
      { materialId: "guide-to-contention", required: 12 },
      { materialId: "philosophies-of-contention", required: 114 },
      { materialId: "man-at-arms-metal-whistle", required: 18 },
      { materialId: "coronals-golden-whistle", required: 66 },
      { materialId: "erosions-fading-candle", required: 18 },
      { materialId: "crown-of-insight", required: 3 },
    ],
  },
];
