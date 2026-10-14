import type { PublicFeedback } from "@/lib/feedback/types";
import { formatFeedbackDate } from "./feedback-kinds";
import { FeedbackImages } from "./FeedbackImages";

export const ANONYMOUS_NAME = "Anonymous Traveler";

/** Initial for the avatar: first letter of the name, or "?" without one. */
function initialOf(name: string | null): string {
  return name?.trim().charAt(0).toUpperCase() || "?";
}

/** Who sent a message and when; shared by the public cards and the inbox. */
export function FeedbackAuthor({ name, createdAt }: { name: string | null; createdAt: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span
        aria-hidden="true"
        className="glass-chip h-9 w-9 shrink-0 justify-center rounded-full text-sm font-bold text-cyan-300"
      >
        {initialOf(name)}
      </span>
      <div className="min-w-0">
        <p className={`truncate text-sm font-bold ${name ? "text-white" : "text-white/60"}`}>
          {name || ANONYMOUS_NAME}
        </p>
        <time dateTime={createdAt} className="text-[11px] text-white/50">
          {formatFeedbackDate(createdAt)}
        </time>
      </div>
    </div>
  );
}

/** One public feedback post. */
export function FeedbackCard({ feedback }: { feedback: PublicFeedback }) {
  return (
    <article className="glass-card p-5">
      <FeedbackAuthor name={feedback.name} createdAt={feedback.createdAt} />
      <p className="mt-3 whitespace-pre-line break-words text-sm leading-relaxed text-white/85">
        {feedback.message}
      </p>
      <FeedbackImages ids={feedback.images} />
    </article>
  );
}
