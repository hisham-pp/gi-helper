import { prisma } from "@/lib/prisma";
import { getDashboardData } from "@/lib/data";
import { getAllCharacters, getAllMaterials } from "@/lib/static-data";

const MAX_INVENTORY_ITEMS = 160;
const MAX_NEEDED_ITEMS = 120;
const MAX_GOALS = 40;

export type AssistantTrackerContext = {
  ownedCharacters: Array<{
    id: string;
    name: string;
    element: string;
    weaponType: string;
    rarity: number;
    level: number | null;
    talents: {
      normalAttack: number | null;
      elementalSkill: number | null;
      elementalBurst: number | null;
    };
  }>;
  inventory: Array<{
    id: string;
    name: string;
    category: string;
    rarity: number;
    quantity: number;
  }>;
  materialsStillNeeded: Array<{
    materialId: string;
    materialName: string;
    remaining: number;
    required: number;
    allocated: number;
  }>;
  activeGoals: Array<{
    id: string;
    name: string;
    category: string;
    characterName?: string;
    progressPercent: number;
    materials: Array<{
      materialName: string;
      required: number;
      remaining: number;
      allocated: number;
    }>;
  }>;
};

export async function getAssistantTrackerContext(
  userId: string,
): Promise<AssistantTrackerContext> {
  const [ownedCharacters, dashboardData] = await Promise.all([
    prisma.ownedCharacter.findMany({
      where: { userId },
      select: {
        characterId: true,
        level: true,
        normalAttackLevel: true,
        elementalSkillLevel: true,
        elementalBurstLevel: true,
      },
      orderBy: { createdAt: "asc" },
    }),
    getDashboardData(userId),
  ]);

  const ownedCharacterIdSet = new Set(
    ownedCharacters.map((item) => item.characterId),
  );
  const progressByCharacterId = new Map(
    ownedCharacters.map((item) => [item.characterId, item]),
  );

  const ownedCharacterSummaries = getAllCharacters()
    .filter((character) => ownedCharacterIdSet.has(character.id))
    .map((character) => {
      const progress = progressByCharacterId.get(character.id);

      return {
        id: character.id,
        name: character.name,
        element: character.element,
        weaponType: character.weaponType,
        rarity: character.rarity,
        level: progress?.level ?? null,
        talents: {
          normalAttack: progress?.normalAttackLevel ?? null,
          elementalSkill: progress?.elementalSkillLevel ?? null,
          elementalBurst: progress?.elementalBurstLevel ?? null,
        },
      };
    });

  const materialById = new Map(
    getAllMaterials().map((material) => [material.id, material]),
  );

  const inventory = dashboardData.materials
    .filter((material) => material.quantity !== 0)
    .sort((left, right) => {
      if (right.quantity !== left.quantity) {
        return right.quantity - left.quantity;
      }

      return left.name.localeCompare(right.name);
    })
    .slice(0, MAX_INVENTORY_ITEMS)
    .map((material) => ({
      id: material.id,
      name: material.name,
      category: material.category,
      rarity: material.rarity,
      quantity: material.quantity,
    }));

  const materialsStillNeeded = dashboardData.materialsStillNeeded
    .filter((material) => material.remaining > 0)
    .sort((left, right) => right.remaining - left.remaining)
    .slice(0, MAX_NEEDED_ITEMS)
    .map((material) => ({
      materialId: material.materialId,
      materialName: material.materialName,
      remaining: material.remaining,
      required: material.required,
      allocated: material.allocated,
    }));

  const activeGoals = dashboardData.goals
    .filter((goal) => !goal.completed)
    .slice(0, MAX_GOALS)
    .map((goal) => ({
      id: goal.id,
      name: goal.name,
      category: goal.category ?? "Custom",
      characterName: goal.characterName,
      progressPercent: goal.progressPercent,
      materials: goal.materials.map((material) => ({
        materialName:
          materialById.get(material.materialId)?.name ?? material.materialName,
        required: material.required,
        remaining: material.remaining,
        allocated: material.allocated,
      })),
    }));

  return {
    ownedCharacters: ownedCharacterSummaries,
    inventory,
    materialsStillNeeded,
    activeGoals,
  };
}
