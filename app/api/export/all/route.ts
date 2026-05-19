import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [materials, inventory, goals, cookingProgress] = await Promise.all([
    prisma.material.findMany({
      orderBy: [{ category: "asc" }, { rarity: "desc" }, { name: "asc" }],
    }),
    prisma.inventory.findMany({
      where: { userId: user.id },
      orderBy: [{ material: { name: "asc" } }],
    }),
    prisma.goal.findMany({
      where: { userId: user.id },
      include: {
        goalMaterials: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.cookingProgress.findMany({
      where: { userId: user.id },
      orderBy: { recipeId: "asc" },
    }),
  ]);

  return NextResponse.json({
    exportedAt: new Date().toISOString(),
    user: {
      id: user.id,
      username: user.username,
    },
    materials: materials.map((material) => ({
      id: material.id,
      name: material.name,
      image: material.image,
      rarity: material.rarity,
      category: material.category,
      description: material.description,
      combinable: material.combinable,
      combineRatio: material.combineRatio,
      parentMaterialId: material.parentMaterialId,
    })),
    inventory: inventory.map((item) => ({
      materialId: item.materialId,
      quantity: item.quantity,
    })),
    goals: goals.map((goal) => ({
      id: goal.id,
      name: goal.name,
      description: goal.description,
      goalMaterials: goal.goalMaterials.map((entry) => ({
        id: entry.id,
        materialId: entry.materialId,
        required: entry.required,
      })),
    })),
    cookingProgress: cookingProgress.map((item) => ({
      recipeId: item.recipeId,
      completedCount: item.completedCount,
    })),
  });
}
