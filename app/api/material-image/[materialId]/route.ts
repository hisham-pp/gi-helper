import { NextRequest, NextResponse } from "next/server";

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
