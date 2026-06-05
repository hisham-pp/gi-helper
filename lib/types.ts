export type MaterialNode = {
  id: string;
  name: string;
  image: string;
  rarity: number;
  category: string;
  sortOrder?: number;
  description: string;
  combinable: boolean;
  combineRatio: number | null;
  parentMaterialId: string | null;
  quantity: number;
};

export type GoalMaterialView = {
  id: string;
  materialId: string;
  materialName: string;
  materialImage: string;
  category: string;
  rarity: number;
  required: number;
  allocated: number;
  totalCraftable: number;
  remaining: number;
  ownedNeeded?: number;
  complete: boolean;
};

export type GoalView = {
  id: string;
  name: string;
  description: string | null;
  progressPercent: number;
  totalRequired: number;
  totalAllocated: number;
  completed: boolean;
  characterId?: string;
  characterName?: string;
  category?: string;
  materials: GoalMaterialView[];
};

export type MaterialView = MaterialNode & {
  totalCraftable: number;
  craftableExtra: number;
  familyDepth: number;
};

export type CraftingSimulation = {
  materialId: string;
  requested: number;
  totalAvailable: number;
  craftable: boolean;
  remaining: number;
  surplus: number;
  directOwned: number;
  recursiveSources: Array<{
    materialId: string;
    materialName: string;
    quantity: number;
  }>;
};

export type OverviewStats = {
  totalTrackedMaterials: number;
  totalInventory: number;
  activeGoals: number;
  completedGoals: number;
  craftableMaterials: number;
};

export type DashboardData = {
  overview: OverviewStats;
  materials: MaterialView[];
  goals: GoalView[];
  materialsStillNeeded: GoalMaterialView[];
  completedMaterials: GoalMaterialView[];
};

export type ActionResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};
