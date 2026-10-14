import dynamic from "next/dynamic";

/*
 * The send form loads on demand and only mounts while open. Call the preload
 * when it's about to be needed (pointer on the button) so the first open
 * doesn't wait for the chunk.
 */

const loadSendFeedbackModal = () => import("./SendFeedbackModal");

export const LazySendFeedbackModal = dynamic(
  () => loadSendFeedbackModal().then((m) => m.SendFeedbackModal),
  { ssr: false },
);

export function preloadSendFeedbackModal(): void {
  // A failed preload is retried by the real open, which surfaces the error.
  loadSendFeedbackModal().catch(() => {});
}
