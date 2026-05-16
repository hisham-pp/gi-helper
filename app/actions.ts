"use server";

import { prisma } from "@/lib/prisma";
import type { ActionResponse, DashboardData } from "@/lib/types";
import {
  deleteGoalMaterialSchema,
  deleteGoalSchema,
  goalMaterialSchema,
  goalSchema,
  inventorySchema
} from "@/lib/validation";
import { getDashboardData } from "@/lib/data";

async function refreshDashboard(): Promise<ActionResponse<DashboardData>> {
  const data = await getDashboardData();

  return {
    success: true,
    data
  };
}

export async function saveInventoryAction(input: unknown): Promise<ActionResponse<DashboardData>> {
  const parsed = inventorySchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid inventory payload."
    };
  }

  const { materialId, quantity } = parsed.data;

  try {
    await prisma.inventory.upsert({
      where: { materialId },
      update: { quantity },
      create: { materialId, quantity }
    });
  } catch (error) {
    console.error("Inventory save failed", error);

    return {
      success: false,
      error: "Unable to save inventory right now."
    };
  }

  return refreshDashboard();
}

export async function createGoalAction(input: unknown): Promise<ActionResponse<DashboardData>> {
  const parsed = goalSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Goal name must be between 2 and 60 characters."
    };
  }

  try {
    await prisma.goal.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description || null
      }
    });
  } catch (error) {
    console.error("Goal creation failed", error);

    return {
      success: false,
      error: "Unable to create goal right now."
    };
  }

  return refreshDashboard();
}

export async function saveGoalMaterialAction(input: unknown): Promise<ActionResponse<DashboardData>> {
  const parsed = goalMaterialSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid goal material payload."
    };
  }

  const { goalId, materialId, required } = parsed.data;

  try {
    await prisma.goalMaterial.upsert({
      where: {
        goalId_materialId: {
          goalId,
          materialId
        }
      },
      update: {
        required
      },
      create: {
        goalId,
        materialId,
        required
      }
    });
  } catch (error) {
    console.error("Goal material save failed", error);

    return {
      success: false,
      error: "Unable to save goal material right now."
    };
  }

  return refreshDashboard();
}

export async function deleteGoalAction(input: unknown): Promise<ActionResponse<DashboardData>> {
  const parsed = deleteGoalSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid goal id."
    };
  }

  try {
    await prisma.goal.delete({
      where: {
        id: parsed.data.goalId
      }
    });
  } catch (error) {
    console.error("Goal delete failed", error);

    return {
      success: false,
      error: "Unable to delete that goal."
    };
  }

  return refreshDashboard();
}

export async function deleteGoalMaterialAction(input: unknown): Promise<ActionResponse<DashboardData>> {
  const parsed = deleteGoalMaterialSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid goal material id."
    };
  }

  try {
    await prisma.goalMaterial.delete({
      where: {
        id: parsed.data.goalMaterialId
      }
    });
  } catch (error) {
    console.error("Goal material delete failed", error);

    return {
      success: false,
      error: "Unable to remove that requirement."
    };
  }

  return refreshDashboard();
}
