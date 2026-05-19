import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type BackupMaterial = {
  id: string;
  name: string;
  image?: string;
  rarity?: number;
  category?: string;
  description?: string;
  details?: unknown;
  combinable?: boolean;
  combineRatio?: number | null;
  parentMaterialId?: string | null;
};

type BackupInventoryItem = {
  materialId: string;
  quantity?: number;
};

type BackupGoalMaterial = {
  id?: string;
  materialId: string;
  required?: number;
};

type BackupGoal = {
  id: string;
  name: string;
  description?: string | null;
  templateId?: string | null;
  templateType?: string | null;
  completed?: boolean;
  category?: string | null;
  characterId?: string | null;
  goalMaterials?: BackupGoalMaterial[];
};

type BackupCookingProgress = {
  recipeId: string;
  completedCount?: number;
};

type BackupPayload = {
  materials?: BackupMaterial[];
  inventory?: BackupInventoryItem[];
  goals?: BackupGoal[];
  cookingProgress?: BackupCookingProgress[];
};

function isBackupPayload(value: unknown): value is BackupPayload {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasImportableData(payload: BackupPayload) {
  return (
    Array.isArray(payload.materials) ||
    Array.isArray(payload.inventory) ||
    Array.isArray(payload.goals) ||
    Array.isArray(payload.cookingProgress)
  );
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    if (!isBackupPayload(body) || !hasImportableData(body)) {
      return NextResponse.json(
        { error: "Invalid backup file. No importable data was found." },
        { status: 400 },
      );
    }

    const payload = body as BackupPayload;
    const canImportSharedData = user.role === "master";
    const materials =
      canImportSharedData && Array.isArray(payload.materials)
        ? payload.materials
        : [];
    const inventory = Array.isArray(payload.inventory) ? payload.inventory : [];
    const goals = Array.isArray(payload.goals) ? payload.goals : [];
    const cookingProgress = Array.isArray(payload.cookingProgress)
      ? payload.cookingProgress
      : [];

    const materialIds = [
      ...inventory
        .filter((item) => Boolean(item?.materialId))
        .map((item) => item.materialId),
      ...goals.flatMap((goal) =>
        Array.isArray(goal?.goalMaterials)
          ? goal.goalMaterials
              .filter((entry) => Boolean(entry?.materialId))
              .map((entry) => entry.materialId)
          : [],
      ),
    ];

    if (materialIds.length > 0) {
      const uniqueMaterialIds = [...new Set(materialIds)];
      const existingMaterials = await prisma.material.findMany({
        where: {
          id: {
            in: uniqueMaterialIds,
          },
        },
        select: {
          id: true,
        },
      });
      const existingMaterialIds = new Set(
        existingMaterials.map((material) => material.id),
      );
      const missingMaterialIds = uniqueMaterialIds.filter(
        (materialId) => !existingMaterialIds.has(materialId),
      );

      if (missingMaterialIds.length > 0 && !canImportSharedData) {
        return NextResponse.json(
          {
            error:
              "This backup references materials that do not exist in this app.",
            missingMaterialIds,
          },
          { status: 400 },
        );
      }
    }

    await prisma.$transaction(async (tx) => {
      const existingGoals = await tx.goal.findMany({
        where: {
          userId: user.id,
        },
        select: {
          id: true,
        },
      });

      for (const material of materials) {
        if (!material?.id || !material?.name) {
          continue;
        }

        await tx.material.upsert({
          where: { id: material.id },
          update: {
            name: material.name,
            image: material.image ?? "",
            rarity: Number(material.rarity ?? 1),
            category: material.category ?? "Unknown",
            description: material.description ?? "",
            details: material.details ?? undefined,
            combinable: Boolean(material.combinable),
            combineRatio:
              material.combineRatio === null ||
              material.combineRatio === undefined
                ? null
                : Number(material.combineRatio),
            parentMaterialId: material.parentMaterialId ?? null,
          },
          create: {
            id: material.id,
            name: material.name,
            image: material.image ?? "",
            rarity: Number(material.rarity ?? 1),
            category: material.category ?? "Unknown",
            description: material.description ?? "",
            details: material.details ?? undefined,
            combinable: Boolean(material.combinable),
            combineRatio:
              material.combineRatio === null ||
              material.combineRatio === undefined
                ? null
                : Number(material.combineRatio),
            parentMaterialId: material.parentMaterialId ?? null,
          },
        });
      }

      if (existingGoals.length > 0) {
        await tx.goalMaterial.deleteMany({
          where: {
            goalId: {
              in: existingGoals.map((goal) => goal.id),
            },
          },
        });
      }

      await tx.goal.deleteMany({
        where: {
          userId: user.id,
        },
      });

      await tx.inventory.deleteMany({
        where: {
          userId: user.id,
        },
      });

      await tx.cookingProgress.deleteMany({
        where: {
          userId: user.id,
        },
      });

      if (inventory.length > 0) {
        await tx.inventory.createMany({
          data: inventory
            .filter((item: BackupInventoryItem) => Boolean(item?.materialId))
            .map((item) => ({
              userId: user.id,
              materialId: item.materialId,
              quantity: Number(item.quantity ?? 0),
            })),
        });
      }

      for (const goal of goals) {
        if (!goal?.id || !goal?.name) {
          continue;
        }

        await tx.goal.create({
          data: {
            id: goal.id,
            userId: user.id,
            name: goal.name,
            description: goal.description ?? null,
            templateId: goal.templateId ?? null,
            templateType: goal.templateType ?? null,
            completed: Boolean(goal.completed),
            category: goal.category ?? null,
            characterId: goal.characterId ?? null,
          },
        });

        const goalMaterials = Array.isArray(goal.goalMaterials)
          ? goal.goalMaterials
          : [];

        if (goalMaterials.length > 0) {
          await tx.goalMaterial.createMany({
            data: goalMaterials
              .filter((entry: BackupGoalMaterial) => Boolean(entry?.materialId))
              .map((entry) => ({
                id: entry.id,
                goalId: goal.id,
                materialId: entry.materialId,
                required: Number(entry.required ?? 0),
              })),
          });
        }
      }

      if (cookingProgress.length > 0) {
        await tx.cookingProgress.createMany({
          data: cookingProgress
            .filter((item: BackupCookingProgress) => Boolean(item?.recipeId))
            .map((item) => ({
              userId: user.id,
              recipeId: item.recipeId,
              completedCount: Number(item.completedCount ?? 0),
            })),
          skipDuplicates: true,
        });
      }
    });

    return NextResponse.json({
      success: true,
      imported: {
        materials: materials.length,
        inventory: inventory.length,
        goals: goals.length,
        cookingProgress: cookingProgress.length,
      },
    });
  } catch (error) {
    console.error("Import all failed", error);

    return NextResponse.json(
      { error: "Unable to import backup file." },
      { status: 500 },
    );
  }
}
