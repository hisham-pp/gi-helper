import type { SeedCharacter, SeedCharacterGoalTemplate } from "../types";

export const arlecchino: SeedCharacter = {
  id: "arlecchino",
  name: "Arlecchino",
  image: "https://enka.network/ui/UI_AvatarIcon_Arlecchino.png",
  rarity: 5,
  element: "Pyro",
  weaponType: "Polearm",
  region: "Fontaine",
};

export const arlecchinoGoalTemplates: SeedCharacterGoalTemplate[] = [
  // Ascension 1
  {
    characterId: "arlecchino",
    name: "Ascension 1 (Lv. 20 → 40)",
    description: "First ascension materials for Arlecchino",
    category: "ascension",
    sortOrder: 1,
    materials: [
      { materialId: "agnidus-agate-sliver", required: 1 },
      { materialId: "rainbow-rose", required: 3 },
      { materialId: "recruit-insignia", required: 3 },
    ],
  },
  // Ascension 2
  {
    characterId: "arlecchino",
    name: "Ascension 2 (Lv. 40 → 50)",
    description: "Second ascension materials for Arlecchino",
    category: "ascension",
    sortOrder: 2,
    materials: [
      { materialId: "agnidus-agate-fragment", required: 3 },
      { materialId: "fragment-of-an-golden-melody", required: 2 },
      { materialId: "rainbow-rose", required: 10 },
      { materialId: "recruit-insignia", required: 15 },
    ],
  },
  // Ascension 3
  {
    characterId: "arlecchino",
    name: "Ascension 3 (Lv. 50 → 60)",
    description: "Third ascension materials for Arlecchino",
    category: "ascension",
    sortOrder: 3,
    materials: [
      { materialId: "agnidus-agate-fragment", required: 6 },
      { materialId: "fragment-of-an-golden-melody", required: 4 },
      { materialId: "rainbow-rose", required: 20 },
      { materialId: "sergeant-insignia", required: 12 },
    ],
  },
  // Ascension 4
  {
    characterId: "arlecchino",
    name: "Ascension 4 (Lv. 60 → 70)",
    description: "Fourth ascension materials for Arlecchino",
    category: "ascension",
    sortOrder: 4,
    materials: [
      { materialId: "agnidus-agate-chunk", required: 3 },
      { materialId: "fragment-of-an-golden-melody", required: 8 },
      { materialId: "rainbow-rose", required: 30 },
      { materialId: "sergeant-insignia", required: 18 },
    ],
  },
  // Ascension 5
  {
    characterId: "arlecchino",
    name: "Ascension 5 (Lv. 70 → 80)",
    description: "Fifth ascension materials for Arlecchino",
    category: "ascension",
    sortOrder: 5,
    materials: [
      { materialId: "agnidus-agate-chunk", required: 6 },
      { materialId: "fragment-of-an-golden-melody", required: 12 },
      { materialId: "rainbow-rose", required: 45 },
      { materialId: "lieutenant-insignia", required: 12 },
    ],
  },
  // Ascension 6
  {
    characterId: "arlecchino",
    name: "Ascension 6 (Lv. 80 → 90)",
    description: "Sixth ascension materials for Arlecchino",
    category: "ascension",
    sortOrder: 6,
    materials: [
      { materialId: "agnidus-agate-gemstone", required: 6 },
      { materialId: "fragment-of-an-golden-melody", required: 20 },
      { materialId: "rainbow-rose", required: 60 },
      { materialId: "lieutenant-insignia", required: 24 },
    ],
  },
  // All Talents 1 → 6
  {
    characterId: "arlecchino",
    name: "All Talents Level 1 → 6",
    description: "Materials to level all three talents from 1 to 6",
    category: "talent",
    sortOrder: 1,
    materials: [
      { materialId: "teachings-of-order", required: 9 },
      { materialId: "guide-to-order", required: 63 },
      { materialId: "recruit-insignia", required: 18 },
      { materialId: "sergeant-insignia", required: 66 },
    ],
  },
  // Single Talent 6 → 10
  {
    characterId: "arlecchino",
    name: "Single Talent Level 6 → 10",
    description: "Materials to max one talent from level 6 to 10",
    category: "talent",
    sortOrder: 2,
    materials: [
      { materialId: "guide-to-order", required: 4 },
      { materialId: "philosophies-of-order", required: 38 },
      { materialId: "sergeant-insignia", required: 6 },
      { materialId: "lieutenant-insignia", required: 22 },
      { materialId: "fading-candle", required: 6 },
      { materialId: "crown-of-insight", required: 1 },
    ],
  },
  // Triple Crown 6 → 10
  {
    characterId: "arlecchino",
    name: "Triple Crown (All Talents 6 → 10)",
    description: "Materials to max all three talents from level 6 to 10",
    category: "talent",
    sortOrder: 3,
    materials: [
      { materialId: "guide-to-order", required: 12 },
      { materialId: "philosophies-of-order", required: 114 },
      { materialId: "sergeant-insignia", required: 18 },
      { materialId: "lieutenant-insignia", required: 66 },
      { materialId: "fading-candle", required: 18 },
      { materialId: "crown-of-insight", required: 3 },
    ],
  },
];