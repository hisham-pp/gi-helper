import type { SeedCharacter, SeedCharacterGoalTemplate } from "../types";

export const gorou: SeedCharacter = {
  id: "gorou",
  name: "Gorou",
  image: "https://enka.network/ui/UI_AvatarIcon_Gorou.png",
  rarity: 4,
  element: "Geo",
  weaponType: "Bow",
  region: "Inazuma",
};

export const gorouGoalTemplates: SeedCharacterGoalTemplate[] = [
  // Ascension 1
  {
    characterId: "gorou",
    name: "Ascension 1 (Lv. 20 → 40)",
    description: "First ascension materials for Gorou",
    category: "ascension",
    sortOrder: 1,
    materials: [
      { materialId: "prithiva-topaz-sliver", required: 1 },
      { materialId: "sango-pearl", required: 3 },
      { materialId: "spectral-husk", required: 3 },
    ],
  },
  // Ascension 2
  {
    characterId: "gorou",
    name: "Ascension 2 (Lv. 40 → 50)",
    description: "Second ascension materials for Gorou",
    category: "ascension",
    sortOrder: 2,
    materials: [
      { materialId: "prithiva-topaz-fragment", required: 3 },
      { materialId: "perpetual-heart", required: 2 },
      { materialId: "sango-pearl", required: 10 },
      { materialId: "spectral-husk", required: 15 },
    ],
  },
  // Ascension 3
  {
    characterId: "gorou",
    name: "Ascension 3 (Lv. 50 → 60)",
    description: "Third ascension materials for Gorou",
    category: "ascension",
    sortOrder: 3,
    materials: [
      { materialId: "prithiva-topaz-fragment", required: 6 },
      { materialId: "perpetual-heart", required: 4 },
      { materialId: "sango-pearl", required: 20 },
      { materialId: "spectral-heart", required: 12 },
    ],
  },
  // Ascension 4
  {
    characterId: "gorou",
    name: "Ascension 4 (Lv. 60 → 70)",
    description: "Fourth ascension materials for Gorou",
    category: "ascension",
    sortOrder: 4,
    materials: [
      { materialId: "prithiva-topaz-chunk", required: 3 },
      { materialId: "perpetual-heart", required: 8 },
      { materialId: "sango-pearl", required: 30 },
      { materialId: "spectral-heart", required: 18 },
    ],
  },
  // Ascension 5
  {
    characterId: "gorou",
    name: "Ascension 5 (Lv. 70 → 80)",
    description: "Fifth ascension materials for Gorou",
    category: "ascension",
    sortOrder: 5,
    materials: [
      { materialId: "prithiva-topaz-chunk", required: 6 },
      { materialId: "perpetual-heart", required: 12 },
      { materialId: "sango-pearl", required: 45 },
      { materialId: "spectral-nucleus", required: 12 },
    ],
  },
  // Ascension 6
  {
    characterId: "gorou",
    name: "Ascension 6 (Lv. 80 → 90)",
    description: "Sixth ascension materials for Gorou",
    category: "ascension",
    sortOrder: 6,
    materials: [
      { materialId: "prithiva-topaz-gemstone", required: 6 },
      { materialId: "perpetual-heart", required: 20 },
      { materialId: "sango-pearl", required: 60 },
      { materialId: "spectral-nucleus", required: 24 },
    ],
  },
  // All Talents 1 → 6
  {
    characterId: "gorou",
    name: "All Talents Level 1 → 6",
    description: "Materials to level all three talents from 1 to 6",
    category: "talent",
    sortOrder: 1,
    materials: [
      { materialId: "teachings-of-light", required: 9 },
      { materialId: "guide-to-light", required: 63 },
      { materialId: "spectral-husk", required: 18 },
      { materialId: "spectral-heart", required: 66 },
    ],
  },
  // Single Talent 6 → 10
  {
    characterId: "gorou",
    name: "Single Talent Level 6 → 10",
    description: "Materials to max one talent from level 6 to 10",
    category: "talent",
    sortOrder: 2,
    materials: [
      { materialId: "guide-to-light", required: 4 },
      { materialId: "philosophies-of-light", required: 38 },
      { materialId: "spectral-heart", required: 6 },
      { materialId: "spectral-nucleus", required: 22 },
      { materialId: "molten-moment", required: 6 },
      { materialId: "crown-of-insight", required: 1 },
    ],
  },
  // Triple Crown 6 → 10
  {
    characterId: "gorou",
    name: "Triple Crown (All Talents 6 → 10)",
    description: "Materials to max all three talents from level 6 to 10",
    category: "talent",
    sortOrder: 3,
    materials: [
      { materialId: "guide-to-light", required: 12 },
      { materialId: "philosophies-of-light", required: 114 },
      { materialId: "spectral-heart", required: 18 },
      { materialId: "spectral-nucleus", required: 66 },
      { materialId: "molten-moment", required: 18 },
      { materialId: "crown-of-insight", required: 3 },
    ],
  },
];
