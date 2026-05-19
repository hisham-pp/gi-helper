import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ characterId: string }> },
) {
  const { characterId } = await context.params;

  const character = await prisma.character.findUnique({
    where: {
      id: characterId,
    },
    select: {
      image: true,
    },
  });

  if (!character) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const imageUrl = character.image.startsWith("http")
      ? character.image
      : new URL(character.image, request.nextUrl.origin).toString();

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
    const contentType =
      getImageContentType(arrayBuffer) ??
      response.headers.get("content-type") ??
      "image/png";

    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Character image proxy failed", error);

    return new NextResponse("Unable to fetch image", {
      status: 500,
    });
  }
}

function getImageContentType(arrayBuffer: ArrayBuffer) {
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
