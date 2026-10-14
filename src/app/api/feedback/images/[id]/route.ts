import { NextRequest, NextResponse } from "next/server";
import {
  FEEDBACK_SESSION_COOKIE,
  feedbackErrorResponse,
  getFeedbackImage,
  UUID_PATTERN,
} from "@/lib/feedback/server";

export const dynamic = "force-dynamic";

const NOT_FOUND = () =>
  new NextResponse(null, { status: 404, headers: { "Cache-Control": "no-store" } });

/**
 * GET /api/feedback/images/[id]: an attached image. Images on public feedback
 * are open to everyone; the rest need the inbox session cookie.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID_PATTERN.test(id)) return NOT_FOUND();

  try {
    const image = await getFeedbackImage(id, req.cookies.get(FEEDBACK_SESSION_COOKIE)?.value);
    if (!image) return NOT_FOUND();

    // An id's bytes never change, so the id is the ETag
    const etag = `"${id}"`;
    const headers = {
      // Short shared cache refreshed in the background, so hiding a message
      // takes the image down within minutes (the server cache drops it at once)
      "Cache-Control": image.isPublic
        ? "public, max-age=300, s-maxage=300, stale-while-revalidate=3600"
        : "private, no-store",
      ...(image.isPublic ? { ETag: etag } : {}),
      "X-Content-Type-Options": "nosniff",
    };

    // Still public and the browser has it: no need to send the bytes again
    if (image.isPublic && req.headers.get("if-none-match") === etag) {
      return new NextResponse(null, { status: 304, headers });
    }

    return new NextResponse(image.bytes, {
      headers: {
        ...headers,
        "Content-Type": image.mime,
        "Content-Length": String(image.bytes.byteLength),
        "Content-Disposition": "inline",
        "Content-Security-Policy": "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'",
      },
    });
  } catch (err) {
    return feedbackErrorResponse(err);
  }
}
