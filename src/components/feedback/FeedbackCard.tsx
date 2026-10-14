import { characterAvatarUrl, getCharacter } from "@/lib/characters";
import type { PublicFeedback } from "@/lib/feedback/types";
import { formatFeedbackDate } from "./feedback-kinds";
import { FeedbackImages } from "./FeedbackImages";

export const ANONYMOUS_NAME = "Anonymous Traveler";

/** Initial for the avatar: first letter of the name, or "?" without one. */
function initialOf(name: string | null): string {
  return name?.trim().charAt(0).toUpperCase() || "?";
}

/** Round character avatar, or the name's initial without one. */
export function FeedbackAvatar({
  avatar,
  name,
  className = "h-9 w-9 text-sm",
}: {
  avatar: string | null;
  name: string | null;
  className?: string;
}) {
  // Only ids still in the character list, so a removed character falls back cleanly
  const character = getCharacter(avatar);
  return (
    <span
      aria-hidden="true"
      className={`glass-chip shrink-0 justify-center overflow-hidden rounded-full p-0 font-bold text-cyan-300 ${className}`}
    >
      {character ? (
        <img
          src={characterAvatarUrl(character.id)}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      ) : (
        initialOf(name)
      )}
    </span>
  );
}

/** Who sent a message and when; shared by the public cards and the inbox. */
export function FeedbackAuthor({
  name,
  avatar,
  createdAt,
}: {
  name: string | null;
  avatar: string | null;
  createdAt: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <FeedbackAvatar avatar={avatar} name={name} />
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
      <FeedbackAuthor
        name={feedback.name}
        avatar={feedback.avatar}
        createdAt={feedback.createdAt}
      />
      <p className="mt-3 whitespace-pre-line break-words text-sm leading-relaxed text-white/85">
        {feedback.message}
      </p>
      <FeedbackImages ids={feedback.images} />
    </article>
  );
}
