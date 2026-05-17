import type { SeedCharacter, SeedCharacterGoalTemplate } from "../types";

export const beidou: SeedCharacter = {
  id: "beidou",
  name: "Beidou",
  image: "https://enka.network/ui/UI_AvatarIcon_Beidou.png",
  rarity: 4,
  element: "Electro",
  weaponType: "Claymore",
  region: "Liyue",
};

export const beidouGoalTemplates: SeedCharacterGoalTemplate[] = [
  // Ascension 1
  {
    characterId: "beidou",
    name: "Ascension 1 (Lv. 20 → 40)",
    description: "First ascension materials for Beidou",
    category: "ascension",
    sortOrder: 1,
    materials: [
      { materialId: "vajrada-amethyst-sliver", required: 1 },
      { materialId: "noctilucous-jade", required: 3 },
      { materialId: "treasure-hoarder-insignia", required: 3 },
    ],
  },
  // Ascension 2
  {
    characterId: "beidou",
    name: "Ascension 2 (Lv. 40 → 50)",
    description: "Second ascension materials for Beidou",
    category: "ascension",
    sortOrder: 2,
    materials: [
      { materialId: "vajrada-amethyst-fragment", required: 3 },
      { materialId: "lightning-prism", required: 2 },
      { materialId: "noctilucous-jade", required: 10 },
      { materialId: "treasure-hoarder-insignia", required: 15 },
    ],
  },
  // Ascension 3
  {
    characterId: "beidou",
    name: "Ascension 3 (Lv. 50 → 60)",
    description: "Third ascension materials for Beidou",
    category: "ascension",
    sortOrder: 3,
    materials: [
      { materialId: "vajrada-amethyst-fragment", required: 6 },
      { materialId: "lightning-prism", required: 4 },
      { materialId: "noctilucous-jade", required: 20 },
      { materialId: "silver-raven-insignia", required: 12 },
    ],
  },
  // Ascension 4
  {
    characterId: "beidou",
    name: "Ascension 4 (Lv. 60 → 70)",
    description: "Fourth ascension materials for Beidou",
    category: "ascension",
    sortOrder: 4,
    materials: [
      { materialId: "vajrada-amethyst-chunk", required: 3 },
      { materialId: "lightning-prism", required: 8 },
      { materialId: "noctilucous-jade", required: 30 },
      { materialId: "silver-raven-insignia", required: 18 },
    ],
  },
  // Ascension 5
  {
    characterId: "beidou",
    name: "Ascension 5 (Lv. 70 → 80)",
    description: "Fifth ascension materials for Beidou",
    category: "ascension",
    sortOrder: 5,
    materials: [
      { materialId: "vajrada-amethyst-chunk", required: 6 },
      { materialId: "lightning-prism", required: 12 },
      { materialId: "noctilucous-jade", required: 45 },
      { materialId: "golden-raven-insignia", required: 12 },
    ],
  },
  // Ascension 6
  {
    characterId: "beidou",
    name: "Ascension 6 (Lv. 80 → 90)",
    description: "Sixth ascension materials for Beidou",
    category: "ascension",
    sortOrder: 6,
    materials: [
      { materialId: "vajrada-amethyst-gemstone", required: 6 },
      { materialId: "lightning-prism", required: 20 },
      { materialId: "noctilucous-jade", required: 60 },
      { materialId: "golden-raven-insignia", required: 24 },
    ],
  },
  // All Talents 1 → 6
  {
    characterId: "beidou",
    name: "All Talents Level 1 → 6",
    description: "Materials to level all three talents from 1 to 6",
    category: "talent",
    sortOrder: 1,
    materials: [
      { materialId: "teachings-of-gold", required: 9 },
      { materialId: "guide-to-gold", required: 63 },
      { materialId: "treasure-hoarder-insignia", required: 18 },
      { materialId: "silver-raven-insignia", required: 66 },
    ],
  },
  // Single Talent 6 → 10
  {
    characterId: "beidou",
    name: "Single Talent Level 6 → 10",
    description: "Materials to max one talent from level 6 to 10",
    category: "talent",
    sortOrder: 2,
    materials: [
      { materialId: "guide-to-gold", required: 4 },
      { materialId: "philosophies-of-gold", required: 38 },
      { materialId: "silver-raven-insignia", required: 6 },
      { materialId: "golden-raven-insignia", required: 22 },
      { materialId: "dvalins-sigh", required: 6 },
      { materialId: "crown-of-insight", required: 1 },
    ],
  },
  // Triple Crown 6 → 10
  {
    characterId: "beidou",
    name: "Triple Crown (All Talents 6 → 10)",
    description: "Materials to max all three talents from level 6 to 10",
    category: "talent",
    sortOrder: 3,
    materials: [
      { materialId: "guide-to-gold", required: 12 },
      { materialId: "philosophies-of-gold", required: 114 },
      { materialId: "silver-raven-insignia", required: 18 },
      { materialId: "golden-raven-insignia", required: 66 },
      { materialId: "dvalins-sigh", required: 18 },
      { materialId: "crown-of-insight", required: 3 },
    ],
  },
];