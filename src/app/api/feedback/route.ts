import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { detectImageType } from "@/lib/feedback/images";
import {
  clientIp,
  FeedbackError,
  feedbackErrorResponse,
  listPublicFeedback,
  parsePage,
  submitFeedback,
} from "@/lib/feedback/server";
import { FEEDBACK_KINDS, FEEDBACK_LIMITS } from "@/lib/feedback/types";

export const dynamic = "force-dynamic";

/** GET /api/feedback?page=N: public feedback, newest first. */
export async function GET(req: NextRequest) {
  try {
    const data = await listPublicFeedback(parsePage(req.nextUrl.searchParams.get("page")));
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    return feedbackErrorResponse(err);
  }
}

const submissionSchema = z.object({
  kind: z.enum(FEEDBACK_KINDS, { message: "invalid_kind" }),
  name: z.string().trim().max(FEEDBACK_LIMITS.nameMax, "invalid_name"),
  message: z
    .string()
    .trim()
    .min(FEEDBACK_LIMITS.messageMin, "invalid_message")
    .max(FEEDBACK_LIMITS.messageMax, "invalid_message"),
});

/**
 * POST /api/feedback (multipart): kind, name, avatar (character id), message
 * and up to 3 `images`.
 * Bad words are masked before saving; only "feedback" is listed publicly.
 */
export async function POST(req: NextRequest) {
  try {
    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      throw new FeedbackError("invalid_request", 400);
    }

    // Hidden field only bots fill in; act as if it worked
    if (String(form.get("website") ?? "").trim()) {
      return NextResponse.json({ ok: true });
    }

    const parsed = submissionSchema.safeParse({
      kind: form.get("kind"),
      name: form.get("name") ?? "",
      message: form.get("message") ?? "",
    });
    if (!parsed.success) {
      throw new FeedbackError(parsed.error.issues[0]?.message ?? "invalid_request", 400);
    }

    const files = form.getAll("images").filter((value): value is File => typeof value !== "string");
    if (files.length > FEEDBACK_LIMITS.images) {
      throw new FeedbackError("too_many_images", 400);
    }

    const images: Uint8Array[] = [];
    for (const file of files) {
      if (file.size > FEEDBACK_LIMITS.imageBytes) {
        throw new FeedbackError("image_too_large", 413);
      }
      const bytes = new Uint8Array(await file.arrayBuffer());
      if (!detectImageType(bytes)) {
        throw new FeedbackError("invalid_image", 400);
      }
      images.push(bytes);
    }

    const avatar = form.get("avatar");
    const { id } = await submitFeedback({
      ...parsed.data,
      avatar: typeof avatar === "string" ? avatar : null,
      images,
      userAgent: req.headers.get("user-agent"),
      ip: clientIp(req),
    });
    return NextResponse.json({ ok: true, id, kind: parsed.data.kind });
  } catch (err) {
    return feedbackErrorResponse(err);
  }
}
