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

    return new NextResponse(image.bytes, {
      headers: {
        "Content-Type": image.mime,
        "Content-Length": String(image.bytes.byteLength),
        // Short shared cache, so hiding a message takes the image down soon after
        "Cache-Control": image.isPublic ? "public, max-age=600, s-maxage=600" : "private, no-store",
        "Content-Disposition": "inline",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'",
      },
    });
  } catch (err) {
    return feedbackErrorResponse(err);
  }
}
