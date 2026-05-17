import type { SeedCharacter, SeedCharacterGoalTemplate } from "../types";

export const kachina: SeedCharacter = {
  id: "kachina",
  name: "Kachina",
  image: "https://enka.network/ui/UI_AvatarIcon_Kachina.png",
  rarity: 4,
  element: "Geo",
  weaponType: "Polearm",
  region: "Natlan",
};

export const kachinaGoalTemplates: SeedCharacterGoalTemplate[] = [
  // Ascension 1
  {
    characterId: "kachina",
    name: "Ascension 1 (Lv. 20 → 40)",
    description: "First ascension materials for Kachina",
    category: "ascension",
    sortOrder: 1,
    materials: [
      { materialId: "prithiva-topaz-sliver", required: 1 },
      { materialId: "quenepa-berry", required: 3 },
      { materialId: "sentrys-wooden-whistle", required: 3 },
    ],
  },
  // Ascension 2
  {
    characterId: "kachina",
    name: "Ascension 2 (Lv. 40 → 50)",
    description: "Second ascension materials for Kachina",
    category: "ascension",
    sortOrder: 2,
    materials: [
      { materialId: "prithiva-topaz-fragment", required: 3 },
      { materialId: "overripe-flamegranate", required: 2 },
      { materialId: "quenepa-berry", required: 10 },
      { materialId: "sentrys-wooden-whistle", required: 15 },
    ],
  },
  // Ascension 3
  {
    characterId: "kachina",
    name: "Ascension 3 (Lv. 50 → 60)",
    description: "Third ascension materials for Kachina",
    category: "ascension",
    sortOrder: 3,
    materials: [
      { materialId: "prithiva-topaz-fragment", required: 6 },
      { materialId: "overripe-flamegranate", required: 4 },
      { materialId: "quenepa-berry", required: 20 },
      { materialId: "warriors-metal-whistle", required: 12 },
    ],
  },
  // Ascension 4
  {
    characterId: "kachina",
    name: "Ascension 4 (Lv. 60 → 70)",
    description: "Fourth ascension materials for Kachina",
    category: "ascension",
    sortOrder: 4,
    materials: [
      { materialId: "prithiva-topaz-chunk", required: 3 },
      { materialId: "overripe-flamegranate", required: 8 },
      { materialId: "quenepa-berry", required: 30 },
      { materialId: "warriors-metal-whistle", required: 18 },
    ],
  },
  // Ascension 5
  {
    characterId: "kachina",
    name: "Ascension 5 (Lv. 70 → 80)",
    description: "Fifth ascension materials for Kachina",
    category: "ascension",
    sortOrder: 5,
    materials: [
      { materialId: "prithiva-topaz-chunk", required: 6 },
      { materialId: "overripe-flamegranate", required: 12 },
      { materialId: "quenepa-berry", required: 45 },
      { materialId: "coronals-golden-whistle", required: 12 },
    ],
  },
  // Ascension 6
  {
    characterId: "kachina",
    name: "Ascension 6 (Lv. 80 → 90)",
    description: "Sixth ascension materials for Kachina",
    category: "ascension",
    sortOrder: 6,
    materials: [
      { materialId: "prithiva-topaz-gemstone", required: 6 },
      { materialId: "overripe-flamegranate", required: 20 },
      { materialId: "quenepa-berry", required: 60 },
      { materialId: "coronals-golden-whistle", required: 24 },
    ],
  },
  // All Talents 1 → 6
  {
    characterId: "kachina",
    name: "All Talents Level 1 → 6",
    description: "Materials to level all three talents from 1 to 6",
    category: "talent",
    sortOrder: 1,
    materials: [
      { materialId: "teachings-of-conflict", required: 9 },
      { materialId: "guide-to-conflict", required: 63 },
      { materialId: "sentrys-wooden-whistle", required: 18 },
      { materialId: "warriors-metal-whistle", required: 66 },
    ],
  },
  // Single Talent 6 → 10
  {
    characterId: "kachina",
    name: "Single Talent Level 6 → 10",
    description: "Materials to max one talent from level 6 to 10",
    category: "talent",
    sortOrder: 2,
    materials: [
      { materialId: "guide-to-conflict", required: 4 },
      { materialId: "philosophies-of-conflict", required: 38 },
      { materialId: "warriors-metal-whistle", required: 6 },
      { materialId: "coronals-golden-whistle", required: 22 },
      { materialId: "fading-candle", required: 6 },
      { materialId: "crown-of-insight", required: 1 },
    ],
  },
  // Triple Crown 6 → 10
  {
    characterId: "kachina",
    name: "Triple Crown (All Talents 6 → 10)",
    description: "Materials to max all three talents from level 6 to 10",
    category: "talent",
    sortOrder: 3,
    materials: [
      { materialId: "guide-to-conflict", required: 12 },
      { materialId: "philosophies-of-conflict", required: 114 },
      { materialId: "warriors-metal-whistle", required: 18 },
      { materialId: "coronals-golden-whistle", required: 66 },
      { materialId: "fading-candle", required: 18 },
      { materialId: "crown-of-insight", required: 3 },
    ],
  },
];
