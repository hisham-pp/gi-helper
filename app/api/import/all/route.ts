import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const WRITE_BATCH_SIZE = 100;
const MAX_DB_ATTEMPTS = 3;
const RETRYABLE_PRISMA_CODES = new Set(["P1001", "P1002", "P1017", "P2024"]);

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

type ImportProgressEvent =
  | {
      type: "progress";
      label: string;
      completed: number;
      total: number;
    }
  | {
      type: "complete";
      imported: {
        materials: number;
        inventory: number;
        goals: number;
        cookingProgress: number;
      };
    }
  | {
      type: "error";
      error: string;
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

function getRetryableDbError(error: unknown) {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String(error.code)
      : "";
  const message = error instanceof Error ? error.message : String(error);

  return (
    RETRYABLE_PRISMA_CODES.has(code) ||
    message.includes("Server has closed the connection") ||
    message.includes("connection was forcibly closed")
  );
}

function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function withDbRetry<T>(operation: () => Promise<T>) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_DB_ATTEMPTS; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (!getRetryableDbError(error) || attempt === MAX_DB_ATTEMPTS) {
        break;
      }

      await prisma.$disconnect().catch(() => undefined);
      await wait(300 * attempt);
    }
  }

  throw lastError;
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
    const goalMaterialCount = goals.reduce((total, goal) => {
      if (!Array.isArray(goal.goalMaterials)) {
        return total;
      }

      return total + uniqueGoalMaterials(goal.goalMaterials).length;
    }, 0);
    const totalSteps =
      materials.length +
      inventory.length +
      goals.length +
      goalMaterialCount +
      cookingProgress.length +
      4;
    const encoder = new TextEncoder();
    let completedSteps = 0;

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const send = (event: ImportProgressEvent) => {
          controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
        };
        const progress = (label: string, count = 1) => {
          completedSteps = Math.min(totalSteps, completedSteps + count);
          send({
            type: "progress",
            label,
            completed: completedSteps,
            total: totalSteps,
          });
        };

        try {
          send({
            type: "progress",
            label: "Checking backup data...",
            completed: 0,
            total: totalSteps,
          });

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
            const existingMaterials = await withDbRetry(() =>
              prisma.material.findMany({
                where: {
                  id: {
                    in: uniqueMaterialIds,
                  },
                },
                select: {
                  id: true,
                },
              }),
            );
            const existingMaterialIds = new Set(
              existingMaterials.map((material) => material.id),
            );
            const missingMaterialIds = uniqueMaterialIds.filter(
              (materialId) => !existingMaterialIds.has(materialId),
            );

            if (missingMaterialIds.length > 0 && !canImportSharedData) {
              send({
                type: "error",
                error:
                  "This backup references materials that do not exist in this app.",
              });
              controller.close();
              return;
            }
          }
          progress("Backup data checked.");

          for (const material of materials) {
            if (!material?.id || !material?.name) {
              progress("Skipping invalid material.");
              continue;
            }

            await withDbRetry(() =>
              prisma.material.upsert({
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
              }),
            );
            progress(`Imported material ${material.name}.`);
          }

          const existingGoals = await withDbRetry(() =>
            prisma.goal.findMany({
              where: {
                userId: user.id,
              },
              select: {
                id: true,
              },
            }),
          );

          for (const goalChunk of chunk(existingGoals, WRITE_BATCH_SIZE)) {
            await withDbRetry(() =>
              prisma.goalMaterial.deleteMany({
                where: {
                  goalId: {
                    in: goalChunk.map((goal) => goal.id),
                  },
                },
              }),
            );
          }
          progress("Cleared previous goal materials.");

          await withDbRetry(() =>
            prisma.goal.deleteMany({
              where: {
                userId: user.id,
              },
            }),
          );
          progress("Cleared previous goals.");

          await withDbRetry(() =>
            prisma.inventory.deleteMany({
              where: {
                userId: user.id,
              },
            }),
          );
          progress("Cleared previous inventory.");

          await withDbRetry(() =>
            prisma.cookingProgress.deleteMany({
              where: {
                userId: user.id,
              },
            }),
          );
          progress("Cleared previous cooking progress.");

          for (const inventoryChunk of chunk(inventory, WRITE_BATCH_SIZE)) {
            const data = inventoryChunk
              .filter((item: BackupInventoryItem) => Boolean(item?.materialId))
              .map((item) => ({
                userId: user.id,
                materialId: item.materialId,
                quantity: normalizeQuantity(item.quantity),
              }));

            if (data.length > 0) {
              await withDbRetry(() =>
                prisma.inventory.createMany({
                  data,
                  skipDuplicates: true,
                }),
              );
            }
            progress("Imported inventory.", inventoryChunk.length);
          }

          for (const goal of goals) {
            if (!goal?.id || !goal?.name) {
              progress("Skipping invalid goal.");
              continue;
            }

            const goalId = randomUUID();
            const goalMaterials = Array.isArray(goal.goalMaterials)
              ? uniqueGoalMaterials(goal.goalMaterials)
              : [];

            await withDbRetry(() =>
              prisma.goal.create({
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
              }),
            );
            progress(`Imported goal ${goal.name}.`);

            for (const goalMaterialChunk of chunk(
              goalMaterials,
              WRITE_BATCH_SIZE,
            )) {
              const data = goalMaterialChunk
                .filter((item: BackupGoalMaterial) => Boolean(item?.materialId))
                .map((item) => ({
                  goalId,
                  materialId: item.materialId,
                  required: normalizeQuantity(item.required),
                }));

              if (data.length > 0) {
                await withDbRetry(() =>
                  prisma.goalMaterial.createMany({
                    data,
                    skipDuplicates: true,
                  }),
                );
              }
              progress("Imported goal materials.", goalMaterialChunk.length);
            }
          }

          for (const cookingProgressChunk of chunk(
            cookingProgress,
            WRITE_BATCH_SIZE,
          )) {
            const data = cookingProgressChunk
              .filter((item: BackupCookingProgress) => Boolean(item?.recipeId))
              .map((item) => ({
                userId: user.id,
                recipeId: item.recipeId,
                completedCount: normalizeQuantity(item.completedCount),
              }));

            if (data.length > 0) {
              await withDbRetry(() =>
                prisma.cookingProgress.createMany({
                  data,
                  skipDuplicates: true,
                }),
              );
            }
            progress("Imported cooking progress.", cookingProgressChunk.length);
          }

          send({
            type: "complete",
            imported: {
              materials: materials.length,
              inventory: inventory.length,
              goals: goals.length,
              cookingProgress: cookingProgress.length,
            },
          });
          controller.close();
        } catch (error) {
          console.error("Import all failed", error);
          send({
            type: "error",
            error: "Unable to import backup file. Please try again.",
          });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "application/x-ndjson; charset=utf-8",
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
