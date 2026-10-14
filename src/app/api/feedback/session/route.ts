import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  FEEDBACK_SESSION_COOKIE,
  FeedbackError,
  feedbackErrorResponse,
  isSameOrigin,
  loginInbox,
  logoutInbox,
  sessionCookieOptions,
} from "@/lib/feedback/server";
import { feedbackErrorMessage } from "@/lib/feedback/types";

export const dynamic = "force-dynamic";

const loginSchema = z.object({
  username: z.string().trim().min(1).max(64),
  password: z.string().min(1).max(200),
});

/** POST /api/feedback/session: sign in to the inbox with a seeded account. */
export async function POST(req: NextRequest) {
  try {
    if (!isSameOrigin(req)) throw new FeedbackError("forbidden", 403);

    const parsed = loginSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) throw new FeedbackError("invalid_login", 401);

    const result = await loginInbox(parsed.data.username, parsed.data.password);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error, message: feedbackErrorMessage(result.error) },
        { status: result.error === "locked" ? 429 : 401 },
      );
    }

    const res = NextResponse.json({ username: result.username });
    res.cookies.set(
      FEEDBACK_SESSION_COOKIE,
      result.token,
      sessionCookieOptions(new Date(result.expiresAt)),
    );
    return res;
  } catch (err) {
    return feedbackErrorResponse(err);
  }
}

/** DELETE /api/feedback/session: sign out (ends the session in the database too). */
export async function DELETE(req: NextRequest) {
  if (!isSameOrigin(req)) return feedbackErrorResponse(new FeedbackError("forbidden", 403));

  const token = req.cookies.get(FEEDBACK_SESSION_COOKIE)?.value;
  if (token) {
    // Sign out locally even if the database can't be reached
    await logoutInbox(token).catch((err) => console.error("[feedback] logout failed:", err));
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(FEEDBACK_SESSION_COOKIE, "", sessionCookieOptions(new Date(0)));
  return res;
}
