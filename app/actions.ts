"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";

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
  cookRecipeSchema,
  cookingProgressSchema,
  createGoalsFromTemplatesSchema,
  deleteGoalMaterialSchema,
  deleteGoalSchema,
  goalMaterialSchema,
  goalSchema,
  inventorySchema,
  completeGoalSchema,
  ownedCharacterSchema,
} from "@/lib/validation";
import { getDashboardData } from "@/lib/data";
import { getCookingData, type CookingData } from "@/lib/cooking-data";
import {
  getCharacterById,
  getCharacterTemplateById,
  getMaterialById,
  getWeaponById,
  getWeaponTemplateById,
} from "@/lib/static-data";

type CookingIngredientRequirement = {
  materialId: string;
  name: string;
  quantity: number;
};

async function refreshDashboard(): Promise<ActionResponse<DashboardData>> {
  const user = await requireUser();
  const data = await getDashboardData(user.id);

  return {
    success: true,
    data,
  };
}

function revalidateDashboardPages(skipPaths: string[] = []) {
  for (const path of ["/", "/materials", "/inventory", "/goals", "/cooking"]) {
    if (!skipPaths.includes(path)) {
      revalidatePath(path);
    }
  }
}

async function applyCookingIngredientInventoryChanges(
  tx: Prisma.TransactionClient,
  userId: string,
  ingredients: CookingIngredientRequirement[],
  cookDelta: number,
) {
  if (cookDelta === 0) {
    return;
  }

  const inventoryItems = await tx.inventory.findMany({
    where: {
      userId,
      materialId: {
        in: ingredients.map((ingredient) => ingredient.materialId),
      },
    },
    select: {
      materialId: true,
      quantity: true,
    },
  });
  const quantityByMaterialId = new Map(
    inventoryItems.map((item) => [item.materialId, item.quantity]),
  );

  for (const ingredient of ingredients) {
    const quantityChange = Math.abs(ingredient.quantity * cookDelta);
    const currentQuantity = quantityByMaterialId.get(ingredient.materialId) ?? 0;
    const nextQuantity =
      cookDelta > 0
        ? Math.max(currentQuantity - quantityChange, 0)
        : currentQuantity + quantityChange;

    await tx.inventory.upsert({
      where: {
        userId_materialId: {
          userId,
          materialId: ingredient.materialId,
        },
      },
      update: {
        quantity: nextQuantity,
      },
      create: {
        userId,
        materialId: ingredient.materialId,
        quantity: nextQuantity,
      },
    });
    quantityByMaterialId.set(ingredient.materialId, nextQuantity);
  }
}

async function refreshCooking(
  userId: string,
): Promise<ActionResponse<CookingData>> {
  const data = await getCookingData(userId);

  return {
    success: true,
    data,
  };
}

export async function saveInventoryAction(
  input: unknown,
): Promise<ActionResponse<null>> {
  const user = await requireUser();
  const parsed = inventorySchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid inventory payload.",
    };
  }

  const { materialId, quantity } = parsed.data;

  if (!getMaterialById(materialId)) {
    return {
      success: false,
      error: "Material not found.",
    };
  }

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

  revalidateDashboardPages(["/inventory"]);
  return {
    success: true,
  };
}

export async function saveCookingInventoryAction(
  input: unknown,
): Promise<ActionResponse<null>> {
  const user = await requireUser();
  const parsed = inventorySchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid inventory payload.",
    };
  }

  const { materialId, quantity } = parsed.data;

  if (!getMaterialById(materialId)) {
    return {
      success: false,
      error: "Material not found.",
    };
  }

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
    console.error("Cooking inventory save failed", error);

    return {
      success: false,
      error: "Unable to save inventory right now.",
    };
  }

  revalidateDashboardPages(["/cooking"]);
  return {
    success: true,
  };
}

export async function completeGoalAction(
  input: unknown,
): Promise<ActionResponse<DashboardData>> {
  const user = await requireUser();
  const parsed = completeGoalSchema.safeParse(input);

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
      include: {
        goalMaterials: true,
      },
    });

    if (!goal) {
      return {
        success: false,
        error: "Goal not found.",
      };
    }

    if (goal.completed) {
      return {
        success: false,
        error: "Goal is already completed.",
      };
    }

    // Consume materials without allowing inventory to become negative.
    await prisma.$transaction(async (tx) => {
      for (const item of goal.goalMaterials) {
        const existingInventory = await tx.inventory.findUnique({
          where: {
            userId_materialId: {
              userId: user.id,
              materialId: item.materialId,
            },
          },
        });

        if (existingInventory) {
          await tx.inventory.update({
            where: {
              id: existingInventory.id,
            },
            data: {
              quantity: Math.max(existingInventory.quantity - item.required, 0),
            },
          });
        }
      }

      await tx.goal.update({
        where: { id: goal.id },
        data: { completed: true },
      });
    });
  } catch (error) {
    console.error("Goal completion failed", error);

    return {
      success: false,
      error: "Unable to complete that goal.",
    };
  }

  revalidateDashboardPages();
  revalidatePath(`/goals/${parsed.data.goalId}`);
  return refreshDashboard();
}

