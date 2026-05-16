"use server";

import { redirect } from "next/navigation";

import {
  createSession,
  hashPassword,
  requireUser,
  verifyPassword,
  clearSession,
  requireMaster,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ActionResponse, DashboardData } from "@/lib/types";
import {
  authSchema,
  deleteGoalMaterialSchema,
  deleteGoalSchema,
  goalMaterialSchema,
  goalSchema,
  inventorySchema,
  materialSchema,
} from "@/lib/validation";
import { getDashboardData } from "@/lib/data";

async function refreshDashboard(): Promise<ActionResponse<DashboardData>> {
  const user = await requireUser();
  const data = await getDashboardData(user.id);

  return {
    success: true,
    data,
  };
}

export async function saveInventoryAction(
  input: unknown,
): Promise<ActionResponse<DashboardData>> {
  const user = await requireUser();
  const parsed = inventorySchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid inventory payload.",
    };
  }

  const { materialId, quantity } = parsed.data;

  try {
    await prisma.inventory.upsert({
      where: {
        userId_materialId: {
          userId: user.id,
          materialId,
        },
      },
      update: { quantity },
      create: { userId: user.id, materialId, quantity },
    });
  } catch (error) {
    console.error("Inventory save failed", error);

    return {
      success: false,
      error: "Unable to save inventory right now.",
    };
  }

  return refreshDashboard();
}

export async function createGoalAction(
  input: unknown,
): Promise<ActionResponse<DashboardData>> {
  const user = await requireUser();
  const parsed = goalSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Goal name must be between 2 and 60 characters.",
    };
  }

  try {
    await prisma.goal.create({
      data: {
        userId: user.id,
        name: parsed.data.name,
        description: parsed.data.description || null,
      },
    });
  } catch (error) {
    console.error("Goal creation failed", error);

    return {
      success: false,
      error: "Unable to create goal right now.",
    };
  }

  return refreshDashboard();
}

export async function saveGoalMaterialAction(
  input: unknown,
): Promise<ActionResponse<DashboardData>> {
  const user = await requireUser();
  const parsed = goalMaterialSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid goal material payload.",
    };
  }

  const { goalId, materialId, required } = parsed.data;

  try {
    const goal = await prisma.goal.findFirst({
      where: {
        id: goalId,
        userId: user.id,
      },
      select: {
        id: true,
      },
    });

    if (!goal) {
      return {
        success: false,
        error: "Goal not found.",
      };
    }

    await prisma.goalMaterial.upsert({
      where: {
        goalId_materialId: {
          goalId,
          materialId,
        },
      },
      update: {
        required,
      },
      create: {
        goalId,
        materialId,
        required,
      },
    });
  } catch (error) {
    console.error("Goal material save failed", error);

    return {
      success: false,
      error: "Unable to save goal material right now.",
    };
  }

  return refreshDashboard();
}

export async function deleteGoalAction(
  input: unknown,
): Promise<ActionResponse<DashboardData>> {
  const user = await requireUser();
  const parsed = deleteGoalSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid goal id.",
    };
  }

  try {
    const goal = await prisma.goal.findFirst({
      where: {
        id: parsed.data.goalId,
        userId: user.id,
      },
      select: {
        id: true,
      },
    });

    if (!goal) {
      return {
        success: false,
        error: "Goal not found.",
      };
    }

    await prisma.goal.delete({
      where: {
        id: goal.id,
      },
    });
  } catch (error) {
    console.error("Goal delete failed", error);

    return {
      success: false,
      error: "Unable to delete that goal.",
    };
  }

  return refreshDashboard();
}

export async function deleteGoalMaterialAction(
  input: unknown,
): Promise<ActionResponse<DashboardData>> {
  const user = await requireUser();
  const parsed = deleteGoalMaterialSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid goal material id.",
    };
  }

  try {
    const goalMaterial = await prisma.goalMaterial.findFirst({
      where: {
        id: parsed.data.goalMaterialId,
        goal: {
          userId: user.id,
        },
      },
      select: {
        id: true,
      },
    });

    if (!goalMaterial) {
      return {
        success: false,
        error: "Requirement not found.",
      };
    }

    await prisma.goalMaterial.delete({
      where: {
        id: parsed.data.goalMaterialId,
      },
    });
  } catch (error) {
    console.error("Goal material delete failed", error);

    return {
      success: false,
      error: "Unable to remove that requirement.",
    };
  }

  return refreshDashboard();
}

export async function registerAction(
  input: unknown,
): Promise<ActionResponse<{ username: string }>> {
  const parsed = authSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error:
        "Username must be 3-30 characters and password must be at least 6 characters.",
    };
  }

  const username = parsed.data.username.toLowerCase();

  try {
    const existing = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (existing) {
      return {
        success: false,
        error: "Username already exists.",
      };
    }

    const user = await prisma.user.create({
      data: {
        username,
        passwordHash: hashPassword(parsed.data.password),
      },
    });

    await createSession(user.id);

    return {
      success: true,
      data: {
        username: user.username,
      },
    };
  } catch (error) {
    console.error("Register failed", error);

    return {
      success: false,
      error: "Unable to create account right now.",
    };
  }
}

export async function loginAction(
  input: unknown,
): Promise<ActionResponse<{ username: string }>> {
  const parsed = authSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid username or password.",
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        username: parsed.data.username.toLowerCase(),
      },
    });

    if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
      return {
        success: false,
        error: "Invalid username or password.",
      };
    }

    await createSession(user.id);

    return {
      success: true,
      data: {
        username: user.username,
      },
    };
  } catch (error) {
    console.error("Login failed", error);

    return {
      success: false,
      error: "Unable to login right now.",
    };
  }
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}

const externalIconUrl = (iconName: string) =>
  `https://enka.network/ui/${iconName}.png`;

export async function createMaterialAction(input: unknown) {
  const user = await requireMaster();
  const parsed = materialSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: "Invalid material payload." };
  }

  try {
    const createData: any = { ...parsed.data };
    createData.image = externalIconUrl(createData.iconName);
    delete createData.iconName;

    if (createData.parentMaterialId === null) {
      delete createData.parentMaterialId;
    }

    await prisma.material.create({ data: createData });
  } catch (error) {
    console.error("Create material failed", error);
    return { success: false, error: "Unable to create material right now." };
  }

  return refreshDashboard();
}

export async function updateMaterialAction(input: unknown) {
  const user = await requireMaster();
  const parsed = materialSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: "Invalid material payload." };
  }

  try {
    const updateData: any = { ...parsed.data };
    updateData.image = externalIconUrl(updateData.iconName);
    delete updateData.iconName;

    if (updateData.parentMaterialId === null) {
      updateData.parentMaterialId = undefined;
    }

    await prisma.material.update({
      where: { id: parsed.data.id },
      data: updateData,
    });
  } catch (error) {
    console.error("Update material failed", error);
    return { success: false, error: "Unable to update material right now." };
  }

  return refreshDashboard();
}
