import type { SeedCharacter, SeedCharacterGoalTemplate } from "../types";

export const lynette: SeedCharacter = {
  id: "lynette",
  name: "Lynette",
  image: "https://enka.network/ui/UI_AvatarIcon_Lynette.png",
  rarity: 4,
  element: "Anemo",
  weaponType: "Sword",
  region: "Fontaine",
};

export const lynetteGoalTemplates: SeedCharacterGoalTemplate[] = [
  // Ascension 1
  {
    characterId: "lynette",
    name: "Ascension 1 (Lv. 20 → 40)",
    description: "First ascension materials for Lynette",
    category: "ascension",
    sortOrder: 1,
    materials: [
      { materialId: "vayuda-turquoise-sliver", required: 1 },
      { materialId: "lumidouce-bell", required: 3 },
      { materialId: "meshing-gear", required: 3 },
    ],
  },
  // Ascension 2
  {
    characterId: "lynette",
    name: "Ascension 2 (Lv. 40 → 50)",
    description: "Second ascension materials for Lynette",
    category: "ascension",
    sortOrder: 2,
    materials: [
      { materialId: "vayuda-turquoise-fragment", required: 3 },
      { materialId: "artificed-spare-clockwork-component-coppelia", required: 2 },
      { materialId: "lumidouce-bell", required: 10 },
      { materialId: "meshing-gear", required: 15 },
    ],
  },
  // Ascension 3
  {
    characterId: "lynette",
    name: "Ascension 3 (Lv. 50 → 60)",
    description: "Third ascension materials for Lynette",
    category: "ascension",
    sortOrder: 3,
    materials: [
      { materialId: "vayuda-turquoise-fragment", required: 6 },
      { materialId: "artificed-spare-clockwork-component-coppelia", required: 4 },
      { materialId: "lumidouce-bell", required: 20 },
      { materialId: "mechanical-spur-gear", required: 12 },
    ],
  },
  // Ascension 4
  {
    characterId: "lynette",
    name: "Ascension 4 (Lv. 60 → 70)",
    description: "Fourth ascension materials for Lynette",
    category: "ascension",
    sortOrder: 4,
    materials: [
      { materialId: "vayuda-turquoise-chunk", required: 3 },
      { materialId: "artificed-spare-clockwork-component-coppelia", required: 8 },
      { materialId: "lumidouce-bell", required: 30 },
      { materialId: "mechanical-spur-gear", required: 18 },
    ],
  },
  // Ascension 5
  {
    characterId: "lynette",
    name: "Ascension 5 (Lv. 70 → 80)",
    description: "Fifth ascension materials for Lynette",
    category: "ascension",
    sortOrder: 5,
    materials: [
      { materialId: "vayuda-turquoise-chunk", required: 6 },
      { materialId: "artificed-spare-clockwork-component-coppelia", required: 12 },
      { materialId: "lumidouce-bell", required: 45 },
      { materialId: "artificed-dynamic-gear", required: 12 },
    ],
  },
  // Ascension 6
  {
    characterId: "lynette",
    name: "Ascension 6 (Lv. 80 → 90)",
    description: "Sixth ascension materials for Lynette",
    category: "ascension",
    sortOrder: 6,
    materials: [
      { materialId: "vayuda-turquoise-gemstone", required: 6 },
      { materialId: "artificed-spare-clockwork-component-coppelia", required: 20 },
      { materialId: "lumidouce-bell", required: 60 },
      { materialId: "artificed-dynamic-gear", required: 24 },
    ],
  },
  // All Talents 1 → 6
  {
    characterId: "lynette",
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
    characterId: "lynette",
    name: "Single Talent Level 6 → 10",
    description: "Materials to max one talent from level 6 to 10",
    category: "talent",
    sortOrder: 2,
    materials: [
      { materialId: "guide-to-order", required: 4 },
      { materialId: "philosophies-of-order", required: 38 },
      { materialId: "mechanical-spur-gear", required: 6 },
      { materialId: "artificed-dynamic-gear", required: 22 },
      { materialId: "everamber", required: 6 },
      { materialId: "crown-of-insight", required: 1 },
    ],
  },
  // Triple Crown 6 → 10
  {
    characterId: "lynette",
    name: "Triple Crown (All Talents 6 → 10)",
    description: "Materials to max all three talents from level 6 to 10",
    category: "talent",
    sortOrder: 3,
    materials: [
      { materialId: "guide-to-order", required: 12 },
      { materialId: "philosophies-of-order", required: 114 },
      { materialId: "mechanical-spur-gear", required: 18 },
      { materialId: "artificed-dynamic-gear", required: 66 },
      { materialId: "everamber", required: 18 },
      { materialId: "crown-of-insight", required: 3 },
    ],
  },
];