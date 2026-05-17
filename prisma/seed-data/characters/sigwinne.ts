import type { SeedCharacter, SeedCharacterGoalTemplate } from "../types";

export const sigwinne: SeedCharacter = {
  id: "sigwinne",
  name: "Sigewinne",
  image: "https://enka.network/ui/UI_AvatarIcon_Sigewinne.png",
  rarity: 5,
  element: "Hydro",
  weaponType: "Bow",
  region: "Fontaine",
};

export const sigwinneGoalTemplates: SeedCharacterGoalTemplate[] = [
  // Ascension 1
  {
    characterId: "sigwinne",
    name: "Ascension 1 (Lv. 20 → 40)",
    description: "First ascension materials for Sigewinne",
    category: "ascension",
    sortOrder: 1,
    materials: [
      { materialId: "varunada-lazurite-sliver", required: 1 },
      { materialId: "romaritime-flower", required: 3 },
      { materialId: "transoceanic-pearl", required: 3 },
    ],
  },
  // Ascension 2
  {
    characterId: "sigwinne",
    name: "Ascension 2 (Lv. 40 → 50)",
    description: "Second ascension materials for Sigewinne",
    category: "ascension",
    sortOrder: 2,
    materials: [
      { materialId: "varunada-lazurite-fragment", required: 3 },
      { materialId: "water-splitting-feather", required: 2 },
      { materialId: "romaritime-flower", required: 10 },
      { materialId: "transoceanic-pearl", required: 15 },
    ],
  },
  // Ascension 3
  {
    characterId: "sigwinne",
    name: "Ascension 3 (Lv. 50 → 60)",
    description: "Third ascension materials for Sigewinne",
    category: "ascension",
    sortOrder: 3,
    materials: [
      { materialId: "varunada-lazurite-fragment", required: 6 },
      { materialId: "water-splitting-feather", required: 4 },
      { materialId: "romaritime-flower", required: 20 },
      { materialId: "transoceanic-chunk", required: 12 },
    ],
  },
  // Ascension 4
  {
    characterId: "sigwinne",
    name: "Ascension 4 (Lv. 60 → 70)",
    description: "Fourth ascension materials for Sigewinne",
    category: "ascension",
    sortOrder: 4,
    materials: [
      { materialId: "varunada-lazurite-chunk", required: 3 },
      { materialId: "water-splitting-feather", required: 8 },
      { materialId: "romaritime-flower", required: 30 },
      { materialId: "transoceanic-chunk", required: 18 },
    ],
  },
  // Ascension 5
  {
    characterId: "sigwinne",
    name: "Ascension 5 (Lv. 70 → 80)",
    description: "Fifth ascension materials for Sigewinne",
    category: "ascension",
    sortOrder: 5,
    materials: [
      { materialId: "varunada-lazurite-chunk", required: 6 },
      { materialId: "water-splitting-feather", required: 12 },
      { materialId: "romaritime-flower", required: 45 },
      { materialId: "xenochromatic-crystal", required: 12 },
    ],
  },
  // Ascension 6
  {
    characterId: "sigwinne",
    name: "Ascension 6 (Lv. 80 → 90)",
    description: "Sixth ascension materials for Sigewinne",
    category: "ascension",
    sortOrder: 6,
    materials: [
      { materialId: "varunada-lazurite-gemstone", required: 6 },
      { materialId: "water-splitting-feather", required: 20 },
      { materialId: "romaritime-flower", required: 60 },
      { materialId: "xenochromatic-crystal", required: 24 },
    ],
  },
  // All Talents 1 → 6
  {
    characterId: "sigwinne",
    name: "All Talents Level 1 → 6",
    description: "Materials to level all three talents from 1 to 6",
    category: "talent",
    sortOrder: 1,
    materials: [
      { materialId: "teachings-of-equity", required: 9 },
      { materialId: "guide-to-equity", required: 63 },
      { materialId: "transoceanic-pearl", required: 18 },
      { materialId: "transoceanic-chunk", required: 66 },
    ],
  },
  // Single Talent 6 → 10
  {
    characterId: "sigwinne",
    name: "Single Talent Level 6 → 10",
    description: "Materials to max one talent from level 6 to 10",
    category: "talent",
    sortOrder: 2,
    materials: [
      { materialId: "guide-to-equity", required: 4 },
      { materialId: "philosophies-of-equity", required: 38 },
      { materialId: "transoceanic-chunk", required: 6 },
      { materialId: "xenochromatic-crystal", required: 22 },
      { materialId: "silken-feather", required: 6 },
      { materialId: "crown-of-insight", required: 1 },
    ],
  },
  // Triple Crown 6 → 10
  {
    characterId: "sigwinne",
    name: "Triple Crown (All Talents 6 → 10)",
    description: "Materials to max all three talents from level 6 to 10",
    category: "talent",
    sortOrder: 3,
    materials: [
      { materialId: "guide-to-equity", required: 12 },
      { materialId: "philosophies-of-equity", required: 114 },
      { materialId: "transoceanic-chunk", required: 18 },
      { materialId: "xenochromatic-crystal", required: 66 },
      { materialId: "silken-feather", required: 18 },
      { materialId: "crown-of-insight", required: 3 },
    ],
  },
];