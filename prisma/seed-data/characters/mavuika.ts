import type { SeedCharacter, SeedCharacterGoalTemplate } from "../types";

export const mavuika: SeedCharacter = {
  id: "mavuika",
  name: "Mavuika",
  image: "https://enka.network/ui/UI_AvatarIcon_Mavuika.png",
  rarity: 5,
  element: "Pyro",
  weaponType: "Claymore",
  region: "Natlan",
};

export const mavuikaGoalTemplates: SeedCharacterGoalTemplate[] = [
  // Ascension 1
  {
    characterId: "mavuika",
    name: "Ascension 1 (Lv. 20 → 40)",
    description: "First ascension materials for Mavuika",
    category: "ascension",
    sortOrder: 1,
    materials: [
      { materialId: "agnidus-agate-sliver", required: 1 },
      { materialId: "withering-purpurbloom", required: 3 },
      { materialId: "sentrys-wooden-whistle", required: 3 },
    ],
  },

  // Ascension 2
  {
    characterId: "mavuika",
    name: "Ascension 2 (Lv. 40 → 50)",
    description: "Second ascension materials for Mavuika",
    category: "ascension",
    sortOrder: 2,
    materials: [
      { materialId: "agnidus-agate-fragment", required: 3 },
      { materialId: "gold-inscribed-secret-source-core", required: 2 },
      { materialId: "withering-purpurbloom", required: 10 },
      { materialId: "sentrys-wooden-whistle", required: 15 },
    ],
  },

  // Ascension 3
  {
    characterId: "mavuika",
    name: "Ascension 3 (Lv. 50 → 60)",
    description: "Third ascension materials for Mavuika",
    category: "ascension",
    sortOrder: 3,
    materials: [
      { materialId: "agnidus-agate-fragment", required: 6 },
      { materialId: "gold-inscribed-secret-source-core", required: 4 },
      { materialId: "withering-purpurbloom", required: 20 },
      { materialId: "warriors-metal-whistle", required: 12 },
    ],
  },

  // Ascension 4
  {
    characterId: "mavuika",
    name: "Ascension 4 (Lv. 60 → 70)",
    description: "Fourth ascension materials for Mavuika",
    category: "ascension",
    sortOrder: 4,
    materials: [
      { materialId: "agnidus-agate-chunk", required: 3 },
      { materialId: "gold-inscribed-secret-source-core", required: 8 },
      { materialId: "withering-purpurbloom", required: 30 },
      { materialId: "warriors-metal-whistle", required: 18 },
    ],
  },

  // Ascension 5
  {
    characterId: "mavuika",
    name: "Ascension 5 (Lv. 70 → 80)",
    description: "Fifth ascension materials for Mavuika",
    category: "ascension",
    sortOrder: 5,
    materials: [
      { materialId: "agnidus-agate-chunk", required: 6 },
      { materialId: "gold-inscribed-secret-source-core", required: 12 },
      { materialId: "withering-purpurbloom", required: 45 },
      { materialId: "saurian-crowned-warriors-whistle", required: 12 },
    ],
  },

  // Ascension 6
  {
    characterId: "mavuika",
    name: "Ascension 6 (Lv. 80 → 90)",
    description: "Sixth ascension materials for Mavuika",
    category: "ascension",
    sortOrder: 6,
    materials: [
      { materialId: "agnidus-agate-gemstone", required: 6 },
      { materialId: "gold-inscribed-secret-source-core", required: 20 },
      { materialId: "withering-purpurbloom", required: 60 },
      { materialId: "saurian-crowned-warriors-whistle", required: 24 },
    ],
  },

  // All Talents 1 → 6
  {
    characterId: "mavuika",
    name: "All Talents Level 1 → 6",
    description: "Materials to level all three talents from 1 to 6",
    category: "talent",
    sortOrder: 1,
    materials: [
      { materialId: "teachings-of-contention", required: 9 },
      { materialId: "guide-to-contention", required: 63 },
      { materialId: "sentrys-wooden-whistle", required: 18 },
      { materialId: "warriors-metal-whistle", required: 66 },
    ],
  },

  // Single Talent 6 → 10
  {
    characterId: "mavuika",
    name: "Single Talent Level 6 → 10",
    description: "Materials to max one talent from level 6 to 10",
    category: "talent",
    sortOrder: 2,
    materials: [
      { materialId: "guide-to-contention", required: 4 },
      { materialId: "philosophies-of-contention", required: 38 },
      { materialId: "warriors-metal-whistle", required: 6 },
      { materialId: "saurian-crowned-warriors-whistle", required: 22 },
      { materialId: "the-knights-watch", required: 6 },
      { materialId: "crown-of-insight", required: 1 },
    ],
  },

  // Triple Crown 6 → 10
  {
    characterId: "mavuika",
    name: "Triple Crown (All Talents 6 → 10)",
    description: "Materials to max all three talents from level 6 to 10",
    category: "talent",
    sortOrder: 3,
    materials: [
      { materialId: "guide-to-contention", required: 12 },
      { materialId: "philosophies-of-contention", required: 114 },
      { materialId: "warriors-metal-whistle", required: 18 },
      { materialId: "saurian-crowned-warriors-whistle", required: 66 },
      { materialId: "the-knights-watch", required: 18 },
      { materialId: "crown-of-insight", required: 3 },
    ],
  },
];