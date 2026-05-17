import type { SeedCharacter, SeedCharacterGoalTemplate } from "../types";

export const kirara: SeedCharacter = {
  id: "kirara",
  name: "Kirara",
  image: "https://enka.network/ui/UI_AvatarIcon_Kirara.png",
  rarity: 4,
  element: "Dendro",
  weaponType: "Sword",
  region: "Inazuma",
};

export const kiraraGoalTemplates: SeedCharacterGoalTemplate[] = [
  // Ascension 1
  {
    characterId: "kirara",
    name: "Ascension 1 (Lv. 20 → 40)",
    description: "First ascension materials for Kirara",
    category: "ascension",
    sortOrder: 1,
    materials: [
      { materialId: "nagadus-emerald-sliver", required: 1 },
      { materialId: "amakumo-fruit", required: 3 },
      { materialId: "spectral-husk", required: 3 },
    ],
  },
  // Ascension 2
  {
    characterId: "kirara",
    name: "Ascension 2 (Lv. 40 → 50)",
    description: "Second ascension materials for Kirara",
    category: "ascension",
    sortOrder: 2,
    materials: [
      { materialId: "nagadus-emerald-fragment", required: 3 },
      { materialId: "evergloom-ring", required: 2 },
      { materialId: "amakumo-fruit", required: 10 },
      { materialId: "spectral-husk", required: 15 },
    ],
  },
  // Ascension 3
  {
    characterId: "kirara",
    name: "Ascension 3 (Lv. 50 → 60)",
    description: "Third ascension materials for Kirara",
    category: "ascension",
    sortOrder: 3,
    materials: [
      { materialId: "nagadus-emerald-fragment", required: 6 },
      { materialId: "evergloom-ring", required: 4 },
      { materialId: "amakumo-fruit", required: 20 },
      { materialId: "spectral-heart", required: 12 },
    ],
  },
  // Ascension 4
  {
    characterId: "kirara",
    name: "Ascension 4 (Lv. 60 → 70)",
    description: "Fourth ascension materials for Kirara",
    category: "ascension",
    sortOrder: 4,
    materials: [
      { materialId: "nagadus-emerald-chunk", required: 3 },
      { materialId: "evergloom-ring", required: 8 },
      { materialId: "amakumo-fruit", required: 30 },
      { materialId: "spectral-heart", required: 18 },
    ],
  },
  // Ascension 5
  {
    characterId: "kirara",
    name: "Ascension 5 (Lv. 70 → 80)",
    description: "Fifth ascension materials for Kirara",
    category: "ascension",
    sortOrder: 5,
    materials: [
      { materialId: "nagadus-emerald-chunk", required: 6 },
      { materialId: "evergloom-ring", required: 12 },
      { materialId: "amakumo-fruit", required: 45 },
      { materialId: "spectral-nucleus", required: 12 },
    ],
  },
  // Ascension 6
  {
    characterId: "kirara",
    name: "Ascension 6 (Lv. 80 → 90)",
    description: "Sixth ascension materials for Kirara",
    category: "ascension",
    sortOrder: 6,
    materials: [
      { materialId: "nagadus-emerald-gemstone", required: 6 },
      { materialId: "evergloom-ring", required: 20 },
      { materialId: "amakumo-fruit", required: 60 },
      { materialId: "spectral-nucleus", required: 24 },
    ],
  },
  // All Talents 1 → 6
  {
    characterId: "kirara",
    name: "All Talents Level 1 → 6",
    description: "Materials to level all three talents from 1 to 6",
    category: "talent",
    sortOrder: 1,
    materials: [
      { materialId: "teachings-of-transience", required: 9 },
      { materialId: "guide-to-transience", required: 63 },
      { materialId: "spectral-husk", required: 18 },
      { materialId: "spectral-heart", required: 66 },
    ],
  },
  // Single Talent 6 → 10
  {
    characterId: "kirara",
    name: "Single Talent Level 6 → 10",
    description: "Materials to max one talent from level 6 to 10",
    category: "talent",
    sortOrder: 2,
    materials: [
      { materialId: "guide-to-transience", required: 4 },
      { materialId: "philosophies-of-transience", required: 38 },
      { materialId: "spectral-heart", required: 6 },
      { materialId: "spectral-nucleus", required: 22 },
      { materialId: "everamber", required: 6 },
      { materialId: "crown-of-insight", required: 1 },
    ],
  },
  // Triple Crown 6 → 10
  {
    characterId: "kirara",
    name: "Triple Crown (All Talents 6 → 10)",
    description: "Materials to max all three talents from level 6 to 10",
    category: "talent",
    sortOrder: 3,
    materials: [
      { materialId: "guide-to-transience", required: 12 },
      { materialId: "philosophies-of-transience", required: 114 },
      { materialId: "spectral-heart", required: 18 },
      { materialId: "spectral-nucleus", required: 66 },
      { materialId: "everamber", required: 18 },
      { materialId: "crown-of-insight", required: 3 },
    ],
  },
];