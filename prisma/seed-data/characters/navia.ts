import type { SeedCharacter, SeedCharacterGoalTemplate } from "../types";

export const navia: SeedCharacter = {
  id: "navia",
  name: "Navia",
  image: "https://enka.network/ui/UI_AvatarIcon_Navia.png",
  rarity: 5,
  element: "Geo",
  weaponType: "Claymore",
  region: "Fontaine",
};

export const naviaGoalTemplates: SeedCharacterGoalTemplate[] = [
  {
    characterId: "navia",
    name: "Ascension 1 (Lv. 20 → 40)",
    description: "First ascension materials for Navia",
    category: "ascension",
    sortOrder: 1,
    materials: [
      { materialId: "prithiva-topaz-sliver", required: 1 },
      { materialId: "spring-of-the-first-dewdrop", required: 3 },
      { materialId: "transoceanic-pearl", required: 3 },
    ],
  },
  {
    characterId: "navia",
    name: "Ascension 2 (Lv. 40 → 50)",
    description: "Second ascension materials for Navia",
    category: "ascension",
    sortOrder: 2,
    materials: [
      { materialId: "prithiva-topaz-fragment", required: 3 },
      {
        materialId: "artificed-spare-clockwork-component-coppelius",
        required: 2,
      },
      { materialId: "spring-of-the-first-dewdrop", required: 10 },
      { materialId: "transoceanic-pearl", required: 15 },
    ],
  },
  {
    characterId: "navia",
    name: "Ascension 3 (Lv. 50 → 60)",
    description: "Third ascension materials for Navia",
    category: "ascension",
    sortOrder: 3,
    materials: [
      { materialId: "prithiva-topaz-fragment", required: 6 },
      {
        materialId: "artificed-spare-clockwork-component-coppelius",
        required: 4,
      },
      { materialId: "spring-of-the-first-dewdrop", required: 20 },
      { materialId: "transoceanic-chunk", required: 12 },
    ],
  },
  {
    characterId: "navia",
    name: "Ascension 4 (Lv. 60 → 70)",
    description: "Fourth ascension materials for Navia",
    category: "ascension",
    sortOrder: 4,
    materials: [
      { materialId: "prithiva-topaz-chunk", required: 3 },
      {
        materialId: "artificed-spare-clockwork-component-coppelius",
        required: 8,
      },
      { materialId: "spring-of-the-first-dewdrop", required: 30 },
      { materialId: "transoceanic-chunk", required: 18 },
    ],
  },
  {
    characterId: "navia",
    name: "Ascension 5 (Lv. 70 → 80)",
    description: "Fifth ascension materials for Navia",
    category: "ascension",
    sortOrder: 5,
    materials: [
      { materialId: "prithiva-topaz-chunk", required: 6 },
      {
        materialId: "artificed-spare-clockwork-component-coppelius",
        required: 12,
      },
      { materialId: "spring-of-the-first-dewdrop", required: 45 },
      { materialId: "xenochromatic-crystal", required: 12 },
    ],
  },
  {
    characterId: "navia",
    name: "Ascension 6 (Lv. 80 → 90)",
    description: "Sixth ascension materials for Navia",
    category: "ascension",
    sortOrder: 6,
    materials: [
      { materialId: "prithiva-topaz-gemstone", required: 6 },
      {
        materialId: "artificed-spare-clockwork-component-coppelius",
        required: 20,
      },
      { materialId: "spring-of-the-first-dewdrop", required: 60 },
      { materialId: "xenochromatic-crystal", required: 24 },
    ],
  },
  {
    characterId: "navia",
    name: "All Talents Level 1 → 6",
    description: "Materials to level all three talents from 1 to 6",
    category: "talent",
    sortOrder: 1,
    materials: [
      { materialId: "teachings-of-equity", required: 9 },
      { materialId: "guide-to-equity", required: 63 },
      { materialId: "transoceanic-pearl", required: 18 },
      { materialId: "transoceanic-chunk", required: 66 },
    ],
  },
  {
    characterId: "navia",
    name: "Single Talent Level 6 → 10",
    description: "Materials to max one talent from level 6 to 10",
    category: "talent",
    sortOrder: 2,
    materials: [
      { materialId: "guide-to-equity", required: 4 },
      { materialId: "philosophies-of-equity", required: 38 },
      { materialId: "transoceanic-chunk", required: 6 },
      { materialId: "xenochromatic-crystal", required: 22 },
      { materialId: "lightless-silk-string", required: 6 },
      { materialId: "crown-of-insight", required: 1 },
    ],
  },
  {
    characterId: "navia",
    name: "Triple Crown (All Talents 6 → 10)",
    description: "Materials to max all three talents from level 6 to 10",
    category: "talent",
    sortOrder: 3,
    materials: [
      { materialId: "guide-to-equity", required: 12 },
      { materialId: "philosophies-of-equity", required: 114 },
      { materialId: "transoceanic-chunk", required: 18 },
      { materialId: "xenochromatic-crystal", required: 66 },
      { materialId: "lightless-silk-string", required: 18 },
      { materialId: "crown-of-insight", required: 3 },
    ],
  },
];
