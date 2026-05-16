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

type FamilyItem = {
  id: string;
  name: string;
  iconId: string;
  rarity: number;
  description: string;
};

export const enkaIcon = (iconId: string) => `https://enka.network/ui/${iconId}.png`;

export function createThreeTierFamily(category: string, items: [FamilyItem, FamilyItem, FamilyItem]): SeedMaterial[] {
  return items.map((item, index) => ({
    id: item.id,
    name: item.name,
    image: enkaIcon(item.iconId),
    rarity: item.rarity,
    category,
    description: item.description,
    combinable: index < items.length - 1,
    combineRatio: index < items.length - 1 ? 3 : null,
    parentMaterialId: index < items.length - 1 ? items[index + 1].id : null
  }));
}
