import type { SeedCharacter, SeedCharacterGoalTemplate } from "../types";

export const furina: SeedCharacter = {
  id: "furina",
  name: "Furina",
  image: "https://enka.network/ui/UI_AvatarIcon_Furina.png",
  rarity: 5,
  element: "Hydro",
  weaponType: "Sword",
  region: "Fontaine",
};

export const furinaGoalTemplates: SeedCharacterGoalTemplate[] = [
  // Ascension 1
  {
    characterId: "furina",
    name: "Ascension 1 (Lv. 20 → 40)",
    description: "First ascension materials for Furina",
    category: "ascension",
    sortOrder: 1,
    materials: [
      { materialId: "varunada-lazurite-sliver", required: 1 },
      { materialId: "lakelight-lily", required: 3 },
      { materialId: "whopperflower-nectar", required: 3 },
    ],
  },
  // Ascension 2
  {
    characterId: "furina",
    name: "Ascension 2 (Lv. 40 → 50)",
    description: "Second ascension materials for Furina",
    category: "ascension",
    sortOrder: 2,
    materials: [
      { materialId: "varunada-lazurite-fragment", required: 3 },
      { materialId: "water-splitting-feather", required: 2 },
      { materialId: "lakelight-lily", required: 10 },
      { materialId: "whopperflower-nectar", required: 15 },
    ],
  },
  // Ascension 3
  {
    characterId: "furina",
    name: "Ascension 3 (Lv. 50 → 60)",
    description: "Third ascension materials for Furina",
    category: "ascension",
    sortOrder: 3,
    materials: [
      { materialId: "varunada-lazurite-fragment", required: 6 },
      { materialId: "water-splitting-feather", required: 4 },
      { materialId: "lakelight-lily", required: 20 },
      { materialId: "shimmering-nectar", required: 12 },
    ],
  },
  // Ascension 4
  {
    characterId: "furina",
    name: "Ascension 4 (Lv. 60 → 70)",
    description: "Fourth ascension materials for Furina",
    category: "ascension",
    sortOrder: 4,
    materials: [
      { materialId: "varunada-lazurite-chunk", required: 3 },
      { materialId: "water-splitting-feather", required: 8 },
      { materialId: "lakelight-lily", required: 30 },
      { materialId: "shimmering-nectar", required: 18 },
    ],
  },
  // Ascension 5
  {
    characterId: "furina",
    name: "Ascension 5 (Lv. 70 → 80)",
    description: "Fifth ascension materials for Furina",
    category: "ascension",
    sortOrder: 5,
    materials: [
      { materialId: "varunada-lazurite-chunk", required: 6 },
      { materialId: "water-splitting-feather", required: 12 },
      { materialId: "lakelight-lily", required: 45 },
      { materialId: "energy-nectar", required: 12 },
    ],
  },
  // Ascension 6
  {
    characterId: "furina",
    name: "Ascension 6 (Lv. 80 → 90)",
    description: "Sixth ascension materials for Furina",
    category: "ascension",
    sortOrder: 6,
    materials: [
      { materialId: "varunada-lazurite-gemstone", required: 6 },
      { materialId: "water-splitting-feather", required: 20 },
      { materialId: "lakelight-lily", required: 60 },
      { materialId: "energy-nectar", required: 24 },
    ],
  },
  // All Talents 1 → 6
  {
    characterId: "furina",
    name: "All Talents Level 1 → 6",
    description: "Materials to level all three talents from 1 to 6",
    category: "talent",
    sortOrder: 1,
    materials: [
      { materialId: "teachings-of-justice", required: 9 },
      { materialId: "guide-to-justice", required: 63 },
      { materialId: "whopperflower-nectar", required: 18 },
      { materialId: "shimmering-nectar", required: 66 },
    ],
  },
  // Single Talent 6 → 10
  {
    characterId: "furina",
    name: "Single Talent Level 6 → 10",
    description: "Materials to max one talent from level 6 to 10",
    category: "talent",
    sortOrder: 2,
    materials: [
      { materialId: "guide-to-justice", required: 4 },
      { materialId: "philosophies-of-justice", required: 38 },
      { materialId: "shimmering-nectar", required: 6 },
      { materialId: "energy-nectar", required: 22 },
      { materialId: "massless-lightless-eye-of-the-maelstrom", required: 6 }, // Note: materialId mapping might follow "lightless-eye-of-the-maelstrom" depending on dataset schema
      { materialId: "crown-of-insight", required: 1 },
    ],
  },
  // Triple Crown 6 → 10
  {
    characterId: "furina",
    name: "Triple Crown (All Talents 6 → 10)",
    description: "Materials to max all three talents from level 6 to 10",
    category: "talent",
    sortOrder: 3,
    materials: [
      { materialId: "guide-to-justice", required: 12 },
      { materialId: "philosophies-of-justice", required: 114 },
      { materialId: "shimmering-nectar", required: 18 },
      { materialId: "energy-nectar", required: 66 },
      { materialId: "lightless-eye-of-the-maelstrom", required: 18 },
      { materialId: "crown-of-insight", required: 3 },
    ],
  },
];