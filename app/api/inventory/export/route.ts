import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getMaterialById } from "@/lib/static-data";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await prisma.inventory.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      materialId: "asc",
    },
  });

  return NextResponse.json({
    exportedAt: new Date().toISOString(),
    items: items.map((item) => ({
      materialId: item.materialId,
      materialName: getMaterialById(item.materialId)?.name ?? item.materialId,
      quantity: item.quantity,
    })),
    username: user.username,
  });
}
