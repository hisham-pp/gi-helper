export type SeedCharacter = {
  id: string;
  name: string;
  image: string;
  rarity: number;
  element: string;
  weaponType: string;
  region: string;
};

export type SeedCharacterGoalTemplate = {
  characterId: string;
  name: string;
  description: string;
  category: string;
  sortOrder: number;
  materials: Array<{
    materialId: string;
    required: number;
  }>;
};

export type SeedWeapon = {
  id: string;
  name: string;
  image: string;
  rarity: number;
  type: string;
};

export type SeedWeaponGoalTemplate = {
  weaponId: string;
  name: string;
  description: string;
  category: string;
  sortOrder: number;
  materials: Array<{
    materialId: string;
    required: number;
  }>;
};

export type SeedMaterial = {
  id: string;
  name: string;
  image: string;
  rarity: number;
  category: string;
  description: string;
  combinable: boolean;
  combineRatio: number | null;
  parentMaterialId: string | null;
};
