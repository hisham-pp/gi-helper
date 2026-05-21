import { readFile } from "node:fs/promises";
import path from "node:path";

import { NextRequest, NextResponse } from "next/server";

import { getCharacterById } from "@/lib/static-data";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ characterId: string }> },
) {
  const { characterId } = await context.params;

  const character = getCharacterById(characterId);

  if (!character) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    if (!character.image.startsWith("http")) {
      const image = await readPublicImage(character.image);

      return new NextResponse(image, {
        headers: imageHeaders(image),
      });
    }

    const imageUrl = new URL(
      character.image,
      request.nextUrl.origin,
    ).toString();
    const response = await fetch(imageUrl, {
      cache: "force-cache",
      next: {
        revalidate: 86400,
      },
    });

    if (!response.ok) {
      return new NextResponse("Image unavailable", { status: 502 });
    }

    const arrayBuffer = await response.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      headers: {
        ...imageHeaders(arrayBuffer),
        "Content-Type":
          getImageContentType(arrayBuffer) ??
          response.headers.get("content-type") ??
          "image/png",
      },
    });
  } catch (error) {
    console.error("Character image proxy failed", error);

    return new NextResponse("Unable to fetch image", {
      status: 500,
    });
  }
}

async function readPublicImage(imagePath: string) {
  const normalizedPath = imagePath.replace(/^\/+/, "");
  const absolutePath = path.join(process.cwd(), "public", normalizedPath);

  return readFile(absolutePath);
}

function imageHeaders(image: ArrayBuffer | Buffer) {
  return {
    "Content-Type": getImageContentType(image) ?? "image/png",
    "Cache-Control": "public, max-age=31536000, immutable",
  };
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
