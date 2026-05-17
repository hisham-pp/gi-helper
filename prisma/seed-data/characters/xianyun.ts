import type { SeedCharacter, SeedCharacterGoalTemplate } from "../types";

export const xianyun: SeedCharacter = {
  id: "xianyun",
  name: "Xianyun",
  image: "https://enka.network/ui/UI_AvatarIcon_Xianyun.png",
  rarity: 5,
  element: "Anemo",
  weaponType: "Catalyst",
  region: "Liyue",
};

export const xianyunGoalTemplates: SeedCharacterGoalTemplate[] = [
  // Ascension 1
  {
    characterId: "xianyun",
    name: "Ascension 1 (Lv. 20 → 40)",
    description: "First ascension materials for Xianyun",
    category: "ascension",
    sortOrder: 1,
    materials: [
      { materialId: "vayuda-turquoise-sliver", required: 1 },
      { materialId: "clearwater-jade", required: 3 },
      { materialId: "divine-body-samadhi-flower", required: 3 },
    ],
  },
  // Ascension 2
  {
    characterId: "xianyun",
    name: "Ascension 2 (Lv. 40 → 50)",
    description: "Second ascension materials for Xianyun",
    category: "ascension",
    sortOrder: 2,
    materials: [
      { materialId: "vayuda-turquoise-fragment", required: 3 },
      { materialId: "cloudseam-scale", required: 2 },
      { materialId: "clearwater-jade", required: 10 },
      { materialId: "divine-body-samadhi-flower", required: 15 },
    ],
  },
  // Ascension 3
  {
    characterId: "xianyun",
    name: "Ascension 3 (Lv. 50 → 60)",
    description: "Third ascension materials for Xianyun",
    category: "ascension",
    sortOrder: 3,
    materials: [
      { materialId: "vayuda-turquoise-fragment", required: 6 },
      { materialId: "cloudseam-scale", required: 4 },
      { materialId: "clearwater-jade", required: 20 },
      { materialId: "purifying-light-rose", required: 12 },
    ],
  },
  // Ascension 4
  {
    characterId: "xianyun",
    name: "Ascension 4 (Lv. 60 → 70)",
    description: "Fourth ascension materials for Xianyun",
    category: "ascension",
    sortOrder: 4,
    materials: [
      { materialId: "vayuda-turquoise-chunk", required: 3 },
      { materialId: "cloudseam-scale", required: 8 },
      { materialId: "clearwater-jade", required: 30 },
      { materialId: "purifying-light-rose", required: 18 },
    ],
  },
  // Ascension 5
  {
    characterId: "xianyun",
    name: "Ascension 5 (Lv. 70 → 80)",
    description: "Fifth ascension materials for Xianyun",
    category: "ascension",
    sortOrder: 5,
    materials: [
      { materialId: "vayuda-turquoise-chunk", required: 6 },
      { materialId: "cloudseam-scale", required: 12 },
      { materialId: "clearwater-jade", required: 45 },
      { materialId: "bhasm-of-the-ascetic", required: 12 },
    ],
  },
  // Ascension 6
  {
    characterId: "xianyun",
    name: "Ascension 6 (Lv. 80 → 90)",
    description: "Sixth ascension materials for Xianyun",
    category: "ascension",
    sortOrder: 6,
    materials: [
      { materialId: "vayuda-turquoise-gemstone", required: 6 },
      { materialId: "cloudseam-scale", required: 20 },
      { materialId: "clearwater-jade", required: 60 },
      { materialId: "bhasm-of-the-ascetic", required: 24 },
    ],
  },
  // All Talents 1 → 6
  {
    characterId: "xianyun",
    name: "All Talents Level 1 → 6",
    description: "Materials to level all three talents from 1 to 6",
    category: "talent",
    sortOrder: 1,
    materials: [
      { materialId: "teachings-of-gold", required: 9 },
      { materialId: "guide-to-gold", required: 63 },
      { materialId: "divine-body-samadhi-flower", required: 18 },
      { materialId: "purifying-light-rose", required: 66 },
    ],
  },
  // Single Talent 6 → 10
  {
    characterId: "xianyun",
    name: "Single Talent Level 6 → 10",
    description: "Materials to max one talent from level 6 to 10",
    category: "talent",
    sortOrder: 2,
    materials: [
      { materialId: "guide-to-gold", required: 4 },
      { materialId: "philosophies-of-gold", required: 38 },
      { materialId: "purifying-light-rose", required: 6 },
      { materialId: "bhasm-of-the-ascetic", required: 22 },
      { materialId: "lightless-eye-of-the-maelstrom", required: 6 },
      { materialId: "crown-of-insight", required: 1 },
    ],
  },
  // Triple Crown 6 → 10
  {
    characterId: "xianyun",
    name: "Triple Crown (All Talents 6 → 10)",
    description: "Materials to max all three talents from level 6 to 10",
    category: "talent",
    sortOrder: 3,
    materials: [
      { materialId: "guide-to-gold", required: 12 },
      { materialId: "philosophies-of-gold", required: 114 },
      { materialId: "purifying-light-rose", required: 18 },
      { materialId: "bhasm-of-the-ascetic", required: 66 },
      { materialId: "lightless-eye-of-the-maelstrom", required: 18 },
      { materialId: "crown-of-insight", required: 3 },
    ],
  },
];