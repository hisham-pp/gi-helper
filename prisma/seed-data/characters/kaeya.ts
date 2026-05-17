import type { SeedCharacter, SeedCharacterGoalTemplate } from "../types";

export const kaeya: SeedCharacter = {
  id: "kaeya",
  name: "Kaeya",
  image: "https://enka.network/ui/UI_AvatarIcon_Kaeya.png",
  rarity: 4,
  element: "Cryo",
  weaponType: "Sword",
  region: "Mondstadt",
};

export const kaeyaGoalTemplates: SeedCharacterGoalTemplate[] = [
  // Ascension 1
  {
    characterId: "kaeya",
    name: "Ascension 1 (Lv. 20 → 40)",
    description: "First ascension materials for Kaeya",
    category: "ascension",
    sortOrder: 1,
    materials: [
      { materialId: "shivada-jade-sliver", required: 1 },
      { materialId: "calla-lily", required: 3 },
      { materialId: "treasure-hoarder-insignia", required: 3 },
    ],
  },
  // Ascension 2
  {
    characterId: "kaeya",
    name: "Ascension 2 (Lv. 40 → 50)",
    description: "Second ascension materials for Kaeya",
    category: "ascension",
    sortOrder: 2,
    materials: [
      { materialId: "shivada-jade-fragment", required: 3 },
      { materialId: "hoarfrost-core", required: 2 },
      { materialId: "calla-lily", required: 10 },
      { materialId: "treasure-hoarder-insignia", required: 15 },
    ],
  },
  // Ascension 3
  {
    characterId: "kaeya",
    name: "Ascension 3 (Lv. 50 → 60)",
    description: "Third ascension materials for Kaeya",
    category: "ascension",
    sortOrder: 3,
    materials: [
      { materialId: "shivada-jade-fragment", required: 6 },
      { materialId: "hoarfrost-core", required: 4 },
      { materialId: "calla-lily", required: 20 },
      { materialId: "silver-raven-insignia", required: 12 },
    ],
  },
  // Ascension 4
  {
    characterId: "kaeya",
    name: "Ascension 4 (Lv. 60 → 70)",
    description: "Fourth ascension materials for Kaeya",
    category: "ascension",
    sortOrder: 4,
    materials: [
      { materialId: "shivada-jade-chunk", required: 3 },
      { materialId: "hoarfrost-core", required: 8 },
      { materialId: "calla-lily", required: 30 },
      { materialId: "silver-raven-insignia", required: 18 },
    ],
  },
  // Ascension 5
  {
    characterId: "kaeya",
    name: "Ascension 5 (Lv. 70 → 80)",
    description: "Fifth ascension materials for Kaeya",
    category: "ascension",
    sortOrder: 5,
    materials: [
      { materialId: "shivada-jade-chunk", required: 6 },
      { materialId: "hoarfrost-core", required: 12 },
      { materialId: "calla-lily", required: 45 },
      { materialId: "golden-raven-insignia", required: 12 },
    ],
  },
  // Ascension 6
  {
    characterId: "kaeya",
    name: "Ascension 6 (Lv. 80 → 90)",
    description: "Sixth ascension materials for Kaeya",
    category: "ascension",
    sortOrder: 6,
    materials: [
      { materialId: "shivada-jade-gemstone", required: 6 },
      { materialId: "hoarfrost-core", required: 20 },
      { materialId: "calla-lily", required: 60 },
      { materialId: "golden-raven-insignia", required: 24 },
    ],
  },
  // All Talents 1 → 6
  {
    characterId: "kaeya",
    name: "All Talents Level 1 → 6",
    description: "Materials to level all three talents from 1 to 6",
    category: "talent",
    sortOrder: 1,
    materials: [
      { materialId: "teachings-of-ballad", required: 9 },
      { materialId: "guide-to-ballad", required: 63 },
      { materialId: "treasure-hoarder-insignia", required: 18 },
      { materialId: "silver-raven-insignia", required: 66 },
    ],
  },
  // Single Talent 6 → 10
  {
    characterId: "kaeya",
    name: "Single Talent Level 6 → 10",
    description: "Materials to max one talent from level 6 to 10",
    category: "talent",
    sortOrder: 2,
    materials: [
      { materialId: "guide-to-ballad", required: 4 },
      { materialId: "philosophies-of-ballad", required: 38 },
      { materialId: "silver-raven-insignia", required: 6 },
      { materialId: "golden-raven-insignia", required: 22 },
      { materialId: "spirit-locket-of-boreas", required: 6 },
      { materialId: "crown-of-insight", required: 1 },
    ],
  },
  // Triple Crown 6 → 10
  {
    characterId: "kaeya",
    name: "Triple Crown (All Talents 6 → 10)",
    description: "Materials to max all three talents from level 6 to 10",
    category: "talent",
    sortOrder: 3,
    materials: [
      { materialId: "guide-to-ballad", required: 12 },
      { materialId: "philosophies-of-ballad", required: 114 },
      { materialId: "silver-raven-insignia", required: 18 },
      { materialId: "golden-raven-insignia", required: 66 },
      { materialId: "spirit-locket-of-boreas", required: 18 },
      { materialId: "crown-of-insight", required: 3 },
    ],
  },
];
