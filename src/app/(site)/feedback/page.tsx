import { FeedbackBoard } from "@/components/feedback/FeedbackBoard";
import { isFeedbackConfigured, listPublicFeedback } from "@/lib/feedback/server";
import type { PublicFeedbackPage } from "@/lib/feedback/types";
import { pageMetadata } from "@/lib/seo";

// New posts show up on the next visit
export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Feedback",
  description:
    "What travelers think of GI Helper, the Genshin Impact inventory scanner. Share your feedback, report a bug or suggest an idea.",
  path: "/feedback",
});

export default async function FeedbackPage() {
  const available = isFeedbackConfigured();
  let initial: PublicFeedbackPage | null = null;
  if (available) {
    try {
      initial = await listPublicFeedback(1);
    } catch (err) {
      // The board shows a retry instead
      console.error("[feedback] couldn't load the first page:", err);
    }
  }

  return <FeedbackBoard initial={initial} available={available} />;
}
