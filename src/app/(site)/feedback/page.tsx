import { FeedbackBoard } from "@/components/feedback/FeedbackBoard";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Feedback",
  description:
    "What travelers think of GI Helper, the Genshin Impact inventory scanner. Share your feedback, report a bug or suggest an idea.",
  path: "/feedback",
});

/**
 * Static shell, so navigating here is instant (no database round trip before
 * the page shows); FeedbackBoard loads the posts in the browser.
 */
export default function FeedbackPage() {
  return <FeedbackBoard />;
}
