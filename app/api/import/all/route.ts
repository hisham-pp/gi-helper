import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const WRITE_BATCH_SIZE = 500;

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

function normalizeQuantity(value: unknown) {
  const quantity = Number(value ?? 0);

  if (!Number.isFinite(quantity)) {
    return 0;
  }

  return Math.max(0, Math.trunc(quantity));
}

function uniqueInventoryItems(items: BackupInventoryItem[]) {
  const byMaterialId = new Map<string, BackupInventoryItem>();

  for (const item of items) {
    if (!item?.materialId) {
      continue;
    }

    byMaterialId.set(item.materialId, item);
  }

  return [...byMaterialId.values()];
}

function uniqueGoalMaterials(items: BackupGoalMaterial[]) {
  const byMaterialId = new Map<string, BackupGoalMaterial>();

  for (const item of items) {
    if (!item?.materialId) {
      continue;
    }

    byMaterialId.set(item.materialId, item);
  }

  return [...byMaterialId.values()];
}

function uniqueCookingProgress(items: BackupCookingProgress[]) {
  const byRecipeId = new Map<string, BackupCookingProgress>();

  for (const item of items) {
    if (!item?.recipeId) {
      continue;
    }

    byRecipeId.set(item.recipeId, item);
  }

  return [...byRecipeId.values()];
}

function chunk<T>(items: T[], size: number) {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
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
    const inventory = uniqueInventoryItems(
      Array.isArray(payload.inventory) ? payload.inventory : [],
    );
    const goals = Array.isArray(payload.goals) ? payload.goals : [];
    const cookingProgress = uniqueCookingProgress(
      Array.isArray(payload.cookingProgress) ? payload.cookingProgress : [],
    );

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

    for (const material of materials) {
      if (!material?.id || !material?.name) {
        continue;
      }

      await prisma.material.upsert({
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
            material.combineRatio === null || material.combineRatio === undefined
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
            material.combineRatio === null || material.combineRatio === undefined
              ? null
              : Number(material.combineRatio),
          parentMaterialId: material.parentMaterialId ?? null,
        },
      });
    }

    const existingGoals = await prisma.goal.findMany({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
      },
    });

    for (const goalChunk of chunk(existingGoals, WRITE_BATCH_SIZE)) {
      await prisma.goalMaterial.deleteMany({
        where: {
          goalId: {
            in: goalChunk.map((goal) => goal.id),
          },
        },
      });
    }

    await prisma.goal.deleteMany({
      where: {
        userId: user.id,
      },
    });

    await prisma.inventory.deleteMany({
      where: {
        userId: user.id,
      },
    });

    await prisma.cookingProgress.deleteMany({
      where: {
        userId: user.id,
      },
    });

    for (const inventoryChunk of chunk(inventory, WRITE_BATCH_SIZE)) {
      await prisma.inventory.createMany({
        data: inventoryChunk
          .filter((item: BackupInventoryItem) => Boolean(item?.materialId))
          .map((item) => ({
            userId: user.id,
            materialId: item.materialId,
            quantity: normalizeQuantity(item.quantity),
          })),
      });
    }

    for (const goal of goals) {
      if (!goal?.id || !goal?.name) {
        continue;
      }

      const goalId = randomUUID();
      const goalMaterials = Array.isArray(goal.goalMaterials)
        ? uniqueGoalMaterials(goal.goalMaterials)
        : [];

      await prisma.goal.create({
        data: {
          id: goalId,
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

      for (const goalMaterialChunk of chunk(goalMaterials, WRITE_BATCH_SIZE)) {
        await prisma.goalMaterial.createMany({
          data: goalMaterialChunk
            .filter((item: BackupGoalMaterial) => Boolean(item?.materialId))
            .map((item) => ({
              goalId,
              materialId: item.materialId,
              required: normalizeQuantity(item.required),
            })),
        });
      }
    }

    for (const cookingProgressChunk of chunk(
      cookingProgress,
      WRITE_BATCH_SIZE,
    )) {
      await prisma.cookingProgress.createMany({
        data: cookingProgressChunk
          .filter((item: BackupCookingProgress) => Boolean(item?.recipeId))
          .map((item) => ({
            userId: user.id,
            recipeId: item.recipeId,
            completedCount: normalizeQuantity(item.completedCount),
          })),
        skipDuplicates: true,
      });
    }

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
