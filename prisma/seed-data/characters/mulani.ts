import type { SeedCharacter, SeedCharacterGoalTemplate } from "../types";

export const mualani: SeedCharacter = {
  id: "mualani",
  name: "Mualani",
  image: "https://enka.network/ui/UI_AvatarIcon_Mualani.png",
  rarity: 5,
  element: "Hydro",
  weaponType: "Catalyst",
  region: "Natlan",
};

export const mualaniGoalTemplates: SeedCharacterGoalTemplate[] = [
  // Ascension 1
  {
    characterId: "mualani",
    name: "Ascension 1 (Lv. 20 → 40)",
    description: "First ascension materials for Mualani",
    category: "ascension",
    sortOrder: 1,
    materials: [
      { materialId: "varunada-lazurite-sliver", required: 1 },
      { materialId: "sprayfeather-gill", required: 3 },
      { materialId: "sentrys-wooden-whistle", required: 3 },
    ],
  },
  // Ascension 2
  {
    characterId: "mualani",
    name: "Ascension 2 (Lv. 40 → 50)",
    description: "Second ascension materials for Mualani",
    category: "ascension",
    sortOrder: 2,
    materials: [
      { materialId: "varunada-lazurite-fragment", required: 3 },
      { materialId: "mark-of-the-binding-knot", required: 2 },
      { materialId: "sprayfeather-gill", required: 10 },
      { materialId: "sentrys-wooden-whistle", required: 15 },
    ],
  },
  // Ascension 3
  {
    characterId: "mualani",
    name: "Ascension 3 (Lv. 50 → 60)",
    description: "Third ascension materials for Mualani",
    category: "ascension",
    sortOrder: 3,
    materials: [
      { materialId: "varunada-lazurite-fragment", required: 6 },
      { materialId: "mark-of-the-binding-knot", required: 4 },
      { materialId: "sprayfeather-gill", required: 20 },
      { materialId: "warriors-metal-whistle", required: 12 },
    ],
  },
  // Ascension 4
  {
    characterId: "mualani",
    name: "Ascension 4 (Lv. 60 → 70)",
    description: "Fourth ascension materials for Mualani",
    category: "ascension",
    sortOrder: 4,
    materials: [
      { materialId: "varunada-lazurite-chunk", required: 3 },
      { materialId: "mark-of-the-binding-knot", required: 8 },
      { materialId: "sprayfeather-gill", required: 30 },
      { materialId: "warriors-metal-whistle", required: 18 },
    ],
  },
  // Ascension 5
  {
    characterId: "mualani",
    name: "Ascension 5 (Lv. 70 → 80)",
    description: "Fifth ascension materials for Mualani",
    category: "ascension",
    sortOrder: 5,
    materials: [
      { materialId: "varunada-lazurite-chunk", required: 6 },
      { materialId: "mark-of-the-binding-knot", required: 12 },
      { materialId: "sprayfeather-gill", required: 45 },
      { materialId: "saurian-crowned-warriors-whistle", required: 12 },
    ],
  },
  // Ascension 6
  {
    characterId: "mualani",
    name: "Ascension 6 (Lv. 80 → 90)",
    description: "Sixth ascension materials for Mualani",
    category: "ascension",
    sortOrder: 6,
    materials: [
      { materialId: "varunada-lazurite-gemstone", required: 6 },
      { materialId: "mark-of-the-binding-knot", required: 20 },
      { materialId: "sprayfeather-gill", required: 60 },
      { materialId: "saurian-crowned-warriors-whistle", required: 24 },
    ],
  },
  // All Talents 1 → 6
  {
    characterId: "mualani",
    name: "All Talents Level 1 → 6",
    description: "Materials to level all three talents from 1 to 6",
    category: "talent",
    sortOrder: 1,
    materials: [
      { materialId: "teachings-of-contention", required: 9 },
      { materialId: "guide-to-contention", required: 63 },
      { materialId: "sentrys-wooden-whistle", required: 18 },
      { materialId: "warriors-metal-whistle", required: 66 },
    ],
  },
  // Single Talent 6 → 10
  {
    characterId: "mualani",
    name: "Single Talent Level 6 → 10",
    description: "Materials to max one talent from level 6 to 10",
    category: "talent",
    sortOrder: 2,
    materials: [
      { materialId: "guide-to-contention", required: 4 },
      { materialId: "philosophies-of-contention", required: 38 },
      { materialId: "warriors-metal-whistle", required: 6 },
      { materialId: "saurian-crowned-warriors-whistle", required: 22 },
      { materialId: "lightless-mass", required: 6 },
      { materialId: "crown-of-insight", required: 1 },
    ],
  },
  // Triple Crown 6 → 10
  {
    characterId: "mualani",
    name: "Triple Crown (All Talents 6 → 10)",
    description: "Materials to max all three talents from level 6 to 10",
    category: "talent",
    sortOrder: 3,
    materials: [
      { materialId: "guide-to-contention", required: 12 },
      { materialId: "philosophies-of-contention", required: 114 },
      { materialId: "warriors-metal-whistle", required: 18 },
      { materialId: "saurian-crowned-warriors-whistle", required: 66 },
      { materialId: "lightless-mass", required: 18 },
      { materialId: "crown-of-insight", required: 3 },
    ],
  },
];