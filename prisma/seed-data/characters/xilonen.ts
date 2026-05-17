import type { SeedCharacter, SeedCharacterGoalTemplate } from "../types";

export const xilonen: SeedCharacter = {
  id: "xilonen",
  name: "Xilonen",
  image: "https://enka.network/ui/UI_AvatarIcon_Xilonen.png",
  rarity: 5,
  element: "Geo",
  weaponType: "Sword",
  region: "Natlan",
};

export const xilonenGoalTemplates: SeedCharacterGoalTemplate[] = [
  // Ascension 1
  {
    characterId: "xilonen",
    name: "Ascension 1 (Lv. 20 → 40)",
    description: "First ascension materials for Xilonen",
    category: "ascension",
    sortOrder: 1,
    materials: [
      { materialId: "prithiva-topaz-sliver", required: 1 },
      { materialId: "brilliant-chrysanthemum", required: 3 },
      { materialId: "sentrys-wooden-whistle", required: 3 },
    ],
  },
  // Ascension 2
  {
    characterId: "xilonen",
    name: "Ascension 2 (Lv. 40 → 50)",
    description: "Second ascension materials for Xilonen",
    category: "ascension",
    sortOrder: 2,
    materials: [
      { materialId: "prithiva-topaz-fragment", required: 3 },
      { materialId: "gold-inscribed-secret-source-core", required: 2 },
      { materialId: "brilliant-chrysanthemum", required: 10 },
      { materialId: "sentrys-wooden-whistle", required: 15 },
    ],
  },
  // Ascension 3
  {
    characterId: "xilonen",
    name: "Ascension 3 (Lv. 50 → 60)",
    description: "Third ascension materials for Xilonen",
    category: "ascension",
    sortOrder: 3,
    materials: [
      { materialId: "prithiva-topaz-fragment", required: 6 },
      { materialId: "gold-inscribed-secret-source-core", required: 4 },
      { materialId: "brilliant-chrysanthemum", required: 20 },
      { materialId: "warriors-metal-whistle", required: 12 },
    ],
  },
  // Ascension 4
  {
    characterId: "xilonen",
    name: "Ascension 4 (Lv. 60 → 70)",
    description: "Fourth ascension materials for Xilonen",
    category: "ascension",
    sortOrder: 4,
    materials: [
      { materialId: "prithiva-topaz-chunk", required: 3 },
      { materialId: "gold-inscribed-secret-source-core", required: 8 },
      { materialId: "brilliant-chrysanthemum", required: 30 },
      { materialId: "warriors-metal-whistle", required: 18 },
    ],
  },
  // Ascension 5
  {
    characterId: "xilonen",
    name: "Ascension 5 (Lv. 70 → 80)",
    description: "Fifth ascension materials for Xilonen",
    category: "ascension",
    sortOrder: 5,
    materials: [
      { materialId: "prithiva-topaz-chunk", required: 6 },
      { materialId: "gold-inscribed-secret-source-core", required: 12 },
      { materialId: "brilliant-chrysanthemum", required: 45 },
      { materialId: "saurian-crowned-warriors-golden-whistle", required: 12 },
    ],
  },
  // Ascension 6
  {
    characterId: "xilonen",
    name: "Ascension 6 (Lv. 80 → 90)",
    description: "Sixth ascension materials for Xilonen",
    category: "ascension",
    sortOrder: 6,
    materials: [
      { materialId: "prithiva-topaz-gemstone", required: 6 },
      { materialId: "gold-inscribed-secret-source-core", required: 20 },
      { materialId: "brilliant-chrysanthemum", required: 60 },
      { materialId: "saurian-crowned-warriors-golden-whistle", required: 24 },
    ],
  },
  // All Talents 1 → 6
  {
    characterId: "xilonen",
    name: "All Talents Level 1 → 6",
    description: "Materials to level all three talents from 1 to 6",
    category: "talent",
    sortOrder: 1,
    materials: [
      { materialId: "teachings-of-kindling", required: 9 },
      { materialId: "guide-to-kindling", required: 63 },
      { materialId: "sentrys-wooden-whistle", required: 18 },
      { materialId: "warriors-metal-whistle", required: 66 },
    ],
  },
  // Single Talent 6 → 10
  {
    characterId: "xilonen",
    name: "Single Talent Level 6 → 10",
    description: "Materials to max one talent from level 6 to 10",
    category: "talent",
    sortOrder: 2,
    materials: [
      { materialId: "guide-to-kindling", required: 4 },
      { materialId: "philosophies-of-kindling", required: 38 },
      { materialId: "warriors-metal-whistle", required: 6 },
      { materialId: "saurian-crowned-warriors-golden-whistle", required: 22 },
      { materialId: "mirror-of-mushin", required: 6 },
      { materialId: "crown-of-insight", required: 1 },
    ],
  },
  // Triple Crown 6 → 10
  {
    characterId: "xilonen",
    name: "Triple Crown (All Talents 6 → 10)",
    description: "Materials to max all three talents from level 6 to 10",
    category: "talent",
    sortOrder: 3,
    materials: [
      { materialId: "guide-to-kindling", required: 12 },
      { materialId: "philosophies-of-kindling", required: 114 },
      { materialId: "warriors-metal-whistle", required: 18 },
      { materialId: "saurian-crowned-warriors-golden-whistle", required: 66 },
      { materialId: "mirror-of-mushin", required: 18 },
      { materialId: "crown-of-insight", required: 3 },
    ],
  },
];