export async function saveCookingProgressAction(
  input: unknown,
): Promise<ActionResponse<CookingData>> {
  const user = await requireUser();
  const parsed = cookingProgressSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid cooking progress payload.",
    };
  }

  const cookingData = await getCookingData(user.id);
  const recipe = cookingData.recipes.find(
    (item) => item.id === parsed.data.recipeId,
  );

  if (!recipe) {
    return {
      success: false,
      error: "Recipe not found.",
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const existingProgress = await tx.cookingProgress.findUnique({
        where: {
          userId_recipeId: {
            userId: user.id,
            recipeId: recipe.id,
          },
        },
        select: {
          completedCount: true,
        },
      });

      const previousCompletedCount = existingProgress?.completedCount ?? 0;
      const completedDelta =
        parsed.data.completedCount - previousCompletedCount;

      if (completedDelta !== 0) {
        await applyCookingIngredientInventoryChanges(
          tx,
          user.id,
          recipe.ingredients,
          completedDelta,
        );
      }

      await tx.cookingProgress.upsert({
        where: {
          userId_recipeId: {
            userId: user.id,
            recipeId: recipe.id,
          },
        },
        update: {
          completedCount: parsed.data.completedCount,
        },
        create: {
          userId: user.id,
          recipeId: recipe.id,
          completedCount: parsed.data.completedCount,
        },
      });
    });
  } catch (error) {
    console.error("Cooking progress save failed", error);

    return {
      success: false,
      error: "Unable to save cooking progress right now.",
    };
  }

  revalidateDashboardPages();
  return refreshCooking(user.id);
}

export async function setOwnedCharacterAction(
  input: unknown,
): Promise<ActionResponse<{ characterId: string; owned: boolean }>> {
  const user = await requireUser();
  const parsed = ownedCharacterSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid character ownership payload.",
    };
  }

  const { characterId, owned } = parsed.data;

  if (!getCharacterById(characterId)) {
    return {
      success: false,
      error: "Character not found.",
    };
  }

  try {
    if (owned) {
      await prisma.ownedCharacter.upsert({
        where: {
          userId_characterId: {
            userId: user.id,
            characterId,
          },
        },
        update: {},
        create: {
          userId: user.id,
          characterId,
        },
      });
    } else {
      await prisma.ownedCharacter.deleteMany({
        where: {
          userId: user.id,
          characterId,
        },
      });
    }
  } catch (error) {
    console.error("Character ownership save failed", error);

    return {
      success: false,
      error: "Unable to save character ownership right now.",
    };
  }

  revalidatePath("/characters");
  revalidatePath(`/characters/${characterId}`);

  return {
    success: true,
    data: {
      characterId,
      owned,
    },
  };
}

export async function cookRecipeAction(
  input: unknown,
): Promise<ActionResponse<CookingData>> {
  const user = await requireUser();
  const parsed = cookRecipeSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid cooking payload.",
    };
  }

  const cookingData = await getCookingData(user.id);
  const recipe = cookingData.recipes.find(
    (item) => item.id === parsed.data.recipeId,
  );

  if (!recipe) {
    return {
      success: false,
      error: "Recipe not found.",
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await applyCookingIngredientInventoryChanges(
        tx,
        user.id,
        recipe.ingredients,
        parsed.data.quantity,
      );

      await tx.cookingProgress.upsert({
        where: {
          userId_recipeId: {
            userId: user.id,
            recipeId: recipe.id,
          },
        },
        update: {
          completedCount: {
            increment: parsed.data.quantity,
          },
        },
        create: {
          userId: user.id,
          recipeId: recipe.id,
          completedCount: parsed.data.quantity,
        },
      });
    });
  } catch (error) {
    console.error("Cook recipe failed", error);

    return {
      success: false,
      error: "Unable to mark that recipe cooked.",
    };
  }

  revalidateDashboardPages();
  return refreshCooking(user.id);
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

  revalidateDashboardPages();
  return refreshDashboard();
}

