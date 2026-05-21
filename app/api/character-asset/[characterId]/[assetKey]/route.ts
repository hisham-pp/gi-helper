import { readFile } from "node:fs/promises";
import path from "node:path";

import { NextRequest, NextResponse } from "next/server";

import { getCharacterById } from "@/lib/static-data";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ characterId: string; assetKey: string }> },
) {
  const { characterId, assetKey } = await context.params;
  const character = getCharacterById(characterId);

  if (!character) {
    return new NextResponse("Not found", { status: 404 });
  }

  const asset = character.assets?.find((item) => item.key === assetKey);

  if (!asset || asset.path.startsWith("http")) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const normalizedPath = asset.path.replace(/^\/+/, "");
    const imagePath = path.join(process.cwd(), "public", normalizedPath);
    const image = await readFile(imagePath);

    return new NextResponse(image, {
      headers: {
        "Content-Type": getImageContentType(image) ?? "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Character asset proxy failed", error);

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
