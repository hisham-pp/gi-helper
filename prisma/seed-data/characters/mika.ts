import type { SeedCharacter, SeedCharacterGoalTemplate } from "../types";

export const mika: SeedCharacter = {
  id: "mika",
  name: "Mika",
  image: "https://enka.network/ui/UI_AvatarIcon_Mika.png",
  rarity: 4,
  element: "Cryo",
  weaponType: "Polearm",
  region: "Mondstadt",
};

export const mikaGoalTemplates: SeedCharacterGoalTemplate[] = [
  // Ascension 1
  {
    characterId: "mika",
    name: "Ascension 1 (Lv. 20 → 40)",
    description: "First ascension materials for Mika",
    category: "ascension",
    sortOrder: 1,
    materials: [
      { materialId: "shivada-jade-sliver", required: 1 },
      { materialId: "wolfhook", required: 3 },
      { materialId: "recruits-insignia", required: 3 },
    ],
  },
  // Ascension 2
  {
    characterId: "mika",
    name: "Ascension 2 (Lv. 40 → 50)",
    description: "Second ascension materials for Mika",
    category: "ascension",
    sortOrder: 2,
    materials: [
      { materialId: "shivada-jade-fragment", required: 3 },
      { materialId: "pseudo-stamen", required: 2 },
      { materialId: "wolfhook", required: 10 },
      { materialId: "recruits-insignia", required: 15 },
    ],
  },
  // Ascension 3
  {
    characterId: "mika",
    name: "Ascension 3 (Lv. 50 → 60)",
    description: "Third ascension materials for Mika",
    category: "ascension",
    sortOrder: 3,
    materials: [
      { materialId: "shivada-jade-fragment", required: 6 },
      { materialId: "pseudo-stamen", required: 4 },
      { materialId: "wolfhook", required: 20 },
      { materialId: "sergeants-insignia", required: 12 },
    ],
  },
  // Ascension 4
  {
    characterId: "mika",
    name: "Ascension 4 (Lv. 60 → 70)",
    description: "Fourth ascension materials for Mika",
    category: "ascension",
    sortOrder: 4,
    materials: [
      { materialId: "shivada-jade-chunk", required: 3 },
      { materialId: "pseudo-stamen", required: 8 },
      { materialId: "wolfhook", required: 30 },
      { materialId: "sergeants-insignia", required: 18 },
    ],
  },
  // Ascension 5
  {
    characterId: "mika",
    name: "Ascension 5 (Lv. 70 → 80)",
    description: "Fifth ascension materials for Mika",
    category: "ascension",
    sortOrder: 5,
    materials: [
      { materialId: "shivada-jade-chunk", required: 6 },
      { materialId: "pseudo-stamen", required: 12 },
      { materialId: "wolfhook", required: 45 },
      { materialId: "lieutenants-insignia", required: 12 },
    ],
  },
  // Ascension 6
  {
    characterId: "mika",
    name: "Ascension 6 (Lv. 80 → 90)",
    description: "Sixth ascension materials for Mika",
    category: "ascension",
    sortOrder: 6,
    materials: [
      { materialId: "shivada-jade-gemstone", required: 6 },
      { materialId: "pseudo-stamen", required: 20 },
      { materialId: "wolfhook", required: 60 },
      { materialId: "lieutenants-insignia", required: 24 },
    ],
  },
  // All Talents 1 → 6
  {
    characterId: "mika",
    name: "All Talents Level 1 → 6",
    description: "Materials to level all three talents from 1 to 6",
    category: "talent",
    sortOrder: 1,
    materials: [
      { materialId: "teachings-of-ballad", required: 9 },
      { materialId: "guide-to-ballad", required: 63 },
      { materialId: "recruits-insignia", required: 18 },
      { materialId: "sergeants-insignia", required: 66 },
    ],
  },
  // Single Talent 6 → 10
  {
    characterId: "mika",
    name: "Single Talent Level 6 → 10",
    description: "Materials to max one talent from level 6 to 10",
    category: "talent",
    sortOrder: 2,
    materials: [
      { materialId: "guide-to-ballad", required: 4 },
      { materialId: "philosophies-of-ballad", required: 38 },
      { materialId: "sergeants-insignia", required: 6 },
      { materialId: "lieutenants-insignia", required: 22 },
      { materialId: "mirror-of-alocher", required: 6 },
      { materialId: "crown-of-insight", required: 1 },
    ],
  },
  // Triple Crown 6 → 10
  {
    characterId: "mika",
    name: "Triple Crown (All Talents 6 → 10)",
    description: "Materials to max all three talents from level 6 to 10",
    category: "talent",
    sortOrder: 3,
    materials: [
      { materialId: "guide-to-ballad", required: 12 },
      { materialId: "philosophies-of-ballad", required: 114 },
      { materialId: "sergeants-insignia", required: 18 },
      { materialId: "lieutenants-insignia", required: 66 },
      { materialId: "mirror-of-alocher", required: 18 },
      { materialId: "crown-of-insight", required: 3 },
    ],
  },
];