import type { SeedCharacter, SeedCharacterGoalTemplate } from "../types";

export const dhalia: SeedCharacter = {
  id: "dhalia",
  name: "Dhalia",
  image: "https://enka.network/ui/UI_AvatarIcon_Dhalia.png",
  rarity: 4,
  element: "Hydro",
  weaponType: "Catalyst",
  region: "Mondstadt",
};

export const dhaliaGoalTemplates: SeedCharacterGoalTemplate[] = [
  // Ascension 1
  {
    characterId: "dhalia",
    name: "Ascension 1 (Lv. 20 → 40)",
    description: "First ascension materials for Dhalia",
    category: "ascension",
    sortOrder: 1,
    materials: [
      { materialId: "varunada-lazurite-sliver", required: 1 },
      { materialId: "philanemo-mushroom", required: 3 },
      { materialId: "divine-node-shimmer", required: 3 },
    ],
  },
  // Ascension 2
  {
    characterId: "dhalia",
    name: "Ascension 2 (Lv. 40 → 50)",
    description: "Second ascension materials for Dhalia",
    category: "ascension",
    sortOrder: 2,
    materials: [
      { materialId: "varunada-lazurite-fragment", required: 3 },
      { materialId: "pure-water-core", required: 2 },
      { materialId: "philanemo-mushroom", required: 10 },
      { materialId: "divine-node-shimmer", required: 15 },
    ],
  },
  // Ascension 3
  {
    characterId: "dhalia",
    name: "Ascension 3 (Lv. 50 → 60)",
    description: "Third ascension materials for Dhalia",
    category: "ascension",
    sortOrder: 3,
    materials: [
      { materialId: "varunada-lazurite-fragment", required: 6 },
      { materialId: "pure-water-core", required: 4 },
      { materialId: "philanemo-mushroom", required: 20 },
      { materialId: "sacred-node-resonance", required: 12 },
    ],
  },
  // Ascension 4
  {
    characterId: "dhalia",
    name: "Ascension 4 (Lv. 60 → 70)",
    description: "Fourth ascension materials for Dhalia",
    category: "ascension",
    sortOrder: 4,
    materials: [
      { materialId: "varunada-lazurite-chunk", required: 3 },
      { materialId: "pure-water-core", required: 8 },
      { materialId: "philanemo-mushroom", required: 30 },
      { materialId: "sacred-node-resonance", required: 18 },
    ],
  },
  // Ascension 5
  {
    characterId: "dhalia",
    name: "Ascension 5 (Lv. 70 → 80)",
    description: "Fifth ascension materials for Dhalia",
    category: "ascension",
    sortOrder: 5,
    materials: [
      { materialId: "varunada-lazurite-chunk", required: 6 },
      { materialId: "pure-water-core", required: 12 },
      { materialId: "philanemo-mushroom", required: 45 },
      { materialId: "celestial-node-core", required: 12 },
    ],
  },
  // Ascension 6
  {
    characterId: "dhalia",
    name: "Ascension 6 (Lv. 80 → 90)",
    description: "Sixth ascension materials for Dhalia",
    category: "ascension",
    sortOrder: 6,
    materials: [
      { materialId: "varunada-lazurite-gemstone", required: 6 },
      { materialId: "pure-water-core", required: 20 },
      { materialId: "philanemo-mushroom", required: 60 },
      { materialId: "celestial-node-core", required: 24 },
    ],
  },
  // All Talents 1 → 6
  {
    characterId: "dhalia",
    name: "All Talents Level 1 → 6",
    description: "Materials to level all three talents from 1 to 6",
    category: "talent",
    sortOrder: 1,
    materials: [
      { materialId: "teachings-of-ballad", required: 9 },
      { materialId: "guide-to-ballad", required: 63 },
      { materialId: "divine-node-shimmer", required: 18 },
      { materialId: "sacred-node-resonance", required: 66 },
    ],
  },
  // Single Talent 6 → 10
  {
    characterId: "dhalia",
    name: "Single Talent Level 6 → 10)",
    description: "Materials to max one talent from level 6 to 10",
    category: "talent",
    sortOrder: 2,
    materials: [
      { materialId: "guide-to-ballad", required: 4 },
      { materialId: "philosophies-of-ballad", required: 38 },
      { materialId: "sacred-node-resonance", required: 6 },
      { materialId: "celestial-node-core", required: 22 },
      { materialId: "dvalins-sigh", required: 6 },
      { materialId: "crown-of-insight", required: 1 },
    ],
  },
  // Triple Crown 6 → 10
  {
    characterId: "dhalia",
    name: "Triple Crown (All Talents 6 → 10)",
    description: "Materials to max all three talents from level 6 to 10",
    category: "talent",
    sortOrder: 3,
    materials: [
      { materialId: "guide-to-ballad", required: 12 },
      { materialId: "philosophies-of-ballad", required: 114 },
      { materialId: "sacred-node-resonance", required: 18 },
      { materialId: "celestial-node-core", required: 66 },
      { materialId: "dvalins-sigh", required: 18 },
      { materialId: "crown-of-insight", required: 3 },
    ],
  },
];