export async function createGoalFromTemplateAction(
  input: unknown,
): Promise<ActionResponse<DashboardData>> {
  const parsed = input as { type: "character" | "weapon"; templateId: string };

  if (!parsed.type || !parsed.templateId) {
    return {
      success: false,
      error: "Invalid template data.",
    };
  }

  return createGoalsFromTemplatesAction({
    type: parsed.type,
    templateIds: [parsed.templateId],
  });
}

export async function createGoalsFromTemplatesAction(
  input: unknown,
): Promise<ActionResponse<DashboardData>> {
  const user = await requireUser();
  const parsed = createGoalsFromTemplatesSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid template selection.",
    };
  }

  try {
    if (parsed.data.type === "character") {
      for (const templateId of parsed.data.templateIds) {
        const template = getCharacterTemplateById(templateId);
        const character = template?.characterId
          ? getCharacterById(template.characterId)
          : null;

        if (!template || !character) {
          return {
            success: false,
            error: "One or more templates were not found.",
          };
        }

        const goal = await prisma.goal.create({
          data: {
            userId: user.id,
            name: `${character.name} - ${template.name}`,
            description: template.description,
            templateType: "character",
            templateId: template.id,
            category: template.category,
            characterId: template.characterId,
          },
        });

        if (template.materials.length > 0) {
          await prisma.goalMaterial.createMany({
            data: template.materials.map((material) => ({
              goalId: goal.id,
              materialId: material.materialId,
              required: material.required,
            })),
          });
        }
      }
    } else {
      for (const templateId of parsed.data.templateIds) {
        const template = getWeaponTemplateById(templateId);
        const weapon = template?.weaponId
          ? getWeaponById(template.weaponId)
          : null;

        if (!template || !weapon) {
          return {
            success: false,
            error: "One or more templates were not found.",
          };
        }

        const goal = await prisma.goal.create({
          data: {
            userId: user.id,
            name: `${weapon.name} - ${template.name}`,
            description: template.description,
            templateType: "weapon",
            templateId: template.id,
            category: template.category,
          },
        });

        if (template.materials.length > 0) {
          await prisma.goalMaterial.createMany({
            data: template.materials.map((material) => ({
              goalId: goal.id,
              materialId: material.materialId,
              required: material.required,
            })),
          });
        }
      }
    }
  } catch (error) {
    console.error("Goal creation from templates failed", error);

    return {
      success: false,
      error: "Unable to create goals from templates right now.",
    };
  }

  revalidateDashboardPages();
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

  if (!getMaterialById(materialId)) {
    return {
      success: false,
      error: "Material not found.",
    };
  }

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

  revalidateDashboardPages();
  revalidatePath(`/goals/${goalId}`);
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

  revalidateDashboardPages();
  revalidatePath(`/goals/${parsed.data.goalId}`);
  return refreshDashboard();
}

export async function deleteGoalMaterialAction(
  input: unknown,
): Promise<ActionResponse<DashboardData>> {
  const user = await requireUser();
  const parsed = deleteGoalMaterialSchema.safeParse(input);
  let goalIdToRevalidate: string | null = null;

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
        goalId: true,
      },
    });

    if (!goalMaterial) {
      return {
        success: false,
        error: "Requirement not found.",
      };
    }

    goalIdToRevalidate = goalMaterial.goalId;

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

  revalidateDashboardPages();
  if (goalIdToRevalidate) {
    revalidatePath(`/goals/${goalIdToRevalidate}`);
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

export async function createMaterialAction(
  input: unknown,
): Promise<ActionResponse<DashboardData>> {
  await requireMaster();
  void input;
  return {
    success: false,
    error: "Materials are now managed in static data files.",
  };
}

export async function updateMaterialAction(
  input: unknown,
): Promise<ActionResponse<DashboardData>> {
  await requireMaster();
  void input;
  return {
    success: false,
    error: "Materials are now managed in static data files.",
  };
}

export async function createCharacterAction(
  input: unknown,
): Promise<ActionResponse<DashboardData>> {
  await requireMaster();
  void input;
  return {
    success: false,
    error: "Characters are now managed in static data files.",
  };
}

export async function updateCharacterAction(
  input: unknown,
): Promise<ActionResponse<DashboardData>> {
  await requireMaster();
  void input;
  return {
    success: false,
    error: "Characters are now managed in static data files.",
  };
}
