"use client";

import { useMemo } from "react";

import {
  useStaticCharacters,
  useStaticMaterials,
  useStaticWeapons,
} from "@/lib/cached-data";

/**
 * Builds the character/weapon/material lookup maps the Markdown component
 * needs to render `[type:id]` item references as icon cards. Shared by every
 * surface that renders AI output (the assistant chat, the floating modal,
 * and the Battle Coach plan) so they all resolve items identically.
 */
export function useItemDataMaps() {
  const { data: charactersData } = useStaticCharacters();
  const { data: weaponsData } = useStaticWeapons();
  const { data: materialsData } = useStaticMaterials();

  return useMemo(() => {
    const charactersMap = new Map();
    const weaponsMap = new Map();
    const materialsMap = new Map();

    if (charactersData?.characters) {
      charactersData.characters.forEach((char) => {
        charactersMap.set(char.id, {
          id: char.id,
          name: char.name,
          image: char.image,
          rarity: char.rarity,
          element: char.element,
          weaponType: char.weaponType,
        });
      });
    }

    if (weaponsData?.weapons) {
      weaponsData.weapons.forEach((weapon) => {
        weaponsMap.set(weapon.id, {
          id: weapon.id,
          name: weapon.name,
          image: weapon.image,
          rarity: weapon.rarity,
          weaponType: weapon.weaponType,
        });
      });
    }

    if (materialsData?.materials) {
      materialsData.materials.forEach((material) => {
        materialsMap.set(material.id, {
          id: material.id,
          name: material.name,
          image: material.image,
          rarity: material.rarity,
          category: material.category,
        });
      });
    }

    return {
      characters: charactersMap,
      weapons: weaponsMap,
      materials: materialsMap,
    };
  }, [charactersData, weaponsData, materialsData]);
}
