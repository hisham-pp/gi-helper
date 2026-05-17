export type SeedWeapon = {
  id: string;
  name: string;
  image: string;
  rarity: number;
  weaponType: string;
};

export const weapons: SeedWeapon[] = [
  {
    id: "mistsplitter",
    name: "Mistsplitter Reforged",
    image: "https://enka.network/ui/UI_EquipIcon_Sword_Narukami.png",
    rarity: 5,
    weaponType: "Sword",
  },
  {
    id: "homa",
    name: "Staff of Homa",
    image: "https://enka.network/ui/UI_EquipIcon_Pole_Homa.png",
    rarity: 5,
    weaponType: "Polearm",
  },
  {
    id: "thundering-pulse",
    name: "Thundering Pulse",
    image: "https://enka.network/ui/UI_EquipIcon_Bow_Narukami.png",
    rarity: 5,
    weaponType: "Bow",
  },
  {
    id: "kaguras-verity",
    name: "Kagura's Verity",
    image: "https://enka.network/ui/UI_EquipIcon_Catalyst_Yae.png",
    rarity: 5,
    weaponType: "Catalyst",
  },
  {
    id: "prototype-rancour",
    name: "Prototype Rancour",
    image: "https://enka.network/ui/UI_EquipIcon_Sword_Proto.png",
    rarity: 4,
    weaponType: "Sword",
  },
  {
    id: "favonius-lance",
    name: "Favonius Lance",
    image: "https://enka.network/ui/UI_EquipIcon_Pole_Zephyrus.png",
    rarity: 4,
    weaponType: "Polearm",
  },
];
