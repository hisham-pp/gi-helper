import type { DashboardData, GoalMaterialView, GoalView, MaterialNode, MaterialView } from "@/lib/types";

type InventoryMap = Record<string, number>;

type MaterialGraph = {
  byId: Record<string, MaterialNode>;
  childrenByParent: Record<string, MaterialNode[]>;
};

function buildGraph(materials: MaterialNode[]): MaterialGraph {
  const byId = Object.fromEntries(materials.map((material) => [material.id, material]));
  const childrenByParent: Record<string, MaterialNode[]> = {};

  for (const material of materials) {
    if (!material.parentMaterialId) {
      continue;
    }

    childrenByParent[material.parentMaterialId] ??= [];
    childrenByParent[material.parentMaterialId].push(material);
  }

  return { byId, childrenByParent };
}

function copyStock(materials: MaterialNode[]): InventoryMap {
  return Object.fromEntries(materials.map((material) => [material.id, material.quantity]));
}

function ensureStock(
  materialId: string,
  minimum: number,
  stock: InventoryMap,
  graph: MaterialGraph
): boolean {
  const children = graph.childrenByParent[materialId] ?? [];
  let safety = 0;

  while ((stock[materialId] ?? 0) < minimum && safety < 50000) {
    let crafted = false;

    for (const child of children) {
      const ratio = child.combineRatio;

      if (!ratio || !child.parentMaterialId) {
        continue;
      }

      if (!ensureStock(child.id, ratio, stock, graph)) {
        continue;
      }

      stock[child.id] -= ratio;
      stock[materialId] = (stock[materialId] ?? 0) + 1;
      crafted = true;
      break;
    }

    if (!crafted) {
      return (stock[materialId] ?? 0) >= minimum;
    }

    safety += 1;
  }

  return (stock[materialId] ?? 0) >= minimum;
}

function countMaximumAvailable(materialId: string, materials: MaterialNode[]) {
  const graph = buildGraph(materials);
  const stock = copyStock(materials);
  let crafted = 0;

  while (ensureStock(materialId, 1, stock, graph)) {
    stock[materialId] -= 1;
    crafted += 1;
  }

  return crafted;
}

function collectDescendants(materialId: string, graph: MaterialGraph, materials: MaterialNode[]) {
  const stock = copyStock(materials);
  const sources: Array<{ materialId: string; materialName: string; quantity: number }> = [];

  for (const material of materials) {
    if (material.id === materialId) {
      continue;
    }

    let parentId = material.parentMaterialId;
    let belongsToTree = false;

    while (parentId) {
      if (parentId === materialId) {
        belongsToTree = true;
        break;
      }

      parentId = graph.byId[parentId]?.parentMaterialId ?? null;
    }

    if (belongsToTree && (stock[material.id] ?? 0) > 0) {
      sources.push({
        materialId: material.id,
        materialName: material.name,
        quantity: stock[material.id]
      });
    }
  }

  return sources;
}

export function getFamilyDepth(materialId: string, byId: Record<string, MaterialNode>) {
  let depth = 0;
  let current = byId[materialId];

  while (current?.parentMaterialId) {
    depth += 1;
    current = byId[current.parentMaterialId];
  }

  return depth;
}

export function buildMaterialViews(materials: MaterialNode[]): MaterialView[] {
  const graph = buildGraph(materials);

  return materials
    .map((material) => {
      const totalCraftable = countMaximumAvailable(material.id, materials);

      return {
        ...material,
        totalCraftable,
        craftableExtra: Math.max(totalCraftable - material.quantity, 0),
        familyDepth: getFamilyDepth(material.id, graph.byId)
      };
    })
    .sort((left, right) => {
      if (left.category !== right.category) {
        return left.category.localeCompare(right.category);
      }

      if (left.rarity !== right.rarity) {
        return right.rarity - left.rarity;
      }

      return left.name.localeCompare(right.name);
    });
}

export function simulateCraftingNeed(materialId: string, requested: number, materials: MaterialNode[]) {
  const graph = buildGraph(materials);
  const stock = copyStock(materials);
  const directOwned = stock[materialId] ?? 0;
  const totalAvailable = countMaximumAvailable(materialId, materials);
  const craftable = totalAvailable >= requested;
  const remaining = Math.max(requested - totalAvailable, 0);
  const surplus = Math.max(totalAvailable - requested, 0);

  if (requested > 0) {
    ensureStock(materialId, Math.min(requested, totalAvailable), stock, graph);
  }

  return {
    materialId,
    requested,
    totalAvailable,
    craftable,
    remaining,
    surplus,
    directOwned,
    recursiveSources: collectDescendants(materialId, graph, materials)
  };
}

export function evaluateGoal(goal: {
  id: string;
  name: string;
  description: string | null;
  materials: Array<{ id: string; materialId: string; required: number }>;
}, materials: MaterialNode[]): GoalView {
  const graph = buildGraph(materials);
  const stock = copyStock(materials);
  const byId = graph.byId;

  const orderedRequirements = [...goal.materials].sort((left, right) => {
    return getFamilyDepth(right.materialId, byId) - getFamilyDepth(left.materialId, byId);
  });

  const evaluated: GoalMaterialView[] = orderedRequirements.map((item) => {
    ensureStock(item.materialId, item.required, stock, graph);

    const allocated = Math.min(stock[item.materialId] ?? 0, item.required);
    stock[item.materialId] = Math.max((stock[item.materialId] ?? 0) - allocated, 0);

    const sourceMaterial = byId[item.materialId];

    return {
      id: item.id,
      materialId: item.materialId,
      materialName: sourceMaterial.name,
      materialImage: sourceMaterial.image,
      rarity: sourceMaterial.rarity,
      required: item.required,
      allocated,
      totalCraftable: countMaximumAvailable(item.materialId, materials),
      remaining: Math.max(item.required - allocated, 0),
      complete: allocated >= item.required
    };
  });

  const totalRequired = evaluated.reduce((sum, item) => sum + item.required, 0);
  const totalAllocated = evaluated.reduce((sum, item) => sum + item.allocated, 0);

  return {
    id: goal.id,
    name: goal.name,
    description: goal.description,
    progressPercent: totalRequired === 0 ? 0 : Math.round((totalAllocated / totalRequired) * 100),
    totalRequired,
    totalAllocated,
    materials: evaluated.sort((left, right) => {
      if (left.complete !== right.complete) {
        return Number(left.complete) - Number(right.complete);
      }

      if (left.rarity !== right.rarity) {
        return right.rarity - left.rarity;
      }

      return left.materialName.localeCompare(right.materialName);
    })
  };
}

export function buildDashboardData(materials: MaterialNode[], goals: GoalView[]): DashboardData {
  const materialsStillNeeded = goals.flatMap((goal) => goal.materials.filter((item) => item.remaining > 0));
  const completedMaterials = goals.flatMap((goal) => goal.materials.filter((item) => item.complete));
  const materialViews = buildMaterialViews(materials);

  return {
    overview: {
      totalTrackedMaterials: materialViews.length,
      totalInventory: materialViews.reduce((sum, material) => sum + material.quantity, 0),
      activeGoals: goals.length,
      completedGoals: goals.filter((goal) => goal.progressPercent >= 100).length,
      craftableMaterials: materialViews.filter((material) => material.craftableExtra > 0).length
    },
    materials: materialViews,
    goals,
    materialsStillNeeded: materialsStillNeeded.sort((left, right) => right.remaining - left.remaining),
    completedMaterials
  };
}
