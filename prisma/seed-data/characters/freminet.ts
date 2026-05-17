import type { SeedCharacter, SeedCharacterGoalTemplate } from "../types";

export const freminet: SeedCharacter = {
  id: "freminet",
  name: "Freminet",
  image: "https://enka.network/ui/UI_AvatarIcon_Freminet.png",
  rarity: 4,
  element: "Cryo",
  weaponType: "Claymore",
  region: "Fontaine",
};

export const freminetGoalTemplates: SeedCharacterGoalTemplate[] = [
  // Ascension 1
  {
    characterId: "freminet",
    name: "Ascension 1 (Lv. 20 → 40)",
    description: "First ascension materials for Freminet",
    category: "ascension",
    sortOrder: 1,
    materials: [
      { materialId: "shivada-jade-sliver", required: 1 },
      { materialId: "romaritime-flower", required: 3 },
      { materialId: "transoceanic-pearl", required: 3 },
    ],
  },
  // Ascension 2
  {
    characterId: "freminet",
    name: "Ascension 2 (Lv. 40 → 50)",
    description: "Second ascension materials for Freminet",
    category: "ascension",
    sortOrder: 2,
    materials: [
      { materialId: "shivada-jade-fragment", required: 3 },
      { materialId: "artificed-spare-clockwork-component-coppelius", required: 2 },
      { materialId: "romaritime-flower", required: 10 },
      { materialId: "transoceanic-pearl", required: 15 },
    ],
  },
  // Ascension 3
  {
    characterId: "freminet",
    name: "Ascension 3 (Lv. 50 → 60)",
    description: "Third ascension materials for Freminet",
    category: "ascension",
    sortOrder: 3,
    materials: [
      { materialId: "shivada-jade-fragment", required: 6 },
      { materialId: "artificed-spare-clockwork-component-coppelius", required: 4 },
      { materialId: "romaritime-flower", required: 20 },
      { materialId: "transoceanic-chunk", required: 12 },
    ],
  },
  // Ascension 4
  {
    characterId: "freminet",
    name: "Ascension 4 (Lv. 60 → 70)",
    description: "Fourth ascension materials for Freminet",
    category: "ascension",
    sortOrder: 4,
    materials: [
      { materialId: "shivada-jade-chunk", required: 3 },
      { materialId: "artificed-spare-clockwork-component-coppelius", required: 8 },
      { materialId: "romaritime-flower", required: 30 },
      { materialId: "transoceanic-chunk", required: 18 },
    ],
  },
  // Ascension 5
  {
    characterId: "freminet",
    name: "Ascension 5 (Lv. 70 → 80)",
    description: "Fifth ascension materials for Freminet",
    category: "ascension",
    sortOrder: 5,
    materials: [
      { materialId: "shivada-jade-chunk", required: 6 },
      { materialId: "artificed-spare-clockwork-component-coppelius", required: 12 },
      { materialId: "romaritime-flower", required: 45 },
      { materialId: "xenochromatic-crystal", required: 12 },
    ],
  },
  // Ascension 6
  {
    characterId: "freminet",
    name: "Ascension 6 (Lv. 80 → 90)",
    description: "Sixth ascension materials for Freminet",
    category: "ascension",
    sortOrder: 6,
    materials: [
      { materialId: "shivada-jade-gemstone", required: 6 },
      { materialId: "artificed-spare-clockwork-component-coppelius", required: 20 },
      { materialId: "romaritime-flower", required: 60 },
      { materialId: "xenochromatic-crystal", required: 24 },
    ],
  },
  // All Talents 1 → 6
  {
    characterId: "freminet",
    name: "All Talents Level 1 → 6",
    description: "Materials to level all three talents from 1 to 6",
    category: "talent",
    sortOrder: 1,
    materials: [
      { materialId: "teachings-of-justice", required: 9 },
      { materialId: "guide-to-justice", required: 63 },
      { materialId: "transoceanic-pearl", required: 18 },
      { materialId: "transoceanic-chunk", required: 66 },
    ],
  },
  // Single Talent 6 → 10
  {
    characterId: "freminet",
    name: "Single Talent Level 6 → 10",
    description: "Materials to max one talent from level 6 to 10",
    category: "talent",
    sortOrder: 2,
    materials: [
      { materialId: "guide-to-justice", required: 4 },
      { materialId: "philosophies-of-justice", required: 38 },
      { materialId: "transoceanic-chunk", required: 6 },
      { materialId: "xenochromatic-crystal", required: 22 },
      { materialId: "worldspan-fern", required: 6 },
      { materialId: "crown-of-insight", required: 1 },
    ],
  },
  // Triple Crown 6 → 10
  {
    characterId: "freminet",
    name: "Triple Crown (All Talents 6 → 10)",
    description: "Materials to max all three talents from level 6 to 10",
    category: "talent",
    sortOrder: 3,
    materials: [
      { materialId: "guide-to-justice", required: 12 },
      { materialId: "philosophies-of-justice", required: 114 },
      { materialId: "transoceanic-chunk", required: 18 },
      { materialId: "xenochromatic-crystal", required: 66 },
      { materialId: "worldspan-fern", required: 18 },
      { materialId: "crown-of-insight", required: 3 },
    ],
  },
];