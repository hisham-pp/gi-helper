import type { SeedCharacter, SeedCharacterGoalTemplate } from "../types";

export const aino: SeedCharacter = {
  id: "aino",
  name: "Aino",
  image: "https://enka.network/ui/UI_AvatarIcon_Aino.png",
  rarity: 5,
  element: "Electro",
  weaponType: "Sword",
  region: "Nod-Krai",
};

export const ainoGoalTemplates: SeedCharacterGoalTemplate[] = [
  // Ascension 1
  {
    characterId: "aino",
    name: "Ascension 1 (Lv. 20 → 40)",
    description: "First ascension materials for Aino",
    category: "ascension",
    sortOrder: 1,
    materials: [
      { materialId: "vajrada-amethyst-sliver", required: 1 },
      { materialId: "frost-vein-petal", required: 3 },
      { materialId: "broken-drive-shaft", required: 3 },
    ],
  },
  // Ascension 2
  {
    characterId: "aino",
    name: "Ascension 2 (Lv. 40 → 50)",
    description: "Second ascension materials for Aino",
    category: "ascension",
    sortOrder: 2,
    materials: [
      { materialId: "vajrada-amethyst-fragment", required: 3 },
      { materialId: "prismatic-severed-tail", required: 2 },
      { materialId: "frost-vein-petal", required: 10 },
      { materialId: "broken-drive-shaft", required: 15 },
    ],
  },
  // Ascension 3
  {
    characterId: "aino",
    name: "Ascension 3 (Lv. 50 → 60)",
    description: "Third ascension materials for Aino",
    category: "ascension",
    sortOrder: 3,
    materials: [
      { materialId: "vajrada-amethyst-fragment", required: 6 },
      { materialId: "prismatic-severed-tail", required: 4 },
      { materialId: "frost-vein-petal", required: 20 },
      { materialId: "reinforced-drive-shaft", required: 12 },
    ],
  },
  // Ascension 4
  {
    characterId: "aino",
    name: "Ascension 4 (Lv. 60 → 70)",
    description: "Fourth ascension materials for Aino",
    category: "ascension",
    sortOrder: 4,
    materials: [
      { materialId: "vajrada-amethyst-chunk", required: 3 },
      { materialId: "prismatic-severed-tail", required: 8 },
      { materialId: "frost-vein-petal", required: 30 },
      { materialId: "reinforced-drive-shaft", required: 18 },
    ],
  },
  // Ascension 5
  {
    characterId: "aino",
    name: "Ascension 5 (Lv. 70 → 80)",
    description: "Fifth ascension materials for Aino",
    category: "ascension",
    sortOrder: 5,
    materials: [
      { materialId: "vajrada-amethyst-chunk", required: 6 },
      { materialId: "prismatic-severed-tail", required: 12 },
      { materialId: "frost-vein-petal", required: 45 },
      { materialId: "precision-drive-shaft", required: 12 },
    ],
  },
  // Ascension 6
  {
    characterId: "aino",
    name: "Ascension 6 (Lv. 80 → 90)",
    description: "Sixth ascension materials for Aino",
    category: "ascension",
    sortOrder: 6,
    materials: [
      { materialId: "vajrada-amethyst-gemstone", required: 6 },
      { materialId: "prismatic-severed-tail", required: 20 },
      { materialId: "frost-vein-petal", required: 60 },
      { materialId: "precision-drive-shaft", required: 24 },
    ],
  },
  // All Talents 1 → 6
  {
    characterId: "aino",
    name: "All Talents Level 1 → 6",
    description: "Materials to level all three talents from 1 to 6",
    category: "talent",
    sortOrder: 1,
    materials: [
      { materialId: "teachings-of-elysium", required: 9 },
      { materialId: "guide-to-elysium", required: 63 },
      { materialId: "broken-drive-shaft", required: 18 },
      { materialId: "reinforced-drive-shaft", required: 66 },
    ],
  },
  // Single Talent 6 → 10
  {
    characterId: "aino",
    name: "Single Talent Level 6 → 10",
    description: "Materials to max one talent from level 6 to 10",
    category: "talent",
    sortOrder: 2,
    materials: [
      { materialId: "guide-to-elysium", required: 4 },
      { materialId: "philosophies-of-elysium", required: 38 },
      { materialId: "reinforced-drive-shaft", required: 6 },
      { materialId: "precision-drive-shaft", required: 22 },
      { materialId: "ascended-sample-rook", required: 6 },
      { materialId: "crown-of-insight", required: 1 },
    ],
  },
  // Triple Crown 6 → 10
  {
    characterId: "aino",
    name: "Triple Crown (All Talents 6 → 10)",
    description: "Materials to max all three talents from level 6 to 10",
    category: "talent",
    sortOrder: 3,
    materials: [
      { materialId: "guide-to-elysium", required: 12 },
      { materialId: "philosophies-of-elysium", required: 114 },
      { materialId: "reinforced-drive-shaft", required: 18 },
      { materialId: "precision-drive-shaft", required: 66 },
      { materialId: "ascended-sample-rook", required: 18 },
      { materialId: "crown-of-insight", required: 3 },
    ],
  },
];
