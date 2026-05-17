import type { SeedCharacter, SeedCharacterGoalTemplate } from "../types";

export const kinich: SeedCharacter = {
  id: "kinich",
  name: "Kinich",
  image: "https://enka.network/ui/UI_AvatarIcon_Kinich.png",
  rarity: 5,
  element: "Dendro",
  weaponType: "Claymore",
  region: "Natlan",
};

export const kinichGoalTemplates: SeedCharacterGoalTemplate[] = [
  // Ascension 1
  {
    characterId: "kinich",
    name: "Ascension 1 (Lv. 20 → 40)",
    description: "First ascension materials for Kinich",
    category: "ascension",
    sortOrder: 1,
    materials: [
      { materialId: "nagadus-emerald-sliver", required: 1 },
      { materialId: "saurian-claw-succulent", required: 3 },
      { materialId: "juvenile-fang", required: 3 },
    ],
  },
  // Ascension 2
  {
    characterId: "kinich",
    name: "Ascension 2 (Lv. 40 → 50)",
    description: "Second ascension materials for Kinich",
    category: "ascension",
    sortOrder: 2,
    materials: [
      { materialId: "nagadus-emerald-fragment", required: 3 },
      { materialId: "overripe-flamegranate", required: 2 },
      { materialId: "saurian-claw-succulent", required: 10 },
      { materialId: "juvenile-fang", required: 15 },
    ],
  },
  // Ascension 3
  {
    characterId: "kinich",
    name: "Ascension 3 (Lv. 50 → 60)",
    description: "Third ascension materials for Kinich",
    category: "ascension",
    sortOrder: 3,
    materials: [
      { materialId: "nagadus-emerald-fragment", required: 6 },
      { materialId: "overripe-flamegranate", required: 4 },
      { materialId: "saurian-claw-succulent", required: 20 },
      { materialId: "seasoned-fang", required: 12 },
    ],
  },
  // Ascension 4
  {
    characterId: "kinich",
    name: "Ascension 4 (Lv. 60 → 70)",
    description: "Fourth ascension materials for Kinich",
    category: "ascension",
    sortOrder: 4,
    materials: [
      { materialId: "nagadus-emerald-chunk", required: 3 },
      { materialId: "overripe-flamegranate", required: 8 },
      { materialId: "saurian-claw-succulent", required: 30 },
      { materialId: "seasoned-fang", required: 18 },
    ],
  },
  // Ascension 5
  {
    characterId: "kinich",
    name: "Ascension 5 (Lv. 70 → 80)",
    description: "Fifth ascension materials for Kinich",
    category: "ascension",
    sortOrder: 5,
    materials: [
      { materialId: "nagadus-emerald-chunk", required: 6 },
      { materialId: "overripe-flamegranate", required: 12 },
      { materialId: "saurian-claw-succulent", required: 45 },
      { materialId: "tyrant-fang", required: 12 },
    ],
  },
  // Ascension 6
  {
    characterId: "kinich",
    name: "Ascension 6 (Lv. 80 → 90)",
    description: "Sixth ascension materials for Kinich",
    category: "ascension",
    sortOrder: 6,
    materials: [
      { materialId: "nagadus-emerald-gemstone", required: 6 },
      { materialId: "overripe-flamegranate", required: 20 },
      { materialId: "saurian-claw-succulent", required: 60 },
      { materialId: "tyrant-fang", required: 24 },
    ],
  },
  // All Talents 1 → 6
  {
    characterId: "kinich",
    name: "All Talents Level 1 → 6",
    description: "Materials to level all three talents from 1 to 6",
    category: "talent",
    sortOrder: 1,
    materials: [
      { materialId: "teachings-of-kindling", required: 9 },
      { materialId: "guide-to-kindling", required: 63 },
      { materialId: "juvenile-fang", required: 18 },
      { materialId: "seasoned-fang", required: 66 },
    ],
  },
  // Single Talent 6 → 10
  {
    characterId: "kinich",
    name: "Single Talent Level 6 → 10",
    description: "Materials to max one talent from level 6 to 10",
    category: "talent",
    sortOrder: 2,
    materials: [
      { materialId: "guide-to-kindling", required: 4 },
      { materialId: "philosophies-of-kindling", required: 38 },
      { materialId: "seasoned-fang", required: 6 },
      { materialId: "tyrant-fang", required: 22 },
      { materialId: "denial-and-judgment", required: 6 },
      { materialId: "crown-of-insight", required: 1 },
    ],
  },
  // Triple Crown 6 → 10
  {
    characterId: "kinich",
    name: "Triple Crown (All Talents 6 → 10)",
    description: "Materials to max all three talents from level 6 to 10",
    category: "talent",
    sortOrder: 3,
    materials: [
      { materialId: "guide-to-kindling", required: 12 },
      { materialId: "philosophies-of-kindling", required: 114 },
      { materialId: "seasoned-fang", required: 18 },
      { materialId: "tyrant-fang", required: 66 },
      { materialId: "denial-and-judgment", required: 18 },
      { materialId: "crown-of-insight", required: 3 },
    ],
  },
];