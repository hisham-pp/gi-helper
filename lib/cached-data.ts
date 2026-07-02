"use client";

import { useCachedData } from "./use-cached-data";

/**
 * Hook for fetching cooking ingredients data with caching
 */
export function useCookingIngredients() {
  return useCachedData<Record<string, { name: string; description?: string; rarity?: number; sources?: string[] }>>({
    url: "/api/data/materials",
    cacheKey: "cooking-ingredients",
  });
}

/**
 * Hook for fetching a single cooking ingredient by ID with caching
 */
export function useCookingIngredientById(ingredientId: string) {
  return useCachedData<{
    id: string;
    name: string;
    image: string;
    rarity: number;
    category: string;
    description: string;
    combinable: boolean;
    combineRatio: number | null;
    parentMaterialId: string | null;
    details: Record<string, unknown>;
  }>({
    url: `/api/data/material/${ingredientId}`,
    cacheKey: `cooking-ingredient-${ingredientId}`,
  });
}

/**
 * Hook for fetching food data with caching
 */
export function useFoodData() {
  return useCachedData<Record<string, {
    name: string;
    rarity: number;
    type: string;
    effect?: string;
    hasRecipe?: boolean;
    description: string;
    proficiency?: number | string;
    baseDish?: string;
    recipe?: Array<{ item: string; quantity: number }>;
  }>>({
    url: "/api/data/food",
    cacheKey: "food-data",
  });
}

/**
 * Hook for fetching a single food item by ID with caching
 */
export function useFoodById(foodId: string) {
  return useCachedData<{
    name: string;
    rarity: number;
    type: string;
    effect?: string;
    hasRecipe?: boolean;
    description: string;
    proficiency?: number | string;
    baseDish?: string;
    recipe?: Array<{ item: string; quantity: number }>;
  }>({
    url: `/api/data/food/${foodId}`,
    cacheKey: `food-${foodId}`,
  });
}

/**
 * Hook for fetching collectibles data with caching
 */
export function useCollectiblesData() {
  return useCachedData<Array<{
    id: string;
    label: string;
    kind: "anemoculus" | "geoculus" | "crimson-agate";
    region: "mondstadt" | "liyue" | "dragonspine";
    layer: "teyvat" | "underground";
    x: number;
    y: number;
    sourceId: number;
    sourceCoordinates: [number, number];
    hint: string;
    routeNote: string;
  }>>({
    url: "/api/data/collectibles",
    cacheKey: "collectibles-data",
  });
}

/**
 * Hook for fetching boss material data with caching
 */
export function useBossMaterialData() {
  return useCachedData<Record<string, {
    items?: Array<{ id?: string; name?: string; rarity?: number }>;
    sources?: string[];
    name?: string;
    rarity?: number;
    source?: string;
  }>>({
    url: "/api/data/boss-material",
    cacheKey: "boss-material-data",
  });
}

/**
 * Hook for fetching common ascension data with caching
 */
export function useCommonAscensionData() {
  return useCachedData<Record<string, {
    items?: Array<{ id?: string; name?: string; rarity?: number }>;
    sources?: string[];
    name?: string;
    rarity?: number;
    source?: string;
  }>>({
    url: "/api/data/common-ascension",
    cacheKey: "common-ascension-data",
  });
}

/**
 * Hook for fetching static characters data with caching
 */
export function useStaticCharacters() {
  return useCachedData<{ characters: Array<{
    id: string;
    name: string;
    rarity: number;
    element: string;
    weaponType: string;
    region: string;
    image: string;
    portrait: string;
    description: string;
    details: Record<string, unknown>;
    assets: Array<{ id: string; name: string; image: string }>;
    templates: Array<{
      id: string;
      name: string;
      description: string | null;
      category: string;
      sortOrder: number;
      materials: Array<{
        id: string;
        templateId: string;
        materialId: string;
        required: number;
        material: {
          id: string;
          name: string;
          image: string;
          rarity: number;
        };
      }>;
    }>;
  }> }>({
    url: "/api/data/characters",
    cacheKey: "static-characters",
  });
}

/**
 * Hook for fetching a single character by ID with caching
 */
export function useCharacterById(characterId: string) {
  return useCachedData<{
    id: string;
    name: string;
    rarity: number;
    element: string;
    weaponType: string;
    region: string;
    image: string;
    portrait: string;
    description: string;
    details: Record<string, unknown>;
    assets: Array<{ id: string; name: string; image: string }>;
    templates: Array<{
      id: string;
      name: string;
      description: string | null;
      category: string;
      sortOrder: number;
      materials: Array<{
        id: string;
        templateId: string;
        materialId: string;
        required: number;
        material: {
          id: string;
          name: string;
          image: string;
          rarity: number;
        };
      }>;
    }>;
  }>({
    url: `/api/data/character/${characterId}`,
    cacheKey: `character-${characterId}`,
  });
}

/**
 * Hook for fetching a single character goal template by ID with caching
 */
