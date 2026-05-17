import type { SeedCharacter, SeedCharacterGoalTemplate } from "../types";

export const raiden: SeedCharacter = {
  id: "raiden",
  name: "Raiden Shogun",
  image: "https://enka.network/ui/UI_AvatarIcon_Shougun.png",
  rarity: 5,
  element: "Electro",
  weaponType: "Polearm",
  region: "Inazuma",
};

export const raidenGoalTemplates: SeedCharacterGoalTemplate[] = [
  {
    characterId: "raiden",
    name: "Ascension 1 (Lv. 20 → 40)",
    description: "First ascension materials for Raiden Shogun",
    category: "ascension",
    sortOrder: 1,
    materials: [
      { materialId: "vajrada-amethyst-sliver", required: 1 },
      { materialId: "amakumo-fruit", required: 3 },
      { materialId: "old-handguard", required: 3 },
    ],
  },
  {
    characterId: "raiden",
    name: "All Talents Level 1 → 6",
    description: "Materials to level all talents from 1 to 6",
    category: "talent",
    sortOrder: 1,
    materials: [
      { materialId: "teachings-of-light", required: 9 },
      { materialId: "guide-to-light", required: 63 },
      { materialId: "old-handguard", required: 18 },
      { materialId: "kageuchi-handguard", required: 66 },
    ],
  },
];
