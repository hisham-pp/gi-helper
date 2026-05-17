import type { SeedCharacter, SeedCharacterGoalTemplate } from "../types";

export const chevreuse: SeedCharacter = {
  id: "chevreuse",
  name: "Chevreuse",
  image: "https://enka.network/ui/UI_AvatarIcon_Chevreuse.png",
  rarity: 4,
  element: "Pyro",
  weaponType: "Polearm",
  region: "Fontaine",
};

export const chevreuseGoalTemplates: SeedCharacterGoalTemplate[] = [
  // Ascension 1
  {
    characterId: "chevreuse",
    name: "Ascension 1 (Lv. 20 → 40)",
    description: "First ascension materials for Chevreuse",
    category: "ascension",
    sortOrder: 1,
    materials: [
      { materialId: "agnidus-agate-sliver", required: 1 },
      { materialId: "lumidouce-bell", required: 3 },
      { materialId: "meshing-gear", required: 3 },
    ],
  },
  // Ascension 2
  {
    characterId: "chevreuse",
    name: "Ascension 2 (Lv. 40 → 50)",
    description: "Second ascension materials for Chevreuse",
    category: "ascension",
    sortOrder: 2,
    materials: [
      { materialId: "agnidus-agate-fragment", required: 3 },
      { materialId: "fontemer-unihorn", required: 2 },
      { materialId: "lumidouce-bell", required: 10 },
      { materialId: "meshing-gear", required: 15 },
    ],
  },
  // Ascension 3
  {
    characterId: "chevreuse",
    name: "Ascension 3 (Lv. 50 → 60)",
    description: "Third ascension materials for Chevreuse",
    category: "ascension",
    sortOrder: 3,
    materials: [
      { materialId: "agnidus-agate-fragment", required: 6 },
      { materialId: "fontemer-unihorn", required: 4 },
      { materialId: "lumidouce-bell", required: 20 },
      { materialId: "mechanical-spur-gear", required: 12 },
    ],
  },
  // Ascension 4
  {
    characterId: "chevreuse",
    name: "Ascension 4 (Lv. 60 → 70)",
    description: "Fourth ascension materials for Chevreuse",
    category: "ascension",
    sortOrder: 4,
    materials: [
      { materialId: "agnidus-agate-chunk", required: 3 },
      { materialId: "fontemer-unihorn", required: 8 },
      { materialId: "lumidouce-bell", required: 30 },
      { materialId: "mechanical-spur-gear", required: 18 },
    ],
  },
  // Ascension 5
  {
    characterId: "chevreuse",
    name: "Ascension 5 (Lv. 70 → 80)",
    description: "Fifth ascension materials for Chevreuse",
    category: "ascension",
    sortOrder: 5,
    materials: [
      { materialId: "agnidus-agate-chunk", required: 6 },
      { materialId: "fontemer-unihorn", required: 12 },
      { materialId: "lumidouce-bell", required: 45 },
      { materialId: "artificed-dynamic-gear", required: 12 },
    ],
  },
  // Ascension 6
  {
    characterId: "chevreuse",
    name: "Ascension 6 (Lv. 80 → 90)",
    description: "Sixth ascension materials for Chevreuse",
    category: "ascension",
    sortOrder: 6,
    materials: [
      { materialId: "agnidus-agate-gemstone", required: 6 },
      { materialId: "fontemer-unihorn", required: 20 },
      { materialId: "lumidouce-bell", required: 60 },
      { materialId: "artificed-dynamic-gear", required: 24 },
    ],
  },
  // All Talents 1 → 6
  {
    characterId: "chevreuse",
    name: "All Talents Level 1 → 6",
    description: "Materials to level all three talents from 1 to 6",
    category: "talent",
    sortOrder: 1,
    materials: [
      { materialId: "teachings-of-order", required: 9 },
      { materialId: "guide-to-order", required: 63 },
      { materialId: "meshing-gear", required: 18 },
      { materialId: "mechanical-spur-gear", required: 66 },
    ],
  },
  // Single Talent 6 → 10
  {
    characterId: "chevreuse",
    name: "Single Talent Level 6 → 10",
    description: "Materials to max one talent from level 6 to 10",
    category: "talent",
    sortOrder: 2,
    materials: [
      { materialId: "guide-to-order", required: 4 },
      { materialId: "philosophies-of-order", required: 38 },
      { materialId: "mechanical-spur-gear", required: 6 },
      { materialId: "artificed-dynamic-gear", required: 22 },
      { materialId: "lightless-eye-of-the-maelstrom", required: 6 },
      { materialId: "crown-of-insight", required: 1 },
    ],
  },
  // Triple Crown 6 → 10
  {
    characterId: "chevreuse",
    name: "Triple Crown (All Talents 6 → 10)",
    description: "Materials to max all three talents from level 6 to 10",
    category: "talent",
    sortOrder: 3,
    materials: [
      { materialId: "guide-to-order", required: 12 },
      { materialId: "philosophies-of-order", required: 114 },
      { materialId: "mechanical-spur-gear", required: 18 },
      { materialId: "artificed-dynamic-gear", required: 66 },
      { materialId: "lightless-eye-of-the-maelstrom", required: 18 },
      { materialId: "crown-of-insight", required: 3 },
    ],
  },
];