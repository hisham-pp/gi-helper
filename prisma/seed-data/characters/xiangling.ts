import type { SeedCharacter, SeedCharacterGoalTemplate } from "../types";

export const xiangling: SeedCharacter = {
  id: "xiangling",
  name: "Xiangling",
  image: "https://enka.network/ui/UI_AvatarIcon_Xiangling.png",
  rarity: 4,
  element: "Pyro",
  weaponType: "Polearm",
  region: "Liyue",
};

export const xianglingGoalTemplates: SeedCharacterGoalTemplate[] = [
  // Ascension 1
  {
    characterId: "xiangling",
    name: "Ascension 1 (Lv. 20 → 40)",
    description: "First ascension materials for Xiangling",
    category: "ascension",
    sortOrder: 1,
    materials: [
      { materialId: "agnidus-agate-sliver", required: 1 },
      { materialId: "jueyun-chili", required: 3 },
      { materialId: "slime-condensate", required: 3 },
    ],
  },
  // Ascension 2
  {
    characterId: "xiangling",
    name: "Ascension 2 (Lv. 40 → 50)",
    description: "Second ascension materials for Xiangling",
    category: "ascension",
    sortOrder: 2,
    materials: [
      { materialId: "agnidus-agate-fragment", required: 3 },
      { materialId: "everflame-seed", required: 2 },
      { materialId: "jueyun-chili", required: 10 },
      { materialId: "slime-condensate", required: 15 },
    ],
  },
  // Ascension 3
  {
    characterId: "xiangling",
    name: "Ascension 3 (Lv. 50 → 60)",
    description: "Third ascension materials for Xiangling",
    category: "ascension",
    sortOrder: 3,
    materials: [
      { materialId: "agnidus-agate-fragment", required: 6 },
      { materialId: "everflame-seed", required: 4 },
      { materialId: "jueyun-chili", required: 20 },
      { materialId: "slime-secretions", required: 12 },
    ],
  },
  // Ascension 4
  {
    characterId: "xiangling",
    name: "Ascension 4 (Lv. 60 → 70)",
    description: "Fourth ascension materials for Xiangling",
    category: "ascension",
    sortOrder: 4,
    materials: [
      { materialId: "agnidus-agate-chunk", required: 3 },
      { materialId: "everflame-seed", required: 8 },
      { materialId: "jueyun-chili", required: 30 },
      { materialId: "slime-secretions", required: 18 },
    ],
  },
  // Ascension 5
  {
    characterId: "xiangling",
    name: "Ascension 5 (Lv. 70 → 80)",
    description: "Fifth ascension materials for Xiangling",
    category: "ascension",
    sortOrder: 5,
    materials: [
      { materialId: "agnidus-agate-chunk", required: 6 },
      { materialId: "everflame-seed", required: 12 },
      { materialId: "jueyun-chili", required: 45 },
      { materialId: "slime-concentrate", required: 12 },
    ],
  },
  // Ascension 6
  {
    characterId: "xiangling",
    name: "Ascension 6 (Lv. 80 → 90)",
    description: "Sixth ascension materials for Xiangling",
    category: "ascension",
    sortOrder: 6,
    materials: [
      { materialId: "agnidus-agate-gemstone", required: 6 },
      { materialId: "everflame-seed", required: 20 },
      { materialId: "jueyun-chili", required: 60 },
      { materialId: "slime-concentrate", required: 24 },
    ],
  },
  // All Talents 1 → 6
  {
    characterId: "xiangling",
    name: "All Talents Level 1 → 6",
    description: "Materials to level all three talents from 1 to 6",
    category: "talent",
    sortOrder: 1,
    materials: [
      { materialId: "teachings-of-diligence", required: 9 },
      { materialId: "guide-to-diligence", required: 63 },
      { materialId: "slime-condensate", required: 18 },
      { materialId: "slime-secretions", required: 66 },
    ],
  },
  // Single Talent 6 → 10
  {
    characterId: "xiangling",
    name: "Single Talent Level 6 → 10",
    description: "Materials to max one talent from level 6 to 10",
    category: "talent",
    sortOrder: 2,
    materials: [
      { materialId: "guide-to-diligence", required: 4 },
      { materialId: "philosophies-of-diligence", required: 38 },
      { materialId: "slime-secretions", required: 6 },
      { materialId: "slime-concentrate", required: 22 },
      { materialId: "dvalins-claw", required: 6 },
      { materialId: "crown-of-insight", required: 1 },
    ],
  },
  // Triple Crown 6 → 10
  {
    characterId: "xiangling",
    name: "Triple Crown (All Talents 6 → 10)",
    description: "Materials to max all three talents from level 6 to 10",
    category: "talent",
    sortOrder: 3,
    materials: [
      { materialId: "guide-to-diligence", required: 12 },
      { materialId: "philosophies-of-diligence", required: 114 },
      { materialId: "slime-secretions", required: 18 },
      { materialId: "slime-concentrate", required: 66 },
      { materialId: "dvalins-claw", required: 18 },
      { materialId: "crown-of-insight", required: 3 },
    ],
  },
];
