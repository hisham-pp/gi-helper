import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  deleteInboxEntry,
  FEEDBACK_SESSION_COOKIE,
  FeedbackError,
  feedbackErrorResponse,
  isSameOrigin,
  updateInboxEntry,
  UUID_PATTERN,
} from "@/lib/feedback/server";
import { FEEDBACK_STATUSES } from "@/lib/feedback/types";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/** Session token and message id for a change, or throws. */
async function authorize(req: NextRequest, { params }: Params) {
  if (!isSameOrigin(req)) throw new FeedbackError("forbidden", 403);
  const token = req.cookies.get(FEEDBACK_SESSION_COOKIE)?.value;
  if (!token) throw new FeedbackError("unauthorized", 401);
  const { id } = await params;
  if (!UUID_PATTERN.test(id)) throw new FeedbackError("not_found", 404);
  return { token, id };
}

const patchSchema = z
  .object({
    status: z.enum(FEEDBACK_STATUSES).optional(),
    hidden: z.boolean().optional(),
  })
  .refine((patch) => patch.status !== undefined || patch.hidden !== undefined);

/** PATCH /api/feedback/inbox/[id]: { status?: "new" | "resolved", hidden?: boolean }. */
export async function PATCH(req: NextRequest, context: Params) {
  try {
    const { token, id } = await authorize(req, context);
    const parsed = patchSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) throw new FeedbackError("invalid_request", 400);

    return NextResponse.json(await updateInboxEntry(token, id, parsed.data));
  } catch (err) {
    return feedbackErrorResponse(err);
  }
}

/** DELETE /api/feedback/inbox/[id]: removes the message and its images. */
export async function DELETE(req: NextRequest, context: Params) {
  try {
    const { token, id } = await authorize(req, context);
    await deleteInboxEntry(token, id);
    return NextResponse.json({ ok: true, id });
  } catch (err) {
    return feedbackErrorResponse(err);
  }
}
