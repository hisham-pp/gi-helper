import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ShellLink } from "@/components/layout/ShellLink";
import { MessagesSquare } from "lucide-react";
import { FeedbackInbox } from "@/components/feedback/FeedbackInbox";
import { InboxLogin } from "@/components/feedback/InboxLogin";
import {
  FEEDBACK_SESSION_COOKIE,
  getInboxUser,
  isFeedbackConfigured,
} from "@/lib/feedback/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Feedback Inbox",
  description: "Private inbox for GI Helper bug reports, ideas and messages.",
  robots: { index: false, follow: false },
};

/**
 * Private inbox: seeded accounts only (see docs/feedback.md). Shows the
 * sign-in form until the session cookie belongs to a live session.
 */
export default async function FeedbackInboxPage() {
  if (!isFeedbackConfigured()) {
    return (
      <div className="flex w-full flex-1 flex-col items-center justify-center px-4 py-10">
        <div className="glass-card glass-card--lg flex w-full max-w-md flex-col items-center p-10 text-center">
          <div className="glass-lens mb-4 h-16 w-16 text-white/50">
            <MessagesSquare className="h-8 w-8" />
          </div>
          <h1 className="text-lg font-bold text-white">Feedback is offline</h1>
          <p className="mt-1 text-xs text-white/60">
            Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY on the server to use the inbox.
          </p>
          <ShellLink href="/feedback" className="glass-btn mt-5 px-5 py-2 text-xs">
            Back to Feedback
          </ShellLink>
        </div>
      </div>
    );
  }

  const token = (await cookies()).get(FEEDBACK_SESSION_COOKIE)?.value;
  // If the database can't be reached, the sign-in form reports it
  const user = await getInboxUser(token).catch(() => null);

  return user ? <FeedbackInbox username={user.username} /> : <InboxLogin />;
}
