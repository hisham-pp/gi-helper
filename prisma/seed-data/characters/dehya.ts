import type { SeedCharacter, SeedCharacterGoalTemplate } from "../types";

export const dehya: SeedCharacter = {
  id: "dehya",
  name: "Dehya",
  image: "https://enka.network/ui/UI_AvatarIcon_Dehya.png",
  rarity: 5,
  element: "Pyro",
  weaponType: "Claymore",
  region: "Sumeru",
};

export const dehyaGoalTemplates: SeedCharacterGoalTemplate[] = [
  // Ascension 1
  {
    characterId: "dehya",
    name: "Ascension 1 (Lv. 20 → 40)",
    description: "First ascension materials for Dehya",
    category: "ascension",
    sortOrder: 1,
    materials: [
      { materialId: "agnidus-agate-sliver", required: 1 },
      { materialId: "sand-grease-pupae", required: 3 },
      { materialId: "faded-red-satin", required: 3 },
    ],
  },
  // Ascension 2
  {
    characterId: "dehya",
    name: "Ascension 2 (Lv. 40 → 50)",
    description: "Second ascension materials for Dehya",
    category: "ascension",
    sortOrder: 2,
    materials: [
      { materialId: "agnidus-agate-fragment", required: 3 },
      { materialId: "light-guiding-tetrahedron", required: 2 },
      { materialId: "sand-grease-pupae", required: 10 },
      { materialId: "faded-red-satin", required: 15 },
    ],
  },
  // Ascension 3
  {
    characterId: "dehya",
    name: "Ascension 3 (Lv. 50 → 60)",
    description: "Third ascension materials for Dehya",
    category: "ascension",
    sortOrder: 3,
    materials: [
      { materialId: "agnidus-agate-fragment", required: 6 },
      { materialId: "light-guiding-tetrahedron", required: 4 },
      { materialId: "sand-grease-pupae", required: 20 },
      { materialId: "trimmed-red-silk", required: 12 },
    ],
  },
  // Ascension 4
  {
    characterId: "dehya",
    name: "Ascension 4 (Lv. 60 → 70)",
    description: "Fourth ascension materials for Dehya",
    category: "ascension",
    sortOrder: 4,
    materials: [
      { materialId: "agnidus-agate-chunk", required: 3 },
      { materialId: "light-guiding-tetrahedron", required: 8 },
      { materialId: "sand-grease-pupae", required: 30 },
      { materialId: "trimmed-red-silk", required: 18 },
    ],
  },
  // Ascension 5
  {
    characterId: "dehya",
    name: "Ascension 5 (Lv. 70 → 80)",
    description: "Fifth ascension materials for Dehya",
    category: "ascension",
    sortOrder: 5,
    materials: [
      { materialId: "agnidus-agate-chunk", required: 6 },
      { materialId: "light-guiding-tetrahedron", required: 12 },
      { materialId: "sand-grease-pupae", required: 45 },
      { materialId: "rich-red-brocade", required: 12 },
    ],
  },
  // Ascension 6
  {
    characterId: "dehya",
    name: "Ascension 6 (Lv. 80 → 90)",
    description: "Sixth ascension materials for Dehya",
    category: "ascension",
    sortOrder: 6,
    materials: [
      { materialId: "agnidus-agate-gemstone", required: 6 },
      { materialId: "light-guiding-tetrahedron", required: 20 },
      { materialId: "sand-grease-pupae", required: 60 },
      { materialId: "rich-red-brocade", required: 24 },
    ],
  },
  // All Talents 1 → 6
  {
    characterId: "dehya",
    name: "All Talents Level 1 → 6",
    description: "Materials to level all three talents from 1 to 6",
    category: "talent",
    sortOrder: 1,
    materials: [
      { materialId: "teachings-of-praxis", required: 9 },
      { materialId: "guide-to-praxis", required: 63 },
      { materialId: "faded-red-satin", required: 18 },
      { materialId: "trimmed-red-silk", required: 66 },
    ],
  },
  // Single Talent 6 → 10
  {
    characterId: "dehya",
    name: "Single Talent Level 6 → 10",
    description: "Materials to max one talent from level 6 to 10",
    category: "talent",
    sortOrder: 2,
    materials: [
      { materialId: "guide-to-praxis", required: 4 },
      { materialId: "philosophies-of-praxis", required: 38 },
      { materialId: "trimmed-red-silk", required: 6 },
      { materialId: "rich-red-brocade", required: 22 },
      { materialId: "puppet-strings", required: 6 },
      { materialId: "crown-of-insight", required: 1 },
    ],
  },
  // Triple Crown 6 → 10
  {
    characterId: "dehya",
    name: "Triple Crown (All Talents 6 → 10)",
    description: "Materials to max all three talents from level 6 to 10",
    category: "talent",
    sortOrder: 3,
    materials: [
      { materialId: "guide-to-praxis", required: 12 },
      { materialId: "philosophies-of-praxis", required: 114 },
      { materialId: "trimmed-red-silk", required: 18 },
      { materialId: "rich-red-brocade", required: 66 },
      { materialId: "puppet-strings", required: 18 },
      { materialId: "crown-of-insight", required: 3 },
    ],
  },
];