export function useCharacterGoalTemplateById(templateId: string) {
  return useCachedData<{
    id: string;
    name: string;
    description: string | null;
    category: string;
    sortOrder: number;
    characterId?: string;
    materials: Array<{
      id: string;
      templateId: string;
      materialId: string;
      required: number;
      material: {
        id: string;
        name: string;
        image: string;
        rarity: number;
      };
    }>;
  }>({
    url: `/api/data/character-template/${templateId}`,
    cacheKey: `character-template-${templateId}`,
  });
}

/**
 * Hook for fetching static materials data with caching
 */
export function useStaticMaterials() {
  return useCachedData<{ materials: Array<{
    id: string;
    name: string;
    image: string;
    rarity: number;
    category: string;
    description: string;
    combinable: boolean;
    combineRatio: number | null;
    parentMaterialId: string | null;
    details: Record<string, unknown>;
  }> }>({
    url: "/api/data/static-materials",
    cacheKey: "static-materials",
  });
}

/**
 * Hook for fetching a single material by ID with caching
 */
export function useMaterialById(materialId: string) {
  return useCachedData<{
    id: string;
    name: string;
    image: string;
    rarity: number;
    category: string;
    description: string;
    combinable: boolean;
    combineRatio: number | null;
    parentMaterialId: string | null;
    details: Record<string, unknown>;
  }>({
    url: `/api/data/material/${materialId}`,
    cacheKey: `material-${materialId}`,
  });
}

/**
 * Hook for fetching static weapons data with caching
 */
export function useStaticWeapons() {
  return useCachedData<{ weapons: Array<{
    id: string;
    name: string;
    image: string;
    rarity: number;
    weaponType: string;
    baseAttack: number;
    subStat: string;
    subStatValue: number;
    description: string;
    templates: Array<{
      id: string;
      name: string;
      description: string | null;
      category: string;
      sortOrder: number;
      materials: Array<{
        id: string;
        templateId: string;
        materialId: string;
        required: number;
        material: {
          id: string;
          name: string;
          image: string;
          rarity: number;
        };
      }>;
    }>;
  }> }>({
    url: "/api/data/weapons",
    cacheKey: "static-weapons",
  });
}

/**
 * Hook for fetching a single weapon by ID with caching
 */
export function useWeaponById(weaponId: string) {
  return useCachedData<{
    id: string;
    name: string;
    image: string;
    rarity: number;
    weaponType: string;
    baseAttack: number;
    subStat: string;
    subStatValue: number;
    description: string;
    templates: Array<{
      id: string;
      name: string;
      description: string | null;
      category: string;
      sortOrder: number;
      materials: Array<{
        id: string;
        templateId: string;
        materialId: string;
        required: number;
        material: {
          id: string;
          name: string;
          image: string;
          rarity: number;
        };
      }>;
    }>;
  }>({
    url: `/api/data/weapon/${weaponId}`,
    cacheKey: `weapon-${weaponId}`,
  });
}

/**
 * Hook for fetching a single weapon goal template by ID with caching
 */
export function useWeaponGoalTemplateById(templateId: string) {
  return useCachedData<{
    id: string;
    name: string;
    description: string | null;
    category: string;
    sortOrder: number;
    weaponId?: string;
    materials: Array<{
      id: string;
      templateId: string;
      materialId: string;
      required: number;
      material: {
        id: string;
        name: string;
        image: string;
        rarity: number;
      };
    }>;
  }>({
    url: `/api/data/weapon-template/${templateId}`,
    cacheKey: `weapon-template-${templateId}`,
  });
}

/**
 * Hook for fetching enemies data with caching
 */
export function useEnemiesData() {
  return useCachedData<{ enemies: Array<{
    id: string;
    name: string;
    type: string;
    family: string;
    faction: string | null;
    region: string;
    description: string;
    elements: string[];
    bestElements: string[];
    materials: Array<{
      id: string | null;
      name: string;
      rarity: number | null;
      minimumLevel: number | null;
      source: string | null;
    }>;
    image: string | null;
    portrait: string | null;
    sourceUrl: string | null;
    advice: Array<{
      element: string;
      bestElements: string[];
      note: string;
    }>;
  }> }>({
    url: "/api/data/enemies",
    cacheKey: "enemies-data",
  });
}

/**
 * Hook for fetching a single enemy by ID with caching
 */
export function useEnemyById(enemyId: string) {
  return useCachedData<{
    id: string;
    name: string;
    type: string;
    family: string;
    faction: string | null;
    region: string;
    description: string;
    elements: string[];
    bestElements: string[];
    materials: Array<{
      id: string | null;
      name: string;
      rarity: number | null;
      minimumLevel: number | null;
      source: string | null;
    }>;
    image: string | null;
    portrait: string | null;
    sourceUrl: string | null;
    advice: Array<{
      element: string;
      bestElements: string[];
      note: string;
    }>;
  }>({
    url: `/api/data/enemy/${enemyId}`,
    cacheKey: `enemy-${enemyId}`,
  });
}

