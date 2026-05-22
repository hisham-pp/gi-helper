import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { getMaterialById } from "@/lib/static-data";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ materialId: string }> },
) {
  const { materialId } = await context.params;

  const material = getMaterialById(materialId);

  if (!material) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    if (!material.image.startsWith("http")) {
      const publicDir = path.join(process.cwd(), "public");
      const imagePath = path.normalize(
        path.join(publicDir, material.image.replace(/^\/+/, "")),
      );
      const relativeImagePath = path.relative(publicDir, imagePath);

      if (
        relativeImagePath.startsWith("..") ||
        path.isAbsolute(relativeImagePath)
      ) {
        return new NextResponse("Invalid image path", { status: 400 });
      }

      const image = await readFile(imagePath);

      return new NextResponse(image, {
        headers: {
          "Content-Type": getImageContentType(image) ?? "image/png",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    const imageUrl = material.image.startsWith("http")
      ? material.image
      : new URL(material.image, request.nextUrl.origin).toString();

    const response = await fetch(imageUrl, {
      cache: "force-cache",
      next: {
        revalidate: 86400,
      },
    });

    if (!response.ok) {
      return new NextResponse("Image unavailable", { status: 502 });
    }

    const contentType = response.headers.get("content-type") ?? "image/png";
    const arrayBuffer = await response.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Material image proxy failed", error);

    return new NextResponse("Unable to fetch image", {
      status: 500,
    });
  }
}

function getImageContentType(image: Buffer) {
  if (
    image[0] === 0x89 &&
    image[1] === 0x50 &&
    image[2] === 0x4e &&
    image[3] === 0x47
  ) {
    return "image/png";
  }

  if (image[0] === 0xff && image[1] === 0xd8 && image[2] === 0xff) {
    return "image/jpeg";
  }

  if (image.subarray(0, 4).toString("ascii") === "RIFF") {
    return "image/webp";
  }

  return null;
}
