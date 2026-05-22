import { NextRequest, NextResponse } from "next/server";

import foodData from "@/data/consumables/food/en.json";

const foodById = foodData as Record<string, unknown>;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ recipeId: string }> },
) {
  const { recipeId } = await context.params;

  if (!foodById[recipeId]) {
    return new NextResponse("Not found", { status: 404 });
  }

  return NextResponse.redirect(
    new URL(`/images/consumables/food/${recipeId}`, request.nextUrl.origin),
    {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    },
  );
}
