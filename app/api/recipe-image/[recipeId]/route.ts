import { readFile } from "node:fs/promises";
import path from "node:path";

import { NextRequest, NextResponse } from "next/server";

import foodData from "@/data/consumables/food/en.json";

const foodById = foodData as Record<string, unknown>;

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ recipeId: string }> },
) {
  const { recipeId } = await context.params;

  if (!foodById[recipeId]) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const imagePath = path.join(
      process.cwd(),
      "public",
      "images",
      "consumables",
      "food",
      recipeId,
    );
    const image = await readFile(imagePath);

    return new NextResponse(image, {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Type": "image/png",
      },
    });
  } catch (error) {
    console.error("Recipe image proxy failed", error);

    return new NextResponse("Image unavailable", { status: 404 });
  }
}
