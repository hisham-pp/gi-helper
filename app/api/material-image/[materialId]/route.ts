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

  const imageUrl = material.image.startsWith("http")
    ? material.image
    : new URL(material.image, request.nextUrl.origin).toString();

  return NextResponse.redirect(imageUrl, {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
