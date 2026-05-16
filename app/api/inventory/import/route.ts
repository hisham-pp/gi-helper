import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { inventoryImportSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = inventoryImportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid import payload." }, { status: 400 });
    }

    await prisma.$transaction(
      parsed.data.items.map((item) =>
        prisma.inventory.upsert({
          where: {
            materialId: item.materialId
          },
          update: {
            quantity: item.quantity
          },
          create: {
            materialId: item.materialId,
            quantity: item.quantity
          }
        })
      )
    );

    return NextResponse.json({
      success: true,
      importedCount: parsed.data.items.length
    });
  } catch (error) {
    console.error("Inventory import failed", error);

    return NextResponse.json({ error: "Unable to import inventory data." }, { status: 500 });
  }
}
