import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  const ownedCharacterIds = user
    ? await prisma.ownedCharacter.findMany({
        where: {
          userId: user.id,
        },
        select: {
          characterId: true,
        },
      })
    : [];

  return NextResponse.json(
    {
      ownedCharacterIds: ownedCharacterIds.map((item) => item.characterId),
      user: user
        ? {
            username: user.username,
            role: user.role,
          }
        : null,
    },
    {
      headers: {
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    },
  );
}
