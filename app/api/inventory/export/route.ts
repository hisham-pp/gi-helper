import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await prisma.inventory.findMany({
    where: {
      userId: user.id
    },
    include: {
      material: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: {
      material: {
        name: "asc"
      }
    }
  });

  return NextResponse.json({
    exportedAt: new Date().toISOString(),
    items: items.map((item) => ({
      materialId: item.materialId,
      materialName: item.material.name,
      quantity: item.quantity
    })),
    username: user.username
  });
}
