/**
 * When to ask for feedback after a GOOD export, so it doesn't nag: at most
 * once every 3 days, and not at all within 30 days of this browser sending
 * feedback. Kept in localStorage; if storage is unavailable it just asks.
 */

const STORAGE_KEY = "gi-feedback-prompt";
const DAY_MS = 24 * 60 * 60 * 1000;
const ASK_EVERY_MS = 3 * DAY_MS;
const QUIET_AFTER_SENT_MS = 30 * DAY_MS;

interface PromptState {
  askedAt?: number;
  sentAt?: number;
}

function read(): PromptState {
  try {
    const state = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    return state && typeof state === "object" ? (state as PromptState) : {};
  } catch {
    return {};
  }
}

function write(state: PromptState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Private mode or storage full: the prompt just shows again next time
  }
}

export function shouldAskForFeedback(now = Date.now()): boolean {
  const { askedAt, sentAt } = read();
  if (sentAt !== undefined && now - sentAt < QUIET_AFTER_SENT_MS) return false;
  return askedAt === undefined || now - askedAt >= ASK_EVERY_MS;
}

export function markFeedbackAsked(now = Date.now()): void {
  write({ ...read(), askedAt: now });
}

/** Called by the send form after any message is saved. */
export function markFeedbackSent(now = Date.now()): void {
  write({ ...read(), sentAt: now });
}
