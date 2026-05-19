import { readFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

const publicImagesRoot = path.join(process.cwd(), "public", "images");

type RouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { path: pathSegments } = await context.params;
  const filePath = path.resolve(publicImagesRoot, ...pathSegments);

  if (
    filePath !== publicImagesRoot &&
    !filePath.startsWith(`${publicImagesRoot}${path.sep}`)
  ) {
    return new NextResponse("Invalid image path", { status: 400 });
  }

  try {
    const body = await readFile(filePath);
    const contentType = getImageContentType(body);

    if (!contentType) {
      return new NextResponse("Unsupported image type", { status: 415 });
    }

    return new NextResponse(body, {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Type": contentType,
      },
    });
  } catch {
    return new NextResponse("Image not found", { status: 404 });
  }
}

function getImageContentType(body: Buffer) {
  if (
    body[0] === 0x89 &&
    body[1] === 0x50 &&
    body[2] === 0x4e &&
    body[3] === 0x47
  ) {
    return "image/png";
  }

  if (
    body.subarray(0, 4).toString("ascii") === "RIFF" &&
    body.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp";
  }

  if (body[0] === 0xff && body[1] === 0xd8 && body[2] === 0xff) {
    return "image/jpeg";
  }

  return null;
}
