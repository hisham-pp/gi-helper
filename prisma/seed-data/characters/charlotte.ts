import type { SeedCharacter, SeedCharacterGoalTemplate } from "../types";

export const charlotte: SeedCharacter = {
  id: "charlotte",
  name: "Charlotte",
  image: "https://enka.network/ui/UI_AvatarIcon_Charlotte.png",
  rarity: 4,
  element: "Cryo",
  weaponType: "Catalyst",
  region: "Fontaine",
};

export const charlotteGoalTemplates: SeedCharacterGoalTemplate[] = [
  // Ascension 1
  {
    characterId: "charlotte",
    name: "Ascension 1 (Lv. 20 → 40)",
    description: "First ascension materials for Charlotte",
    category: "ascension",
    sortOrder: 1,
    materials: [
      { materialId: "shivada-jade-sliver", required: 1 },
      { materialId: "berryl-conch", required: 3 },
      { materialId: "meshing-gear", required: 3 },
    ],
  },
  // Ascension 2
  {
    characterId: "charlotte",
    name: "Ascension 2 (Lv. 40 → 50)",
    description: "Second ascension materials for Charlotte",
    category: "ascension",
    sortOrder: 2,
    materials: [
      { materialId: "shivada-jade-fragment", required: 3 },
      { materialId: "tourbillon-device", required: 2 },
      { materialId: "berryl-conch", required: 10 },
      { materialId: "meshing-gear", required: 15 },
    ],
  },
  // Ascension 3
  {
    characterId: "charlotte",
    name: "Ascension 3 (Lv. 50 → 60)",
    description: "Third ascension materials for Charlotte",
    category: "ascension",
    sortOrder: 3,
    materials: [
      { materialId: "shivada-jade-fragment", required: 6 },
      { materialId: "tourbillon-device", required: 4 },
      { materialId: "berryl-conch", required: 20 },
      { materialId: "mechanical-spur-gear", required: 12 },
    ],
  },
  // Ascension 4
  {
    characterId: "charlotte",
    name: "Ascension 4 (Lv. 60 → 70)",
    description: "Fourth ascension materials for Charlotte",
    category: "ascension",
    sortOrder: 4,
    materials: [
      { materialId: "shivada-jade-chunk", required: 3 },
      { materialId: "tourbillon-device", required: 8 },
      { materialId: "berryl-conch", required: 30 },
      { materialId: "mechanical-spur-gear", required: 18 },
    ],
  },
  // Ascension 5
  {
    characterId: "charlotte",
    name: "Ascension 5 (Lv. 70 → 80)",
    description: "Fifth ascension materials for Charlotte",
    category: "ascension",
    sortOrder: 5,
    materials: [
      { materialId: "shivada-jade-chunk", required: 6 },
      { materialId: "tourbillon-device", required: 12 },
      { materialId: "berryl-conch", required: 45 },
      { materialId: "artificed-dynamic-gear", required: 12 },
    ],
  },
  // Ascension 6
  {
    characterId: "charlotte",
    name: "Ascension 6 (Lv. 80 → 90)",
    description: "Sixth ascension materials for Charlotte",
    category: "ascension",
    sortOrder: 6,
    materials: [
      { materialId: "shivada-jade-gemstone", required: 6 },
      { materialId: "tourbillon-device", required: 20 },
      { materialId: "berryl-conch", required: 60 },
      { materialId: "artificed-dynamic-gear", required: 24 },
    ],
  },
  // All Talents 1 → 6
  {
    characterId: "charlotte",
    name: "All Talents Level 1 → 6",
    description: "Materials to level all three talents from 1 to 6",
    category: "talent",
    sortOrder: 1,
    materials: [
      { materialId: "teachings-of-justice", required: 9 },
      { materialId: "guide-to-justice", required: 63 },
      { materialId: "meshing-gear", required: 18 },
      { materialId: "mechanical-spur-gear", required: 66 },
    ],
  },
  // Single Talent 6 → 10
  {
    characterId: "charlotte",
    name: "Single Talent Level 6 → 10",
    description: "Materials to max one talent from level 6 to 10",
    category: "talent",
    sortOrder: 2,
    materials: [
      { materialId: "guide-to-justice", required: 4 },
      { materialId: "philosophies-of-justice", required: 38 },
      { materialId: "mechanical-spur-gear", required: 6 },
      { materialId: "artificed-dynamic-gear", required: 22 },
      { materialId: "lightless-eye-of-the-maelstrom", required: 6 },
      { materialId: "crown-of-insight", required: 1 },
    ],
  },
  // Triple Crown 6 → 10
  {
    characterId: "charlotte",
    name: "Triple Crown (All Talents 6 → 10)",
    description: "Materials to max all three talents from level 6 to 10",
    category: "talent",
    sortOrder: 3,
    materials: [
      { materialId: "guide-to-justice", required: 12 },
      { materialId: "philosophies-of-justice", required: 114 },
      { materialId: "mechanical-spur-gear", required: 18 },
      { materialId: "artificed-dynamic-gear", required: 66 },
      { materialId: "lightless-eye-of-the-maelstrom", required: 18 },
      { materialId: "crown-of-insight", required: 3 },
    ],
  },
];