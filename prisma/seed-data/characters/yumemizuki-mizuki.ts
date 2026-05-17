import type { SeedCharacter, SeedCharacterGoalTemplate } from "../types";

export const yumemizukiMizuki: SeedCharacter = {
  id: "yumemizuki-mizuki",
  name: "Yumemizuki Mizuki",
  image: "https://enka.network/ui/UI_AvatarIcon_YumemizukiMizuki.png",
  rarity: 5,
  element: "Anemo",
  weaponType: "Catalyst",
  region: "Inazuma",
};

export const yumemizukiMizukiGoalTemplates: SeedCharacterGoalTemplate[] = [
  // Ascension 1
  {
    characterId: "yumemizuki-mizuki",
    name: "Ascension 1 (Lv. 20 → 40)",
    description: "First ascension materials for Yumemizuki Mizuki",
    category: "ascension",
    sortOrder: 1,
    materials: [
      { materialId: "vayuda-turquoise-sliver", required: 1 },
      { materialId: "sea-ganoderma", required: 3 },
      { materialId: "old-handguard", required: 3 },
    ],
  },

  // Ascension 2
  {
    characterId: "yumemizuki-mizuki",
    name: "Ascension 2 (Lv. 40 → 50)",
    description: "Second ascension materials for Yumemizuki Mizuki",
    category: "ascension",
    sortOrder: 2,
    materials: [
      { materialId: "vayuda-turquoise-fragment", required: 3 },
      { materialId: "talisman-of-the-enigmatic-land", required: 2 },
      { materialId: "sea-ganoderma", required: 10 },
      { materialId: "old-handguard", required: 15 },
    ],
  },

  // Ascension 3
  {
    characterId: "yumemizuki-mizuki",
    name: "Ascension 3 (Lv. 50 → 60)",
    description: "Third ascension materials for Yumemizuki Mizuki",
    category: "ascension",
    sortOrder: 3,
    materials: [
      { materialId: "vayuda-turquoise-fragment", required: 6 },
      { materialId: "talisman-of-the-enigmatic-land", required: 4 },
      { materialId: "sea-ganoderma", required: 20 },
      { materialId: "kageuchi-handguard", required: 12 },
    ],
  },

  // Ascension 4
  {
    characterId: "yumemizuki-mizuki",
    name: "Ascension 4 (Lv. 60 → 70)",
    description: "Fourth ascension materials for Yumemizuki Mizuki",
    category: "ascension",
    sortOrder: 4,
    materials: [
      { materialId: "vayuda-turquoise-chunk", required: 3 },
      { materialId: "talisman-of-the-enigmatic-land", required: 8 },
      { materialId: "sea-ganoderma", required: 30 },
      { materialId: "kageuchi-handguard", required: 18 },
    ],
  },

  // Ascension 5
  {
    characterId: "yumemizuki-mizuki",
    name: "Ascension 5 (Lv. 70 → 80)",
    description: "Fifth ascension materials for Yumemizuki Mizuki",
    category: "ascension",
    sortOrder: 5,
    materials: [
      { materialId: "vayuda-turquoise-chunk", required: 6 },
      { materialId: "talisman-of-the-enigmatic-land", required: 12 },
      { materialId: "sea-ganoderma", required: 45 },
      { materialId: "famed-handguard", required: 12 },
    ],
  },

  // Ascension 6
  {
    characterId: "yumemizuki-mizuki",
    name: "Ascension 6 (Lv. 80 → 90)",
    description: "Sixth ascension materials for Yumemizuki Mizuki",
    category: "ascension",
    sortOrder: 6,
    materials: [
      { materialId: "vayuda-turquoise-gemstone", required: 6 },
      { materialId: "talisman-of-the-enigmatic-land", required: 20 },
      { materialId: "sea-ganoderma", required: 60 },
      { materialId: "famed-handguard", required: 24 },
    ],
  },

  // All Talents 1 → 6
  {
    characterId: "yumemizuki-mizuki",
    name: "All Talents Level 1 → 6",
    description: "Materials to level all three talents from 1 to 6",
    category: "talent",
    sortOrder: 1,
    materials: [
      { materialId: "teachings-of-transience", required: 9 },
      { materialId: "guide-to-transience", required: 63 },
      { materialId: "old-handguard", required: 18 },
      { materialId: "kageuchi-handguard", required: 66 },
    ],
  },

  // Single Talent 6 → 10
  {
    characterId: "yumemizuki-mizuki",
    name: "Single Talent Level 6 → 10",
    description: "Materials to max one talent from level 6 to 10",
    category: "talent",
    sortOrder: 2,
    materials: [
      { materialId: "guide-to-transience", required: 4 },
      { materialId: "philosophies-of-transience", required: 38 },
      { materialId: "kageuchi-handguard", required: 6 },
      { materialId: "famed-handguard", required: 22 },
      { materialId: "mirror-of-mushin", required: 6 },
      { materialId: "crown-of-insight", required: 1 },
    ],
  },

  // Triple Crown 6 → 10
  {
    characterId: "yumemizuki-mizuki",
    name: "Triple Crown (All Talents 6 → 10)",
    description: "Materials to max all three talents from level 6 to 10",
    category: "talent",
    sortOrder: 3,
    materials: [
      { materialId: "guide-to-transience", required: 12 },
      { materialId: "philosophies-of-transience", required: 114 },
      { materialId: "kageuchi-handguard", required: 18 },
      { materialId: "famed-handguard", required: 66 },
      { materialId: "mirror-of-mushin", required: 18 },
      { materialId: "crown-of-insight", required: 3 },
    ],
  },
];
