import { type SeedMaterial, enkaIcon } from "@/prisma/seed-data/helpers";

function createGemFamily(
  element: string,
  gemName: string,
  iconBase: string,
): SeedMaterial[] {
  return [
    {
      id: `${gemName}-sliver`,
      name: `${element} Sliver`,
      image: enkaIcon(`${iconBase}1`),
      rarity: 2,
      category: "Gem",
      description: `A small ${element.toLowerCase()} gem fragment.`,
      combinable: true,
      combineRatio: 3,
      parentMaterialId: `${gemName}-fragment`,
    },
    {
      id: `${gemName}-fragment`,
      name: `${element} Fragment`,
      image: enkaIcon(`${iconBase}2`),
      rarity: 3,
      category: "Gem",
      description: `A ${element.toLowerCase()} gem fragment.`,
      combinable: true,
      combineRatio: 3,
      parentMaterialId: `${gemName}-chunk`,
    },
    {
      id: `${gemName}-chunk`,
      name: `${element} Chunk`,
      image: enkaIcon(`${iconBase}3`),
      rarity: 4,
      category: "Gem",
      description: `A ${element.toLowerCase()} gem chunk.`,
      combinable: true,
      combineRatio: 3,
      parentMaterialId: `${gemName}-gemstone`,
    },
    {
      id: `${gemName}-gemstone`,
      name: `${element} Gemstone`,
      image: enkaIcon(`${iconBase}4`),
      rarity: 5,
      category: "Gem",
      description: `A brilliant ${element.toLowerCase()} gemstone.`,
      combinable: false,
      combineRatio: null,
      parentMaterialId: null,
    },
  ];
}

export const gemMaterials: SeedMaterial[] = [
  ...createGemFamily("Agnidus Agate", "agnidus-agate", "UI_ItemIcon_10401"),
  ...createGemFamily(
    "Varunada Lazurite",
    "varunada-lazurite",
    "UI_ItemIcon_10402",
  ),
  ...createGemFamily(
    "Vajrada Amethyst",
    "vajrada-amethyst",
    "UI_ItemIcon_10403",
  ),
  ...createGemFamily(
    "Vayuda Turquoise",
    "vayuda-turquoise",
    "UI_ItemIcon_10404",
  ),
  ...createGemFamily("Shivada Jade", "shivada-jade", "UI_ItemIcon_10405"),
  ...createGemFamily("Prithiva Topaz", "prithiva-topaz", "UI_ItemIcon_10406"),
  ...createGemFamily("Nagadus Emerald", "nagadus-emerald", "UI_ItemIcon_10407"),
];
