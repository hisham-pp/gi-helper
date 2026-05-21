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
        "Content-Type": getImageContentType(image) ?? "image/png",
      },
    });
  } catch (error) {
    console.error("Recipe image proxy failed", error);

    return new NextResponse("Image unavailable", { status: 404 });
  }
}

function getImageContentType(arrayBuffer: ArrayBuffer | Buffer) {
  const bytes = new Uint8Array(arrayBuffer.slice(0, 12));

  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "image/png";
  }

  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }

  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }

  return null;
}
