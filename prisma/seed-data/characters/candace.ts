import type { SeedCharacter, SeedCharacterGoalTemplate } from "../types";

export const candace: SeedCharacter = {
  id: "candace",
  name: "Candace",
  image: "https://enka.network/ui/UI_AvatarIcon_Candace.png",
  rarity: 4,
  element: "Hydro",
  weaponType: "Polearm",
  region: "Sumeru",
};

export const candaceGoalTemplates: SeedCharacterGoalTemplate[] = [
  // Ascension 1
  {
    characterId: "candace",
    name: "Ascension 1 (Lv. 20 → 40)",
    description: "First ascension materials for Candace",
    category: "ascension",
    sortOrder: 1,
    materials: [
      { materialId: "varunada-lazurite-sliver", required: 1 },
      { materialId: "henna-berry", required: 3 },
      { materialId: "faded-red-satin", required: 3 },
    ],
  },
  // Ascension 2
  {
    characterId: "candace",
    name: "Ascension 2 (Lv. 40 → 50)",
    description: "Second ascension materials for Candace",
    category: "ascension",
    sortOrder: 2,
    materials: [
      { materialId: "varunada-lazurite-fragment", required: 3 },
      { materialId: "light-guiding-tetrahedron", required: 2 },
      { materialId: "henna-berry", required: 10 },
      { materialId: "faded-red-satin", required: 15 },
    ],
  },
  // Ascension 3
  {
    characterId: "candace",
    name: "Ascension 3 (Lv. 50 → 60)",
    description: "Third ascension materials for Candace",
    category: "ascension",
    sortOrder: 3,
    materials: [
      { materialId: "varunada-lazurite-fragment", required: 6 },
      { materialId: "light-guiding-tetrahedron", required: 4 },
      { materialId: "henna-berry", required: 20 },
      { materialId: "trimmed-red-silk", required: 12 },
    ],
  },
  // Ascension 4
  {
    characterId: "candace",
    name: "Ascension 4 (Lv. 60 → 70)",
    description: "Fourth ascension materials for Candace",
    category: "ascension",
    sortOrder: 4,
    materials: [
      { materialId: "varunada-lazurite-chunk", required: 3 },
      { materialId: "light-guiding-tetrahedron", required: 8 },
      { materialId: "henna-berry", required: 30 },
      { materialId: "trimmed-red-silk", required: 18 },
    ],
  },
  // Ascension 5
  {
    characterId: "candace",
    name: "Ascension 5 (Lv. 70 → 80)",
    description: "Fifth ascension materials for Candace",
    category: "ascension",
    sortOrder: 5,
    materials: [
      { materialId: "varunada-lazurite-chunk", required: 6 },
      { materialId: "light-guiding-tetrahedron", required: 12 },
      { materialId: "henna-berry", required: 45 },
      { materialId: "rich-red-brocade", required: 12 },
    ],
  },
  // Ascension 6
  {
    characterId: "candace",
    name: "Ascension 6 (Lv. 80 → 90)",
    description: "Sixth ascension materials for Candace",
    category: "ascension",
    sortOrder: 6,
    materials: [
      { materialId: "varunada-lazurite-gemstone", required: 6 },
      { materialId: "light-guiding-tetrahedron", required: 20 },
      { materialId: "henna-berry", required: 60 },
      { materialId: "rich-red-brocade", required: 24 },
    ],
  },
  // All Talents 1 → 6
  {
    characterId: "candace",
    name: "All Talents Level 1 → 6",
    description: "Materials to level all three talents from 1 to 6",
    category: "talent",
    sortOrder: 1,
    materials: [
      { materialId: "teachings-of-admonition", required: 9 },
      { materialId: "guide-to-admonition", required: 63 },
      { materialId: "faded-red-satin", required: 18 },
      { materialId: "trimmed-red-silk", required: 66 },
    ],
  },
  // Single Talent 6 → 10
  {
    characterId: "candace",
    name: "Single Talent Level 6 → 10",
    description: "Materials to max one talent from level 6 to 10",
    category: "talent",
    sortOrder: 2,
    materials: [
      { materialId: "guide-to-admonition", required: 4 },
      { materialId: "philosophies-of-admonition", required: 38 },
      { materialId: "trimmed-red-silk", required: 6 },
      { materialId: "rich-red-brocade", required: 22 },
      { materialId: "tears-of-the-calamitous-god", required: 6 },
      { materialId: "crown-of-insight", required: 1 },
    ],
  },
  // Triple Crown 6 → 10
  {
    characterId: "candace",
    name: "Triple Crown (All Talents 6 → 10)",
    description: "Materials to max all three talents from level 6 to 10",
    category: "talent",
    sortOrder: 3,
    materials: [
      { materialId: "guide-to-admonition", required: 12 },
      { materialId: "philosophies-of-admonition", required: 114 },
      { materialId: "trimmed-red-silk", required: 18 },
      { materialId: "rich-red-brocade", required: 66 },
      { materialId: "tears-of-the-calamitous-god", required: 18 },
      { materialId: "crown-of-insight", required: 3 },
    ],
  },
];