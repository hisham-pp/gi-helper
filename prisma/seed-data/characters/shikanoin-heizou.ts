import type { SeedCharacter, SeedCharacterGoalTemplate } from "../types";

export const shikanoinHeizou: SeedCharacter = {
  id: "shikanoin-heizou",
  name: "Shikanoin Heizou",
  image: "https://enka.network/ui/UI_AvatarIcon_Heizou.png",
  rarity: 4,
  element: "Anemo",
  weaponType: "Catalyst",
  region: "Inazuma",
};

export const shikanoinHeizouGoalTemplates: SeedCharacterGoalTemplate[] = [
  // Ascension 1
  {
    characterId: "shikanoin-heizou",
    name: "Ascension 1 (Lv. 20 → 40)",
    description: "First ascension materials for Shikanoin Heizou",
    category: "ascension",
    sortOrder: 1,
    materials: [
      { materialId: "vayuda-turquoise-sliver", required: 1 },
      { materialId: "onikabuto", required: 3 },
      { materialId: "treasure-hoarder-insignia", required: 3 },
    ],
  },
  // Ascension 2
  {
    characterId: "shikanoin-heizou",
    name: "Ascension 2 (Lv. 40 → 50)",
    description: "Second ascension materials for Shikanoin Heizou",
    category: "ascension",
    sortOrder: 2,
    materials: [
      { materialId: "vayuda-turquoise-fragment", required: 3 },
      { materialId: "runic-fang", required: 2 },
      { materialId: "onikabuto", required: 10 },
      { materialId: "treasure-hoarder-insignia", required: 15 },
    ],
  },
  // Ascension 3
  {
    characterId: "shikanoin-heizou",
    name: "Ascension 3 (Lv. 50 → 60)",
    description: "Third ascension materials for Shikanoin Heizou",
    category: "ascension",
    sortOrder: 3,
    materials: [
      { materialId: "vayuda-turquoise-fragment", required: 6 },
      { materialId: "runic-fang", required: 4 },
      { materialId: "onikabuto", required: 20 },
      { materialId: "silver-raven-insignia", required: 12 },
    ],
  },
  // Ascension 4
  {
    characterId: "shikanoin-heizou",
    name: "Ascension 4 (Lv. 60 → 70)",
    description: "Fourth ascension materials for Shikanoin Heizou",
    category: "ascension",
    sortOrder: 4,
    materials: [
      { materialId: "vayuda-turquoise-chunk", required: 3 },
      { materialId: "runic-fang", required: 8 },
      { materialId: "onikabuto", required: 30 },
      { materialId: "silver-raven-insignia", required: 18 },
    ],
  },
  // Ascension 5
  {
    characterId: "shikanoin-heizou",
    name: "Ascension 5 (Lv. 70 → 80)",
    description: "Fifth ascension materials for Shikanoin Heizou",
    category: "ascension",
    sortOrder: 5,
    materials: [
      { materialId: "vayuda-turquoise-chunk", required: 6 },
      { materialId: "runic-fang", required: 12 },
      { materialId: "onikabuto", required: 45 },
      { materialId: "golden-raven-insignia", required: 12 },
    ],
  },
  // Ascension 6
  {
    characterId: "shikanoin-heizou",
    name: "Ascension 6 (Lv. 80 → 90)",
    description: "Sixth ascension materials for Shikanoin Heizou",
    category: "ascension",
    sortOrder: 6,
    materials: [
      { materialId: "vayuda-turquoise-gemstone", required: 6 },
      { materialId: "runic-fang", required: 20 },
      { materialId: "onikabuto", required: 60 },
      { materialId: "golden-raven-insignia", required: 24 },
    ],
  },
  // All Talents 1 → 6
  {
    characterId: "shikanoin-heizou",
    name: "All Talents Level 1 → 6",
    description: "Materials to level all three talents from 1 to 6",
    category: "talent",
    sortOrder: 1,
    materials: [
      { materialId: "teachings-of-transience", required: 9 },
      { materialId: "guide-to-transience", required: 63 },
      { materialId: "treasure-hoarder-insignia", required: 18 },
      { materialId: "silver-raven-insignia", required: 66 },
    ],
  },
  // Single Talent 6 → 10
  {
    characterId: "shikanoin-heizou",
    name: "Single Talent Level 6 → 10",
    description: "Materials to max one talent from level 6 to 10",
    category: "talent",
    sortOrder: 2,
    materials: [
      { materialId: "guide-to-transience", required: 4 },
      { materialId: "philosophies-of-transience", required: 38 },
      { materialId: "silver-raven-insignia", required: 6 },
      { materialId: "golden-raven-insignia", required: 22 },
      { materialId: "the-meaning-of-aeons", required: 6 },
      { materialId: "crown-of-insight", required: 1 },
    ],
  },
  // Triple Crown 6 → 10
  {
    characterId: "shikanoin-heizou",
    name: "Triple Crown (All Talents 6 → 10)",
    description: "Materials to max all three talents from level 6 to 10",
    category: "talent",
    sortOrder: 3,
    materials: [
      { materialId: "guide-to-transience", required: 12 },
      { materialId: "philosophies-of-transience", required: 114 },
      { materialId: "silver-raven-insignia", required: 18 },
      { materialId: "golden-raven-insignia", required: 66 },
      { materialId: "the-meaning-of-aeons", required: 18 },
      { materialId: "crown-of-insight", required: 3 },
    ],
  },
];