import { NextRequest, NextResponse } from "next/server";
import {
  FEEDBACK_SESSION_COOKIE,
  FeedbackError,
  feedbackErrorResponse,
  listInbox,
  parsePage,
} from "@/lib/feedback/server";
import {
  FEEDBACK_KINDS,
  FEEDBACK_STATUSES,
  type FeedbackKind,
  type FeedbackStatus,
} from "@/lib/feedback/types";

export const dynamic = "force-dynamic";

/** GET /api/feedback/inbox?kind=&status=&page=: every message (inbox session required). */
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(FEEDBACK_SESSION_COOKIE)?.value;
    if (!token) throw new FeedbackError("unauthorized", 401);

    const params = req.nextUrl.searchParams;
    const kind = params.get("kind");
    const status = params.get("status");

    const data = await listInbox(token, {
      kind: FEEDBACK_KINDS.includes(kind as FeedbackKind) ? (kind as FeedbackKind) : null,
      status: FEEDBACK_STATUSES.includes(status as FeedbackStatus)
        ? (status as FeedbackStatus)
        : null,
      page: parsePage(params.get("page")),
    });
    return NextResponse.json(data, { headers: { "Cache-Control": "private, no-store" } });
  } catch (err) {
    return feedbackErrorResponse(err);
  }
}
