import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.inventory.findMany({
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
    }))
  });
}
