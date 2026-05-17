import type { SeedCharacter, SeedCharacterGoalTemplate } from "../types";

export const chasca: SeedCharacter = {
  id: "chasca",
  name: "Chasca",
  image: "https://enka.network/ui/UI_AvatarIcon_Chasca.png",
  rarity: 5,
  element: "Anemo",
  weaponType: "Bow",
  region: "Natlan",
};

export const chascaGoalTemplates: SeedCharacterGoalTemplate[] = [
  // Ascension 1
  {
    characterId: "chasca",
    name: "Ascension 1 (Lv. 20 → 40)",
    description: "First ascension materials for Chasca",
    category: "ascension",
    sortOrder: 1,
    materials: [
      { materialId: "vayuda-turquoise-sliver", required: 1 },
      { materialId: "wither-valentia-nut", required: 3 },
      { materialId: "juvenile-fang", required: 3 },
    ],
  },
  // Ascension 2
  {
    characterId: "chasca",
    name: "Ascension 2 (Lv. 40 → 50)",
    description: "Second ascension materials for Chasca",
    category: "ascension",
    sortOrder: 2,
    materials: [
      { materialId: "vayuda-turquoise-fragment", required: 3 },
      { materialId: "enigmatic-source-core", required: 2 },
      { materialId: "wither-valentia-nut", required: 10 },
      { materialId: "juvenile-fang", required: 15 },
    ],
  },
  // Ascension 3
  {
    characterId: "chasca",
    name: "Ascension 3 (Lv. 50 → 60)",
    description: "Third ascension materials for Chasca",
    category: "ascension",
    sortOrder: 3,
    materials: [
      { materialId: "vayuda-turquoise-fragment", required: 6 },
      { materialId: "enigmatic-source-core", required: 4 },
      { materialId: "wither-valentia-nut", required: 20 },
      { materialId: "seasoned-fang", required: 12 },
    ],
  },
  // Ascension 4
  {
    characterId: "chasca",
    name: "Ascension 4 (Lv. 60 → 70)",
    description: "Fourth ascension materials for Chasca",
    category: "ascension",
    sortOrder: 4,
    materials: [
      { materialId: "vayuda-turquoise-chunk", required: 3 },
      { materialId: "enigmatic-source-core", required: 8 },
      { materialId: "wither-valentia-nut", required: 30 },
      { materialId: "seasoned-fang", required: 18 },
    ],
  },
  // Ascension 5
  {
    characterId: "chasca",
    name: "Ascension 5 (Lv. 70 → 80)",
    description: "Fifth ascension materials for Chasca",
    category: "ascension",
    sortOrder: 5,
    materials: [
      { materialId: "vayuda-turquoise-chunk", required: 6 },
      { materialId: "enigmatic-source-core", required: 12 },
      { materialId: "wither-valentia-nut", required: 45 },
      { materialId: "tyrant-fang", required: 12 },
    ],
  },
  // Ascension 6
  {
    characterId: "chasca",
    name: "Ascension 6 (Lv. 80 → 90)",
    description: "Sixth ascension materials for Chasca",
    category: "ascension",
    sortOrder: 6,
    materials: [
      { materialId: "vayuda-turquoise-gemstone", required: 6 },
      { materialId: "enigmatic-source-core", required: 20 },
      { materialId: "wither-valentia-nut", required: 60 },
      { materialId: "tyrant-fang", required: 24 },
    ],
  },
  // All Talents 1 → 6
  {
    characterId: "chasca",
    name: "All Talents Level 1 → 6",
    description: "Materials to level all three talents from 1 to 6",
    category: "talent",
    sortOrder: 1,
    materials: [
      { materialId: "teachings-of-conflict", required: 9 },
      { materialId: "guide-to-conflict", required: 63 },
      { materialId: "juvenile-fang", required: 18 },
      { materialId: "seasoned-fang", required: 66 },
    ],
  },
  // Single Talent 6 → 10
  {
    characterId: "chasca",
    name: "Single Talent Level 6 → 10",
    description: "Materials to max one talent from level 6 to 10",
    category: "talent",
    sortOrder: 2,
    materials: [
      { materialId: "guide-to-conflict", required: 4 },
      { materialId: "philosophies-of-conflict", required: 38 },
      { materialId: "seasoned-fang", required: 6 },
      { materialId: "tyrant-fang", required: 22 },
      { materialId: "silken-feather", required: 6 },
      { materialId: "crown-of-insight", required: 1 },
    ],
  },
  // Triple Crown 6 → 10
  {
    characterId: "chasca",
    name: "Triple Crown (All Talents 6 → 10)",
    description: "Materials to max all three talents from level 6 to 10",
    category: "talent",
    sortOrder: 3,
    materials: [
      { materialId: "guide-to-conflict", required: 12 },
      { materialId: "philosophies-of-conflict", required: 114 },
      { materialId: "seasoned-fang", required: 18 },
      { materialId: "tyrant-fang", required: 66 },
      { materialId: "silken-feather", required: 18 },
      { materialId: "crown-of-insight", required: 3 },
    ],
  },
];