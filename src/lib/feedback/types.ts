/**
 * Shared shapes and limits for the feedback page (/feedback) and the private
 * inbox (/feedback/inbox). Safe to import from client and server code.
 * The database enforces the same limits (supabase/migrations/*_feedback.sql).
 */

export const FEEDBACK_KINDS = ["feedback", "bug", "idea", "other"] as const;
export type FeedbackKind = (typeof FEEDBACK_KINDS)[number];

/** Only this kind is listed publicly; the others are read in the inbox. */
export const PUBLIC_FEEDBACK_KIND: FeedbackKind = "feedback";

export const FEEDBACK_STATUSES = ["new", "resolved"] as const;
export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number];

export const FEEDBACK_LIMITS = {
  nameMax: 40,
  messageMin: 3,
  messageMax: 2000,
  images: 3,
  /** Upload limit per image, after the browser shrinks it. */
  imageBytes: 1.5 * 1024 * 1024,
} as const;

export const PUBLIC_FEEDBACK_PAGE_SIZE = 12;
export const INBOX_PAGE_SIZE = 20;

export interface PublicFeedback {
  id: string;
  name: string | null;
  /** Character id for the avatar (src/data/characters.json), or null. */
  avatar: string | null;
  message: string;
  /** ISO timestamp. */
  createdAt: string;
  /** Image ids, served by /api/feedback/images/[id]. */
  images: string[];
}

export interface PublicFeedbackPage {
  items: PublicFeedback[];
  total: number;
  page: number;
  pageSize: number;
}

export interface InboxEntry extends PublicFeedback {
  kind: FeedbackKind;
  status: FeedbackStatus;
  /** Hidden feedback is left out of the public list. */
  hidden: boolean;
  appVersion: string | null;
  userAgent: string | null;
}

export interface InboxPage {
  items: InboxEntry[];
  total: number;
  /** Messages per kind for the current status filter. */
  counts: Record<FeedbackKind | "all", number>;
  page: number;
  pageSize: number;
}

/** Error codes from the feedback API, as shown to people. */
const ERROR_MESSAGES: Record<string, string> = {
  not_configured: "Feedback isn't set up on this server yet.",
  unavailable: "Couldn't reach the feedback service. Please try again in a moment.",
  invalid_request: "Something's wrong with that request. Please reload and try again.",
  invalid_kind: "Pick what kind of message this is.",
  invalid_message: `Write a message of ${FEEDBACK_LIMITS.messageMin} to ${FEEDBACK_LIMITS.messageMax} characters.`,
  invalid_name: `Keep your name under ${FEEDBACK_LIMITS.nameMax} characters.`,
  too_many_images: `Attach up to ${FEEDBACK_LIMITS.images} images.`,
  image_too_large: "One of the images is too large.",
  invalid_image: "Images must be PNG, JPEG or WebP.",
  rate_limited: "You're sending messages quickly. Please wait a few minutes and try again.",
  unauthorized: "Your inbox session has ended. Please sign in again.",
  invalid_login: "Wrong username or password.",
  locked: "Too many wrong passwords. Try again in 15 minutes.",
  not_found: "That message no longer exists.",
  forbidden: "That request came from another site.",
};

export function feedbackErrorMessage(code: string | undefined): string {
  return (code && ERROR_MESSAGES[code]) || ERROR_MESSAGES.unavailable;
}
