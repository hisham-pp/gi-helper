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
  goalMaterials?: BackupGoalMaterial[];
};

type BackupPayload = {
  materials?: BackupMaterial[];
  inventory?: BackupInventoryItem[];
  goals?: BackupGoal[];
};

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const payload = body as BackupPayload;
    const materials = Array.isArray(payload.materials) ? payload.materials : [];
    const inventory = Array.isArray(payload.inventory) ? payload.inventory : [];
    const goals = Array.isArray(payload.goals) ? payload.goals : [];

    await prisma.$transaction(async (tx) => {
      const existingGoals = await tx.goal.findMany({
        where: {
          userId: user.id
        },
        select: {
          id: true
        }
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
            combinable: Boolean(material.combinable),
            combineRatio:
              material.combineRatio === null || material.combineRatio === undefined
                ? null
                : Number(material.combineRatio),
            parentMaterialId: material.parentMaterialId ?? null
          },
          create: {
            id: material.id,
            name: material.name,
            image: material.image ?? "",
            rarity: Number(material.rarity ?? 1),
            category: material.category ?? "Unknown",
            description: material.description ?? "",
            combinable: Boolean(material.combinable),
            combineRatio:
              material.combineRatio === null || material.combineRatio === undefined
                ? null
                : Number(material.combineRatio),
            parentMaterialId: material.parentMaterialId ?? null
          }
        });
      }

      if (existingGoals.length > 0) {
        await tx.goalMaterial.deleteMany({
          where: {
            goalId: {
              in: existingGoals.map((goal) => goal.id)
            }
          }
        });
      }

      await tx.goal.deleteMany({
        where: {
          userId: user.id
        }
      });

      await tx.inventory.deleteMany({
        where: {
          userId: user.id
        }
      });

      if (inventory.length > 0) {
        await tx.inventory.createMany({
          data: inventory
            .filter((item: BackupInventoryItem) => Boolean(item?.materialId))
            .map((item) => ({
              userId: user.id,
              materialId: item.materialId,
              quantity: Number(item.quantity ?? 0)
            }))
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
            description: goal.description ?? null
          }
        });

        const goalMaterials = Array.isArray(goal.goalMaterials) ? goal.goalMaterials : [];

        if (goalMaterials.length > 0) {
          await tx.goalMaterial.createMany({
            data: goalMaterials
              .filter((entry: BackupGoalMaterial) => Boolean(entry?.materialId))
              .map((entry) => ({
                id: entry.id,
                goalId: goal.id,
                materialId: entry.materialId,
                required: Number(entry.required ?? 0)
              }))
          });
        }
      }
    });

    return NextResponse.json({
      success: true
    });
  } catch (error) {
    console.error("Import all failed", error);

    return NextResponse.json({ error: "Unable to import backup file." }, { status: 500 });
  }
}
